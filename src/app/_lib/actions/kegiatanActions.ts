// src/app/_lib/actions/kegiatanActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  handlePrismaUniqueViolation,
  validateServerActionPayload,
} from "@/lib/validateServerActionPayload";
import { join } from "path";
import {
  readFileSync,
  unlinkSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from "fs";
import { generateSafeFilename } from "@/hooks/use-safe-filename";

import {
  addCatatanSchema,
  TAddCatatan,
  tambahKegiatanSchema,
  TTambahKegiatan,
} from "@/schema/kegiatan/TambahKegiatanSchema";
import { createNotifikasi } from "./notifikasiAction";
import {
  editKegiatanSchema,
  TEditKegiatan,
  TUpdateStatusKegiatan,
  updateStatusKegiatanSchema,
} from "@/schema/kegiatan/UpdateKegiatanSchema";
import { JenisKegiatanField } from "@/generated/prisma";
import { auth } from "@/config/auth";
// import { auth } from "@/config/auth"; // Tidak perlu import auth di sini, pengajuId datang dari payload

const UPLOAD_DIR = join(process.cwd(), "public/lampiran");

// Pastikan direktori upload ada
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper untuk menghapus file lampiran (fisik dari storage)
async function deleteKegiatanLampiranFile(namaFile: string) {
  const filePath = join(UPLOAD_DIR, namaFile);
  if (existsSync(filePath)) {
    try {
      unlinkSync(filePath);
      console.log(`[FILE] File lampiran dihapus fisik: ${filePath}`);
    } catch (unlinkError) {
      console.error(
        `[FILE ERROR] Gagal menghapus file fisik ${filePath}:`,
        unlinkError
      );
    }
  }
}

export async function tambahKegiatan(payload: TTambahKegiatan) {
  const session = await auth();

  const validationResult = await validateServerActionPayload(
    payload,
    tambahKegiatanSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Data tidak valid setelah validasi." };

  const {
    mata_kuliahId,
    pengajuId,
    jenisKegiatanId,
    lampiran,
    status,
    fieldValues,
  } = validationResult.data; // pengajuId sekarang dari payload

  try {
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { penggunaId: pengajuId }, // Cari Mahasiswa berdasarkan penggunaId yang diterima
      select: {
        id: true,
        pengguna: { select: { nama: true, programStudiId: true } },
      },
    });
    if (!mahasiswa)
      return {
        success: false,
        message: "Pengguna bukan seorang Mahasiswa atau tidak terdaftar.",
      };
    if (!mahasiswa.pengguna.programStudiId)
      return {
        success: false,
        message: "Mahasiswa belum memiliki Program Studi.",
      };

    let logbook = await prisma.logbook.findFirst({
      where: { penggunaId: pengajuId }, // Cari logbook berdasarkan penggunaId
    });
    if (!logbook) {
      logbook = await prisma.logbook.create({
        data: { mahasiswaId: mahasiswa.id, penggunaId: pengajuId },
      });
    }

    // 1. Ambil JenisKegiatan untuk validasi isMataKuliahRequired dan field definitions
    const jenisKegiatan = await prisma.jenisKegiatan.findUnique({
      where: { id: jenisKegiatanId },
      select: {
        id: true,
        isMataKuliahRequired: true,
        nama: true,
        fields: true,
      },
    });
    if (!jenisKegiatan) {
      return { success: false, message: "Jenis Kegiatan tidak ditemukan." };
    }

    // 2. Validasi mata_kuliahId berdasarkan isMataKuliahRequired
    const parsedMataKuliahId = mata_kuliahId ? parseInt(mata_kuliahId) : null;
    if (jenisKegiatan.isMataKuliahRequired && parsedMataKuliahId === null) {
      return {
        success: false,
        message: "Mata Kuliah wajib diisi untuk Jenis Kegiatan ini.",
      };
    }
    // Jika mata kuliah tidak wajib, pastikan parsedMataKuliahId adalah null jika tidak ada input
    if (!jenisKegiatan.isMataKuliahRequired && parsedMataKuliahId !== null) {
      // Opsional: Validasi lebih lanjut jika Anda ingin melarang mata kuliah jika tidak wajib
    }

    // 3. Validasi Field Kustom (fieldValues)
    const fieldDefinitions = jenisKegiatan.fields;
    const fieldDefMap = new Map<string, JenisKegiatanField>();
    fieldDefinitions.forEach((f) => fieldDefMap.set(f.id, f));

    const valuesToCreate: { jenisKegiatanFieldId: string; value: string }[] =
      [];

    if (fieldValues) {
      for (const fieldValuePayload of fieldValues) {
        const fieldDef = fieldDefMap.get(
          fieldValuePayload.jenisKegiatanFieldId
        );
        if (!fieldDef) {
          console.warn(
            `[VALIDATION WARNING] Field definition for ID ${fieldValuePayload.jenisKegiatanFieldId} not found.`
          );
          continue;
        }

        let valueToSave: string | null = null;
        if (
          fieldValuePayload.value === null ||
          fieldValuePayload.value === undefined ||
          (typeof fieldValuePayload.value === "string" &&
            fieldValuePayload.value.trim() === "")
        ) {
          if (fieldDef.isRequired) {
            return {
              success: false,
              message: `Field '${fieldDef.fieldName}' wajib diisi.`,
            };
          }
          valueToSave = null;
        } else {
          switch (fieldDef.fieldType) {
            case "NUMBER":
              const numValue = Number(fieldValuePayload.value);
              if (isNaN(numValue)) {
                return {
                  success: false,
                  message: `Field '${fieldDef.fieldName}' harus berupa angka yang valid.`,
                };
              }
              valueToSave = String(numValue);
              break;
            case "DATE":
              const dateValue = new Date(fieldValuePayload.value);
              if (isNaN(dateValue.getTime())) {
                return {
                  success: false,
                  message: `Field '${fieldDef.fieldName}' harus berupa tanggal yang valid.`,
                };
              }
              valueToSave = dateValue.toISOString();
              break;
            case "BOOLEAN":
              valueToSave = String(!!fieldValuePayload.value);
              break;
            default: // TEXT, TEXTAREA
              valueToSave = String(fieldValuePayload.value);
              break;
          }
        }

        if (valueToSave !== null) {
          valuesToCreate.push({
            jenisKegiatanFieldId: fieldDef.id,
            value: valueToSave,
          });
        }
      }
    }

    // 4. Buat Kegiatan
    const newKegiatan = await prisma.kegiatan.create({
      data: {
        logbookId: logbook.id,
        mataKuliahId: parsedMataKuliahId, // Bisa null
        jenisKegiatanId: jenisKegiatan.id,
        semester: session?.user.semester ?? null,
        status: status || "DIAJUKAN",
      },
    });

    // 5. Buat FieldKegiatanValues
    if (valuesToCreate.length > 0) {
      await prisma.fieldKegiatanValues.createMany({
        data: valuesToCreate.map((fv) => ({
          ...fv,
          kegiatanId: newKegiatan.id,
        })),
      });
    }

    // 6. Upload Lampiran
    if (lampiran && lampiran.length > 0) {
      console.log(
        `[UPLOAD] Memproses ${lampiran.length} lampiran untuk kegiatan baru...`
      );
      try {
        const lampiranData = await Promise.all(
          lampiran.map(async (file) => {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = generateSafeFilename(file.name);
            const uploadPath = join(UPLOAD_DIR, filename);
            writeFileSync(uploadPath, buffer);
            return { namaFile: filename, url: `/lampiran/${filename}` };
          })
        );
        await prisma.lampiran.createMany({
          data: lampiranData.map((data) => ({
            ...data,
            kegiatanId: newKegiatan.id,
          })),
        });
        console.log(
          `[UPLOAD] ${lampiran.length} entri lampiran berhasil ditambahkan ke database.`
        );
      } catch (uploadError) {
        console.error(
          "[UPLOAD ERROR] Error saat memproses lampiran:",
          uploadError
        );
        return {
          success: false,
          message: `Gagal mengunggah lampiran: ${
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError)
          }`,
        };
      }
    }

    revalidatePath("/admin/kegiatan");
    revalidatePath(`/admin/kegiatan/detail/${newKegiatan.id}`);

    const judulKegiatanFromFields =
      fieldValues?.find(
        (fv) =>
          fieldDefMap
            .get(fv.jenisKegiatanFieldId)
            ?.templateKey?.toLowerCase() === "judul"
      )?.value || jenisKegiatan.nama;
    createNotifikasi({
      judul: "Pengajuan Kegiatan Baru",
      penggunaId: pengajuId, // Gunakan pengajuId yang sudah didapatkan
      pesan: `Mahasiswa ${mahasiswa.pengguna.nama} mengajukan kegiatan "${judulKegiatanFromFields}". Mohon direview.`,
    });

    return {
      success: true,
      data: newKegiatan,
      message: "Kegiatan berhasil ditambahkan.",
    };
  } catch (error) {
    console.error("Error in tambahKegiatan:", error);
    return handlePrismaUniqueViolation(error);
  }
}

export async function editKegiatan(payload: TEditKegiatan) {
  const validationResult = await validateServerActionPayload(
    payload,
    editKegiatanSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Data tidak valid setelah validasi." };

  const { id, mata_kuliahId, status, fieldValues, lampiran } =
    validationResult.data;

  try {
    const existingKegiatan = await prisma.kegiatan.findUnique({
      where: { id: id },
      select: {
        jenisKegiatanId: true,
        logbookId: true,
        // Dapatkan pengajuId melalui logbook relasi untuk notifikasi
        logbook: {
          select: {
            penggunaId: true,
          },
        },
      },
    });
    if (!existingKegiatan) {
      return {
        success: false,
        message: "Kegiatan tidak ditemukan untuk diedit.",
      };
    }
    // const pengajuId = existingKegiatan.logbook?.penggunaId; // Ini akan dibutuhkan jika notifikasi edit kegiatan

    const jenisKegiatan = await prisma.jenisKegiatan.findUnique({
      where: { id: existingKegiatan.jenisKegiatanId },
      select: {
        id: true,
        isMataKuliahRequired: true,
        nama: true,
        fields: true,
      },
    });
    if (!jenisKegiatan) {
      return {
        success: false,
        message: "Jenis Kegiatan terkait tidak ditemukan.",
      };
    }

    const parsedMataKuliahId = mata_kuliahId ? parseInt(mata_kuliahId) : null;
    if (jenisKegiatan.isMataKuliahRequired && parsedMataKuliahId === null) {
      return {
        success: false,
        message: "Mata Kuliah wajib diisi untuk Jenis Kegiatan ini.",
      };
    }

    const fieldDefinitions = jenisKegiatan.fields;
    const fieldDefMap = new Map<string, JenisKegiatanField>();
    fieldDefinitions.forEach((f) => fieldDefMap.set(f.id, f));

    const valuesToUpsert: {
      jenisKegiatanFieldId: string;
      value: string;
      kegiatanId: string;
    }[] = [];

    if (fieldValues) {
      for (const fieldValuePayload of fieldValues) {
        const fieldDef = fieldDefMap.get(
          fieldValuePayload.jenisKegiatanFieldId
        );
        if (!fieldDef) {
          console.warn(
            `[VALIDATION WARNING] Field definition for ID ${fieldValuePayload.jenisKegiatanFieldId} not found during edit.`
          );
          continue;
        }

        let valueToSave: string | null = null;
        if (
          fieldValuePayload.value === null ||
          fieldValuePayload.value === undefined ||
          (typeof fieldValuePayload.value === "string" &&
            fieldValuePayload.value.trim() === "")
        ) {
          if (fieldDef.isRequired) {
            return {
              success: false,
              message: `Field '${fieldDef.fieldName}' wajib diisi.`,
            };
          }
          valueToSave = null;
        } else {
          switch (fieldDef.fieldType) {
            case "NUMBER":
              const numValue = Number(fieldValuePayload.value);
              if (isNaN(numValue)) {
                return {
                  success: false,
                  message: `Field '${fieldDef.fieldName}' harus berupa angka yang valid.`,
                };
              }
              valueToSave = String(numValue);
              break;
            case "DATE":
              const dateValue = new Date(fieldValuePayload.value);
              if (isNaN(dateValue.getTime())) {
                return {
                  success: false,
                  message: `Field '${fieldDef.fieldName}' harus berupa tanggal yang valid.`,
                };
              }
              valueToSave = dateValue.toISOString();
              break;
            case "BOOLEAN":
              valueToSave = String(!!fieldValuePayload.value);
              break;
            default:
              valueToSave = String(fieldValuePayload.value);
              break;
          }
        }

        if (valueToSave !== null) {
          valuesToUpsert.push({
            jenisKegiatanFieldId: fieldDef.id,
            value: valueToSave,
            kegiatanId: id,
          });
        }
      }
    }

    // Delete existing FieldKegiatanValues for this activity (simplest way to handle updates for many fields)
    await prisma.fieldKegiatanValues.deleteMany({ where: { kegiatanId: id } });
    if (valuesToUpsert.length > 0) {
      await prisma.fieldKegiatanValues.createMany({ data: valuesToUpsert });
    }

    const updatedKegiatan = await prisma.kegiatan.update({
      where: { id },
      data: { mataKuliahId: parsedMataKuliahId, status },
    });

    if (lampiran && lampiran.length > 0) {
      console.log(
        `[UPLOAD] Memproses ${lampiran.length} lampiran baru untuk kegiatan ${id}...`
      );
      try {
        const lampiranData = await Promise.all(
          lampiran.map(async (file) => {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = generateSafeFilename(file.name);
            const uploadPath = join(UPLOAD_DIR, filename);
            writeFileSync(uploadPath, buffer);
            return { namaFile: filename, url: `/lampiran/${filename}` };
          })
        );
        await prisma.lampiran.createMany({
          data: lampiranData.map((data) => ({
            ...data,
            kegiatanId: updatedKegiatan.id,
          })),
        });
        console.log(
          `[UPLOAD] ${lampiran.length} entri lampiran berhasil ditambahkan ke database untuk kegiatan ${id}.`
        );
      } catch (uploadError) {
        console.error(
          "[UPLOAD ERROR] Error saat memproses lampiran di editKegiatan:",
          uploadError
        );
        return {
          success: false,
          message: `Gagal mengunggah lampiran baru: ${
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError)
          }`,
        };
      }
    } else {
      console.log(
        `[UPLOAD] Tidak ada lampiran baru untuk diproses untuk kegiatan ${id}.`
      );
    }

    revalidatePath("/admin/kegiatan/list");
    revalidatePath(`/admin/kegiatan/edit/${id}`);
    revalidatePath(`/admin/kegiatan/detail/${id}`);

    return {
      success: true,
      data: updatedKegiatan,
      message: "Kegiatan berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error in editKegiatan:", error);
    return handlePrismaUniqueViolation(error);
  }
}

export async function deleteKegiatan(id: string) {
  if (!id) {
    return { success: false, message: "ID Kegiatan tidak ditemukan." };
  }
  try {
    await prisma.fieldKegiatanValues.deleteMany({ where: { kegiatanId: id } });
    console.log(`[ACTION] FieldKegiatanValues for activity ${id} deleted.`);

    const lampiranToDelete = await prisma.lampiran.findMany({
      where: { kegiatanId: id },
      select: { id: true, namaFile: true },
    });
    for (const lampiran of lampiranToDelete) {
      await deleteKegiatanLampiranFile(lampiran.namaFile);
      await prisma.lampiran.delete({ where: { id: lampiran.id } });
    }
    console.log(`[ACTION] Lampiran for activity ${id} deleted.`);

    const deletedKegiatan = await prisma.kegiatan.delete({ where: { id } });
    console.log(`[ACTION] Kegiatan with ID ${id} deleted.`);

    revalidatePath("/admin/kegiatan/list");
    revalidatePath(`/admin/kegiatan/detail/${id}`);
    return {
      success: true,
      data: deletedKegiatan,
      message: "Kegiatan berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error in deleteKegiatan:", error);
    return handlePrismaUniqueViolation(error);
  }
}

export async function updateKegiatanStatus(payload: TUpdateStatusKegiatan) {
  const validationResult = await validateServerActionPayload(
    payload,
    updateStatusKegiatanSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Data tidak valid setelah validasi." };

  const { kegiatanId, status, alasanDitolak } = validationResult.data;

  try {
    const updatedKegiatan = await prisma.kegiatan.update({
      where: { id: kegiatanId },
      data: {
        status,
        alasanDitolak: status === "DITOLAK" ? alasanDitolak : null,
      },
      include: {
        logbook: {
          include: {
            mahasiswa: {
              include: { pengguna: { select: { id: true, nama: true } } },
            },
          },
        },
        jenisKegiatan: { select: { fields: true } },
        fieldValues: {
          include: {
            jenisKegiatanField: {
              select: { fieldName: true, templateKey: true },
            },
          },
        },
      },
    });

    const pengajuId = updatedKegiatan.logbook.mahasiswa?.pengguna.id;
    const pengajuNama = updatedKegiatan.logbook.mahasiswa?.pengguna.nama; // Dapatkan nama pengaju

    let kegiatanJudul = "Kegiatan Anda";

    const judulFieldDef = updatedKegiatan.jenisKegiatan.fields.find(
      (f) => f.templateKey?.toLowerCase() === "judul"
    );
    if (judulFieldDef) {
      const judulValue = updatedKegiatan.fieldValues.find(
        (fv) => fv.jenisKegiatanFieldId === judulFieldDef.id
      )?.value;
      if (judulValue) {
        kegiatanJudul = judulValue;
      }
    }

    if (pengajuId) {
      let notifPesan = "";
      let notifJudul = "";
      if (status === "DISETUJUI") {
        notifJudul = "Kegiatan Disetujui";
        notifPesan = `Kegiatan "${kegiatanJudul}" Anda telah disetujui.`;
      } else if (status === "DITOLAK") {
        notifJudul = "Kegiatan Ditolak";
        notifPesan = `Kegiatan "${kegiatanJudul}" Anda telah ditolak. ${
          alasanDitolak ? `Alasan: ${alasanDitolak}` : ""
        }`;
      }
      await createNotifikasi({
        judul: notifJudul,
        penggunaId: pengajuId,
        pesan: notifPesan,
      });
    }

    revalidatePath("/admin/kegiatan/list");
    revalidatePath(`/admin/kegiatan/detail/${kegiatanId}`);
    console.log(`Status kegiatan ${kegiatanId} diperbarui menjadi ${status}.`);
    return {
      success: true,
      data: updatedKegiatan,
      message: `Status kegiatan berhasil diubah menjadi ${status}.`,
    };
  } catch (error) {
    console.error("Error in updateKegiatanStatus:", error);
    return handlePrismaUniqueViolation(error);
  }
}

// Server Action untuk mengambil field definitions untuk Jenis Kegiatan
// Ini dipanggil oleh client component TambahKegiatanForm
export async function fetchJenisKegiatanFieldsAction(
  jenisKegiatanId: string
): Promise<JenisKegiatanField[]> {
  if (!jenisKegiatanId) {
    console.warn(
      "fetchJenisKegiatanFieldsAction called with empty jenisKegiatanId."
    );
    return [];
  }
  try {
    const fields = await prisma.jenisKegiatanField.findMany({
      where: { jenisKegiatanId },
      orderBy: { order: "asc" },
    });
    return fields;
  } catch (error) {
    console.error("Error fetching jenis kegiatan fields in action:", error);
    return [];
  }
}

// Action untuk menghapus lampiran (tetap sama)
export async function deleteLampiran(lampiranId: string) {
  if (!lampiranId) {
    return { success: false, message: "ID Lampiran tidak ditemukan." };
  }
  try {
    const lampiran = await prisma.lampiran.findUnique({
      where: { id: lampiranId },
      select: { kegiatanId: true, namaFile: true },
    });
    if (!lampiran) {
      return { success: false, message: "Lampiran tidak ditemukan." };
    }
    await deleteKegiatanLampiranFile(lampiran.namaFile);
    await prisma.lampiran.delete({ where: { id: lampiranId } });
    revalidatePath(`/admin/kegiatan/detail/${lampiran.kegiatanId}`);
    revalidatePath(`/admin/kegiatan/edit/${lampiran.kegiatanId}`);
    console.log(`Lampiran dengan ID ${lampiranId} berhasil dihapus.`);
    return { success: true, message: "Lampiran berhasil dihapus." };
  } catch (error) {
    console.error(`Gagal menghapus lampiran dengan ID ${lampiranId}:`, error);
    return handlePrismaUniqueViolation(error);
  }
}

// Action untuk menghapus semua lampiran (tetap sama)
export async function hapusSemuaLampiran(kegiatanId: string) {
  if (!kegiatanId) {
    return { success: false, message: "ID Kegiatan tidak ditemukan." };
  }
  try {
    const lampiranToDelete = await prisma.lampiran.findMany({
      where: { kegiatanId: kegiatanId },
      select: { id: true, namaFile: true },
    });
    for (const lampiran of lampiranToDelete) {
      await deleteKegiatanLampiranFile(lampiran.namaFile);
    }
    await prisma.lampiran.deleteMany({ where: { kegiatanId: kegiatanId } });
    revalidatePath(`/admin/kegiatan/detail/${kegiatanId}`);
    revalidatePath(`/admin/kegiatan/edit/${kegiatanId}`);
    console.log(`Lampiran untuk kegiatan ${kegiatanId} berhasil dihapus.`);
    return { success: true, message: `Semua lampiran berhasil dihapus.` };
  } catch (error) {
    console.error(
      `Gagal menghapus semua lampiran untuk kegiatan ${kegiatanId}:`,
      error
    );
    return handlePrismaUniqueViolation(error);
  }
}

export async function addCatatanKegiatan(payload: TAddCatatan) {
  const validationResult = await validateServerActionPayload(
    payload,
    addCatatanSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Data catatan tidak valid." };

  try {
    const newCatatan = await prisma.catatan.create({
      data: {
        kegiatanId: validationResult.data.kegiatanId,
        penggunaId: validationResult.data.penggunaId,
        konten: validationResult.data.konten,
      },
      include: {
        pengguna: { select: { nama: true, avatar: true } }, // Include pengguna untuk tampilan langsung di frontend
      },
    });

    revalidatePath(
      `/admin/kegiatan/detail/${validationResult.data.kegiatanId}`
    ); // Revalidate halaman detail kegiatan

    return {
      success: true,
      message: "Catatan berhasil ditambahkan.",
      data: newCatatan,
    };
  } catch (error) {
    console.error("Error adding catatan kegiatan:", error);
    return handlePrismaUniqueViolation(error);
  }
}

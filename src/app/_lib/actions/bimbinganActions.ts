// src/app/_lib/actions/bimbinganActions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { validateServerActionPayload } from "@/lib/validateServerActionPayload"; // Asumsi Anda punya ini
import {
  pengajuanBimbinganSchema,
  TPengajuanBimbinganForm,
  TUpdatePembimbingSchema,
  updatePembimbingSchema,
} from "@/schema/BimbinganSchema";
import { createNotifikasi } from "./notifikasiAction";

/**
 * Server Action to update the main supervisor (pembimbing) for a student.
 * This function also logs the change in a history table.
 * @param payload The data for updating the supervisor, including student ID and new supervisor ID.
 * @returns A success/error object indicating the result of the operation.
 */
export async function updatePembimbing(payload: TUpdatePembimbingSchema) {
  const { data, error } = await validateServerActionPayload(
    payload,
    updatePembimbingSchema
  );

  if (error) {
    return error;
  }
  if (!data) {
    return { success: false, message: "Data tidak valid." };
  }

  const { mahasiswaId: penggunaId, alasan, pembimbingId } = data; // Ambil penggunaId dari payload

  try {
    // 1. Dapatkan record Mahasiswa berdasarkan penggunaId
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { penggunaId: penggunaId }, // Cari Mahasiswa berdasarkan penggunaId
      select: {
        id: true, // Ambil Mahasiswa.id yang akan kita gunakan
        pembimbingId: true, // Ambil pembimbingId lama untuk riwayat
      },
    });

    if (!mahasiswa) {
      return {
        success: false,
        message: "Data mahasiswa tidak ditemukan untuk pengguna ini.",
      };
    }

    const mahasiswaId = mahasiswa.id; // Ini adalah Mahasiswa.id yang benar
    const pembimbingIdLama = mahasiswa.pembimbingId; // Pembimbing lama dari record yang ditemukan

    // 2. Perbarui data mahasiswa dengan pembimbing baru
    const updatedMahasiswa = await prisma.mahasiswa.update({
      where: { id: mahasiswaId }, // Gunakan Mahasiswa.id yang benar untuk update
      data: {
        pembimbingId: pembimbingId === "" ? null : pembimbingId, // Konversi string kosong dari Select menjadi null
      },
    });

    // 3. Buat log perubahan di tabel riwayat (asumsi model RiwayatPerubahanPembimbing ada)
    await prisma.riwayatPerubahanPembimbing.create({
      data: {
        mahasiswaId: mahasiswaId, // Gunakan Mahasiswa.id yang benar untuk riwayat
        alasan: alasan,
        pembimbingIdLama: pembimbingIdLama,
        pembimbingIdBaru: pembimbingId,
        // changedByUserId: "USER_ID_YANG_MELAKUKAN_PERUBAHAN", // Opsional: Tambahkan jika melacak pengguna yang mengubah
      },
    });

    // 4. Revalidate paths yang menampilkan informasi mahasiswa ini
    // revalidatePath(`/admin/mahasiswa/${mahasiswaId}/edit-pembimbing`); // Path ini mungkin tidak diperlukan lagi jika tidak ada halaman khusus
    revalidatePath(`/admin/pengguna/detail/${penggunaId}`); // Revalidate halaman detail pengguna (melalui pengguna.id)

    return {
      success: true,
      message: "Pembimbing mahasiswa berhasil diperbarui.",
      data: updatedMahasiswa,
    };
  } catch (e) {
    console.error("Error updating pembimbing:", e);
    // Detail error untuk debugging internal
    if (e instanceof Error) {
      return {
        success: false,
        message: `Gagal memperbarui pembimbing mahasiswa: ${e.message}`,
      };
    }
    return {
      success: false,
      message: "Terjadi kesalahan tidak terduga saat memperbarui pembimbing.",
    };
  }
}

/**
 * Server Action for a student to submit a guidance application.
 * This function creates a new PermohonanBimbingan entry.
 * @param payload The application data (student ID, desired supervisor ID, message).
 * @returns A success/error object.
 */
export async function buatPengajuanBimbingan(payload: TPengajuanBimbinganForm) {
  const { data, error } = await validateServerActionPayload(
    payload,
    pengajuanBimbinganSchema
  );

  if (error) {
    return error;
  }
  if (!data) {
    return { success: false, message: "Invalid data provided." };
  }

  const { idPengaju, idPembimbing, kalimatPermohonan } = data;

  try {
    // 1. Check if the student exists
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { penggunaId: idPengaju },
      select: {
        id: true,
        pembimbingId: true,
        pengguna: { select: { nama: true } },
      },
    });

    if (!mahasiswa) {
      return { success: false, message: "Student not found." };
    }

    // 2. Check if the student already has a supervisor
    if (mahasiswa.pembimbingId) {
      return {
        success: false,
        message:
          "You already have a supervisor. Cannot submit a new application.",
      };
    }

    // 3. Check if there's an existing 'TERKIRIM' (SENT) application from this student to this supervisor
    const existingApplication = await prisma.permohonanBimbingan.findFirst({
      where: {
        mahasiswaId: mahasiswa.id,
        dosenId: idPembimbing,
        status: "TERKIRIM",
      },
    });

    if (existingApplication) {
      return {
        success: false,
        message: "You already have a pending application to this supervisor.",
      };
    }

    // 4. Create the new PermohonanBimbingan entry
    const newPermohonan = await prisma.permohonanBimbingan.create({
      data: {
        mahasiswaId: mahasiswa.id,
        dosenId: idPembimbing,
        pesan: kalimatPermohonan,
        status: "TERKIRIM", // Default status
      },
      include: {
        mahasiswa: {
          select: {
            pengguna: {
              select: { nama: true },
            },
          },
        },
        dosen: {
          select: {
            pengguna: {
              select: { nama: true },
            },
          },
        },
      },
    });

    // 5. Create a notification for the supervisor
    const dosenTujuan = await prisma.dosen.findUnique({
      where: { id: idPembimbing },
      select: { penggunaId: true },
    });

    if (dosenTujuan?.penggunaId) {
      await createNotifikasi({
        judul: "Permohonan Bimbingan Baru",
        penggunaId: dosenTujuan.penggunaId, // ID pengguna dosen
        pesan: `Mahasiswa ${mahasiswa.pengguna.nama} mengajukan permohonan bimbingan kepada Anda.`,
      });
    }

    // 6. Revalidate relevant paths
    revalidatePath("/mahasiswa/pengajuan-bimbingan"); // Adjust this path if different
    revalidatePath(`/mahasiswa/dashboard`); // Or where ever the student sees their application status

    return {
      success: true,
      message: "Guidance application submitted successfully.",
      data: newPermohonan,
    };
  } catch (e) {
    console.error("Error submitting guidance application:", e);
    return {
      success: false,
      message: "Failed to submit guidance application.",
    };
  }
}

export async function tanggapiPermohonan(
  id: string,
  statusPermohonan: "DITOLAK" | "DISETUJUI" | "TERKIRIM",
  alasanDitolak: string
) {
  try {
    const query = await prisma.permohonanBimbingan.update({
      where: {
        id,
      },
      data: {
        status: statusPermohonan,
        alasanDitolak,
      },
      include: {
        dosen: {
          select: {
            pengguna: {
              select: {
                nama: true,
              },
            },
          },
        },
      },
    });

    if (statusPermohonan === "DISETUJUI") {
      const updatePengguna = await prisma.mahasiswa.update({
        where: {
          id: query.mahasiswaId,
        },
        data: {
          pembimbingId: query.dosenId,
        },
      });

      createNotifikasi({
        judul: `Persetujuan Permohonan Bimbingan`,
        penggunaId: query.mahasiswaId ?? "",
        pesan: `Permohonan bimbingan Anda dengan ${query.dosen?.pengguna.nama} telah disetujui. Silakan koordinasikan jadwal bimbingan lebih lanjut.`,
      });

      console.log(updatePengguna);
    } else {
      createNotifikasi({
        judul: "Status Permohonan Bimbingan",
        penggunaId: query.mahasiswaId ?? "",
        pesan: `Mohon maaf, permohonan bimbingan Anda dengan ${query.dosen?.pengguna.nama} tidak dapat disetujui. Alasan: ${alasanDitolak}. Silakan ajukan permohonan baru atau konsultasikan dengan bagian akademik.`,
      });
    }

    console.log(query);

    revalidatePath("/admin/permohonan-bimbingan");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
}

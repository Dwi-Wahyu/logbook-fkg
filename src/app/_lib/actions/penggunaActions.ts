"use server";

import {
  editPenggunaSchema,
  TEditPenggunaSchema,
} from "@/schema/pengguna/EditPenggunaSchema";
import {
  tambahPenggunaSchema,
  TTambahPenggunaSchema,
} from "@/schema/pengguna/TambahPenggunaSchema";
import { prisma } from "@/lib/prisma";
import {
  handlePrismaUniqueViolation,
  validateServerActionPayload,
} from "@/lib/validateServerActionPayload";
import { compareSync, hashSync } from "bcryptjs";
import { log } from "console";
import { revalidatePath } from "next/cache";
import { TGantiProfilSchema } from "@/schema/GantiProfilSchema";
import { join } from "path";
import { unlinkSync, writeFileSync } from "fs";
import { generateSafeFilename } from "@/hooks/use-safe-filename";
import { TEditProfilPengguna } from "@/schema/EditProfilSchema";
import { TUpdatePasswordSchema } from "@/schema/pengguna/UpdatePasswordSchema";
import { createNotifikasi } from "./notifikasiAction";
import { TUpdatePembimbingSchema } from "@/schema/BimbinganSchema";

export async function deletePengguna(id: string) {
  if (!id) throw new Error("ID tidak ditemukan.");

  const penggunaToDelete = await prisma.pengguna.findUnique({
    where: { id },
    select: { peran: true },
  });

  if (!penggunaToDelete) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  // Langkah 3: Hapus pengguna
  await prisma.pengguna.delete({
    where: { id },
  });

  revalidatePath("/admin/pengguna");

  return {
    success: true,
  };
}

export async function deleteMahasiswa(id: string) {
  if (!id) throw new Error("ID tidak ditemukan.");

  const penggunaToDelete = await prisma.pengguna.findUnique({
    where: { id },
    include: {
      mahasiswa: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!penggunaToDelete) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  await prisma.pengguna.delete({
    where: { id },
  });

  revalidatePath("/admin/pengguna");

  return {
    success: true,
  };
}

export async function tambahPengguna(payload: TTambahPenggunaSchema) {
  const { data, error } = await validateServerActionPayload(
    payload,
    tambahPenggunaSchema
  );

  if (error) {
    return error;
  }

  if (!data) {
    return {
      success: false,
    };
  }

  const { nama, password, peran, username, programStudiId } = data;

  try {
    const hashedPw = hashSync(password, 8);

    const tambahPenggunaQuery = await prisma.pengguna.create({
      data: {
        nama,
        username,
        peran,
        password: hashedPw,
        programStudiId,
      },
    });

    if (peran === "MAHASISWA") {
      await prisma.mahasiswa.create({
        data: {
          penggunaId: tambahPenggunaQuery.id,
        },
      });
    } else if (peran === "DOSEN") {
      await prisma.dosen.create({
        data: {
          penggunaId: tambahPenggunaQuery.id,
        },
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    return handlePrismaUniqueViolation(error);
  }
}

export async function editPengguna(id: string, payload: TEditPenggunaSchema) {
  if (!id) throw new Error("ID tidak ditemukan.");

  const { data, error } = await validateServerActionPayload(
    payload,
    editPenggunaSchema
  );

  if (error) {
    return error;
  }

  if (!data) {
    return {
      success: false,
    };
  }

  const { nama, username } = data;

  try {
    const editPenggunaQuery = await prisma.pengguna.update({
      where: {
        id,
      },
      data: {
        nama,
        username,
      },
    });

    log(editPenggunaQuery);

    revalidatePath("/admin/pengguna");

    return {
      success: true,
    };
  } catch (error) {
    return handlePrismaUniqueViolation(error);
  }
}

export async function editProfilPengguna(
  id: string,
  payload: TEditProfilPengguna
) {
  const updateQuery = await prisma.mahasiswa.update({
    where: {
      penggunaId: id,
    },
    data: {
      semester: payload.semester,
      judulDisertasi: payload.judulDisertasi,
      email: payload.email,
      nomorTelpon: payload.nomorTelpon,
      angkatan: payload.angkatan,
      tahunLulus: payload.tahunLulus,
      mulaiMasukPendidikan: payload.mulaiMasukPendidikan,
      tempatTanggalLahir: payload.tempatTanggalLahir,
      alamat: payload.alamat,
      alamatKeluarga: payload.alamatKeluarga,
      pekerjaan: payload.pekerjaan,
    },
  });

  console.log(updateQuery);

  revalidatePath("/admin/pengaturan/profil");

  return { success: true, updatedData: updateQuery };
}

async function hapusFotoProfil(id: string) {
  const user = await prisma.pengguna.findUnique({
    where: { id },
  });

  if (user?.avatar) {
    const deletePath = join(
      process.cwd(),
      "public/image/profile-picture",
      user.avatar
    );
    unlinkSync(deletePath);
  }
}

export async function gantiFotoProfil(formData: TGantiProfilSchema) {
  const file = formData.files[0];
  const { id } = formData;

  if (!file) {
    throw new Error("Tidak ada file yang diunggah.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    hapusFotoProfil(id);

    const filename = generateSafeFilename(file.name);

    const uploadPath = join(
      process.cwd(),
      "public/image/profile-picture",
      filename
    );

    writeFileSync(uploadPath, buffer);

    const updateQuery = await prisma.pengguna.update({
      where: {
        id,
      },
      data: {
        avatar: filename,
      },
    });

    console.log(updateQuery);

    revalidatePath("/admin/pengaturan/profil");
    return { success: true, avatar: updateQuery.avatar };
  } catch (error) {
    return { success: true, error };
  }
}

export async function cekPasswordBenar(id: string, password: string) {
  const dataPengguna = await prisma.pengguna.findUnique({
    where: { id },
    select: { password: true },
  });

  if (!dataPengguna) {
    return false;
  }

  const isPasswordMatch = compareSync(password, dataPengguna?.password);

  return isPasswordMatch;
}

export async function updatePassword(payload: TUpdatePasswordSchema) {
  const hashedPassword = hashSync(payload.newPassword, 10);

  const updatePengguna = await prisma.pengguna.update({
    where: {
      id: payload.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  console.log(updatePengguna);

  return { success: true };
}

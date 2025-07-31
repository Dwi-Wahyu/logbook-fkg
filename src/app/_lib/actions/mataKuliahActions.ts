// app/actions/mataKuliahActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  handlePrismaUniqueViolation,
  validateServerActionPayload,
} from "@/lib/validateServerActionPayload";
import {
  tambahMataKuliahSchema,
  TTambahMataKuliahSchema,
  editMataKuliahSchema,
  TEditMataKuliahSchema,
} from "@/schema/MataKuliahSchema";
import { log } from "console";

export async function tambahMataKuliah(payload: TTambahMataKuliahSchema) {
  const { data, error } = await validateServerActionPayload(
    payload,
    tambahMataKuliahSchema
  );

  if (error) {
    return error;
  }

  if (!data) {
    return { success: false, message: "Data tidak valid." };
  }

  const { judul, semester, programStudiId } = data; // Destructure programStudiId

  try {
    const newMataKuliah = await prisma.mataKuliah.create({
      data: {
        judul,
        semester,
        programStudiId, // Add programStudiId to data
      },
    });

    revalidatePath("/admin/mata-kuliah");

    log("Mata Kuliah added:", newMataKuliah);
    return { success: true, data: newMataKuliah };
  } catch (error) {
    return handlePrismaUniqueViolation(error);
  }
}

export async function editMataKuliah(payload: TEditMataKuliahSchema) {
  const { data, error } = await validateServerActionPayload(
    payload,
    editMataKuliahSchema
  );

  if (error) {
    return error;
  }

  if (!data) {
    return { success: false, message: "Data tidak valid." };
  }

  const { id, judul, semester, programStudiId } = data; // Destructure programStudiId

  try {
    const updatedMataKuliah = await prisma.mataKuliah.update({
      where: {
        id,
      },
      data: {
        judul,
        semester,
        programStudiId, // Add programStudiId to data
      },
    });

    revalidatePath("/admin/mata-kuliah");
    revalidatePath(`/admin/mata-kuliah/edit/${data.id}`);

    log("Mata Kuliah updated:", updatedMataKuliah);
    return { success: true, data: updatedMataKuliah };
  } catch (error) {
    return handlePrismaUniqueViolation(error);
  }
}

export async function deleteMataKuliah(id: number) {
  if (typeof id !== "number") {
    throw new Error("ID Mata Kuliah tidak valid.");
  }

  try {
    const deletedMataKuliah = await prisma.mataKuliah.delete({
      where: { id },
    });

    revalidatePath("/admin/mata-kuliah");

    log("Mata Kuliah deleted:", deletedMataKuliah);
    return { success: true, data: deletedMataKuliah };
  } catch (error) {
    console.error("Failed to delete Mata Kuliah:", error);
    return { success: false, message: "Gagal menghapus mata kuliah." };
  }
}

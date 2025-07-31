// src/app/_lib/actions/programStudiActions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  handlePrismaUniqueViolation,
  validateServerActionPayload,
} from "@/lib/validateServerActionPayload";
import { generateCamelCaseKey } from "@/lib/utils"; // For generating templateKey

import {
  // Import semua skema dan tipe dari ProgramStudiSchema yang sudah diupdate
  updateProgramStudiSchema,
  TUpdateProgramStudi,
  addJenisKegiatanSchema,
  TAddJenisKegiatan,
  updateJenisKegiatanSchema,
  TUpdateJenisKegiatan,
  deleteJenisKegiatanSchema,
  TDeleteJenisKegiatan,
  addJenisKegiatanFieldSchema,
  TAddJenisKegiatanField,
  updateJenisKegiatanFieldSchema,
  TUpdateJenisKegiatanField,
  deleteJenisKegiatanFieldSchema,
  TDeleteJenisKegiatanField,
} from "@/schema/ProgramStudiSchema";
import { Prisma } from "@/generated/prisma";

// --- SERVER ACTIONS UNTUK PROGRAM STUDI ---

/**
 * Updates the main data of a Program Studi.
 */
export async function updateProgramStudi(payload: TUpdateProgramStudi) {
  const validationResult = await validateServerActionPayload(
    payload,
    updateProgramStudiSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Data tidak valid." };

  try {
    const updatedProgramStudi = await prisma.programStudi.update({
      where: { id: validationResult.data.id },
      data: {
        nama: validationResult.data.nama,
        displayName: validationResult.data.displayName,
        templateSingleFieldForDate:
          validationResult.data.templateSingleFieldForDate,
      },
    });
    revalidatePath(
      `/admin/pengaturan/program-studi/${validationResult.data.id}`
    );
    revalidatePath(`/admin/pengaturan/program-studi`);
    return {
      success: true,
      message: "Program Studi updated successfully.",
      data: updatedProgramStudi,
    };
  } catch (e) {
    return handlePrismaUniqueViolation(e);
  }
}

// --- SERVER ACTIONS UNTUK JENIS KEGIATAN ---

/**
 * Adds a new Jenis Kegiatan to a Program Studi.
 * Generates `templateIdentifier` automatically from `nama` if not provided.
 */
export async function addJenisKegiatan(payload: TAddJenisKegiatan) {
  const validationResult = await validateServerActionPayload(
    payload,
    addJenisKegiatanSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Data tidak valid." };

  try {
    const generatedTemplateIdentifier = generateCamelCaseKey(
      validationResult.data.nama
    );

    const newJenisKegiatan = await prisma.jenisKegiatan.create({
      data: {
        programStudiId: validationResult.data.programStudiId,
        nama: validationResult.data.nama,
        templateIdentifier: generatedTemplateIdentifier, // Simpan generated identifier
        isMataKuliahRequired: validationResult.data.isMataKuliahRequired,
      },
    });
    revalidatePath(
      `/admin/pengaturan/program-studi/${validationResult.data.programStudiId}`
    );
    return {
      success: true,
      message: "Jenis Kegiatan added successfully.",
      data: newJenisKegiatan,
    };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        success: false,
        message: "Nama Jenis Kegiatan sudah ada untuk Program Studi ini.",
      };
    }
    return handlePrismaUniqueViolation(e); // Tangani error lain seperti duplikasi identifier
  }
}

/**
 * Updates an existing Jenis Kegiatan.
 * Allows updating `templateIdentifier` or regenerates if `nama` changes and `templateIdentifier` not provided.
 */
export async function updateJenisKegiatan(payload: TUpdateJenisKegiatan) {
  const validationResult = await validateServerActionPayload(
    payload,
    updateJenisKegiatanSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Data tidak valid." };

  try {
    const { id, nama, templateIdentifier, isMataKuliahRequired } =
      validationResult.data;

    // Fetch current JenisKegiatan to compare 'nama' for templateIdentifier regeneration
    const currentJenisKegiatan = await prisma.jenisKegiatan.findUnique({
      where: { id: id },
      select: { nama: true, templateIdentifier: true },
    });

    let finalTemplateIdentifier = templateIdentifier;
    if (currentJenisKegiatan && currentJenisKegiatan.nama !== nama) {
      // Regenerate if 'nama' changed and templateIdentifier is not explicitly provided
      finalTemplateIdentifier =
        templateIdentifier ?? generateCamelCaseKey(nama);
    }

    const updatedJenisKegiatan = await prisma.jenisKegiatan.update({
      where: { id: id },
      data: {
        nama: nama,
        templateIdentifier: finalTemplateIdentifier,
        isMataKuliahRequired: isMataKuliahRequired,
      },
    });
    revalidatePath(
      `/admin/pengaturan/program-studi/${updatedJenisKegiatan.programStudiId}`
    );
    return {
      success: true,
      message: "Jenis Kegiatan updated successfully.",
      data: updatedJenisKegiatan,
    };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        success: false,
        message:
          "Nama Jenis Kegiatan atau Template Identifier sudah digunakan.",
      };
    }
    return handlePrismaUniqueViolation(e);
  }
}

/**
 * Deletes a Jenis Kegiatan.
 */
export async function deleteJenisKegiatan(payload: TDeleteJenisKegiatan) {
  const validationResult = await validateServerActionPayload(
    payload,
    deleteJenisKegiatanSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Data tidak valid." };

  try {
    // Check for existing Kegiatan related to this JenisKegiatan before deleting
    const relatedKegiatanCount = await prisma.kegiatan.count({
      where: { jenisKegiatanId: validationResult.data.id },
    });

    if (relatedKegiatanCount > 0) {
      return {
        success: false,
        message: `Tidak dapat menghapus Jenis Kegiatan ini karena masih ada ${relatedKegiatanCount} kegiatan terkait.`,
      };
    }

    await prisma.jenisKegiatan.delete({
      where: { id: validationResult.data.id },
    });
    revalidatePath(
      `/admin/pengaturan/program-studi/${validationResult.data.programStudiId}`
    );
    return { success: true, message: "Jenis Kegiatan deleted successfully." };
  } catch (e) {
    return handlePrismaUniqueViolation(e);
  }
}

// --- SERVER ACTIONS UNTUK JENIS KEGIATAN FIELD ---

/**
 * Adds a new custom field to a Jenis Kegiatan.
 * Generates `templateKey` automatically from `fieldName`.
 */
export async function addJenisKegiatanField(payload: TAddJenisKegiatanField) {
  const validationResult = await validateServerActionPayload(
    payload,
    addJenisKegiatanFieldSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Data tidak valid." };

  try {
    const generatedTemplateKey = generateCamelCaseKey(
      validationResult.data.fieldName
    );

    const newField = await prisma.jenisKegiatanField.create({
      data: {
        jenisKegiatanId: validationResult.data.jenisKegiatanId,
        fieldName: validationResult.data.fieldName,
        fieldType: validationResult.data.fieldType,
        isRequired: validationResult.data.isRequired,
        order: validationResult.data.order,
        templateKey: generatedTemplateKey,
      },
    });
    // Revalidate path for the Program Studi detail (which contains Jenis Kegiatan fields)
    const jenisKegiatan = await prisma.jenisKegiatan.findUnique({
      where: { id: validationResult.data.jenisKegiatanId },
      select: { programStudiId: true },
    });
    if (jenisKegiatan?.programStudiId) {
      revalidatePath(
        `/admin/pengaturan/program-studi/${jenisKegiatan.programStudiId}`
      );
    }
    // Revalidate the page where JenisKegiatanField management form is displayed (if different)
    revalidatePath(
      `/admin/pengaturan/jenis-kegiatan/edit/${validationResult.data.jenisKegiatanId}`
    ); // Placeholder if you have a dedicated edit page for Jenis Kegiatan
    return {
      success: true,
      message: "Jenis Kegiatan Field added successfully.",
      data: newField,
    };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        success: false,
        message: "Nama Field sudah ada untuk Jenis Kegiatan ini.",
      };
    }
    return handlePrismaUniqueViolation(e);
  }
}

/**
 * Updates an existing custom field of a Jenis Kegiatan.
 */
export async function updateJenisKegiatanField(
  payload: TUpdateJenisKegiatanField
) {
  const validationResult = await validateServerActionPayload(
    payload,
    updateJenisKegiatanFieldSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Invalid data." };

  try {
    const { id, fieldName, fieldType, isRequired, order } =
      validationResult.data;

    // Regenerate templateKey if fieldName changed (since frontend doesn't send it)
    const currentField = await prisma.jenisKegiatanField.findUnique({
      where: { id: id },
      select: { fieldName: true, templateKey: true },
    });

    let updatedTemplateKey = currentField?.templateKey;
    if (currentField && currentField.fieldName !== fieldName) {
      updatedTemplateKey = generateCamelCaseKey(fieldName);
    }

    const updatedField = await prisma.jenisKegiatanField.update({
      where: { id: id },
      data: {
        fieldName: fieldName,
        fieldType: fieldType,
        isRequired: isRequired,
        order: order,
        templateKey: updatedTemplateKey,
      },
    });
    // Find the JenisKegiatanId and then ProgramStudiId to revalidate
    const jenisKegiatan = await prisma.jenisKegiatanField.findUnique({
      where: { id: id },
      select: { jenisKegiatan: { select: { programStudiId: true, id: true } } },
    });
    if (jenisKegiatan?.jenisKegiatan?.programStudiId) {
      revalidatePath(
        `/admin/pengaturan/program-studi/${jenisKegiatan.jenisKegiatan.programStudiId}`
      );
      revalidatePath(
        `/admin/pengaturan/jenis-kegiatan/edit/${jenisKegiatan.jenisKegiatan.id}`
      ); // Placeholder
    }
    return {
      success: true,
      message: "Jenis Kegiatan Field updated successfully.",
      data: updatedField,
    };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        success: false,
        message: "Nama Field sudah ada untuk Jenis Kegiatan ini.",
      };
    }
    return handlePrismaUniqueViolation(e);
  }
}

/**
 * Deletes a custom field from a Jenis Kegiatan.
 */
export async function deleteJenisKegiatanField(
  payload: TDeleteJenisKegiatanField
) {
  const validationResult = await validateServerActionPayload(
    payload,
    deleteJenisKegiatanFieldSchema
  );
  if (validationResult.error) return validationResult.error;
  if (!validationResult.data)
    return { success: false, message: "Data tidak valid." };

  try {
    // Check if there are any FieldKegiatanValues using this field before deleting
    const relatedFieldValuesCount = await prisma.fieldKegiatanValues.count({
      where: { jenisKegiatanFieldId: validationResult.data.id },
    });

    if (relatedFieldValuesCount > 0) {
      return {
        success: false,
        message: `Tidak dapat menghapus field ini karena masih ada ${relatedFieldValuesCount} nilai kegiatan terkait.`,
      };
    }

    await prisma.jenisKegiatanField.delete({
      where: { id: validationResult.data.id },
    });
    // Find JenisKegiatanId and ProgramStudiId for revalidation
    const jenisKegiatan = await prisma.jenisKegiatanField.findUnique({
      where: { id: validationResult.data.id },
      select: { jenisKegiatan: { select: { programStudiId: true, id: true } } },
    });
    if (jenisKegiatan?.jenisKegiatan?.programStudiId) {
      revalidatePath(
        `/admin/pengaturan/program-studi/${jenisKegiatan.jenisKegiatan.programStudiId}`
      );
      revalidatePath(
        `/admin/pengaturan/jenis-kegiatan/edit/${jenisKegiatan.jenisKegiatan.id}`
      ); // Placeholder
    }
    return {
      success: true,
      message: "Jenis Kegiatan Field deleted successfully.",
    };
  } catch (e) {
    return handlePrismaUniqueViolation(e);
  }
}

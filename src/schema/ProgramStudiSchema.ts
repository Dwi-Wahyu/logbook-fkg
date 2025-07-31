// src/schema/ProgramStudiSchema.ts

import { z } from "zod";

// --- SKEMA UNTUK PROGRAM STUDI UTAMA ---
export const updateProgramStudiSchema = z.object({
  id: z.string().min(1, "Program Studi ID is required."),
  nama: z.string().min(1, "Nama Program Studi is required."),
  displayName: z.string().min(1, "Display Name is required."),
  templateSingleFieldForDate: z.boolean().optional(),
});
export type TUpdateProgramStudi = z.infer<typeof updateProgramStudiSchema>;

// --- SKEMA UNTUK JENIS KEGIATAN (BARU) ---
export const addJenisKegiatanSchema = z.object({
  programStudiId: z.string().min(1, "Program Studi ID is required."),
  nama: z.string().min(1, "Nama Jenis Kegiatan is required."),
  templateIdentifier: z.string().optional().nullable(), // Opsional, akan digenerasi di backend
  isMataKuliahRequired: z.boolean(), // Default true jika tidak disediakan
});
export type TAddJenisKegiatan = z.infer<typeof addJenisKegiatanSchema>;

export const updateJenisKegiatanSchema = z.object({
  id: z.string().min(1, "Jenis Kegiatan ID is required."),
  nama: z.string().min(1, "Nama Jenis Kegiatan is required."),
  templateIdentifier: z.string().optional().nullable(),
  isMataKuliahRequired: z.boolean(),
});
export type TUpdateJenisKegiatan = z.infer<typeof updateJenisKegiatanSchema>;

export const deleteJenisKegiatanSchema = z.object({
  id: z.string().min(1, "Jenis Kegiatan ID is required."),
  programStudiId: z.string().min(1, "Program Studi ID is required."), // Perlu untuk revalidate path
});
export type TDeleteJenisKegiatan = z.infer<typeof deleteJenisKegiatanSchema>;

// --- SKEMA UNTUK FIELD KUSTOM JENIS KEGIATAN (MENGGANTIKAN ProgramStudiFieldSchema) ---
export const addJenisKegiatanFieldSchema = z.object({
  jenisKegiatanId: z.string().min(1, "Jenis Kegiatan ID is required."),
  fieldName: z.string().min(1, "Field Name is required."),
  fieldType: z.enum(["TEXT", "NUMBER", "DATE", "BOOLEAN", "TEXTAREA"], {
    required_error: "Field Type is required.",
  }),
  isRequired: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  // templateKey tidak perlu di sini, akan digenerasi di action
});
export type TAddJenisKegiatanField = z.infer<
  typeof addJenisKegiatanFieldSchema
>;

export const updateJenisKegiatanFieldSchema = z.object({
  id: z.string().min(1, "Field ID is required."),
  fieldName: z.string().min(1, "Field Name is required."),
  fieldType: z.enum(["TEXT", "NUMBER", "DATE", "BOOLEAN", "TEXTAREA"], {
    required_error: "Field Type is required.",
  }),
  isRequired: z.boolean().default(false),
  order: z.number().int().min(0),
  // templateKey tidak perlu di sini, akan digenerasi/dipertahankan di action
});
export type TUpdateJenisKegiatanField = z.infer<
  typeof updateJenisKegiatanFieldSchema
>;

export const deleteJenisKegiatanFieldSchema = z.object({
  id: z.string().min(1, "Field ID is required."),
  jenisKegiatanId: z.string().min(1, "Jenis Kegiatan ID is required."), // Perlu untuk revalidate path
});
export type TDeleteJenisKegiatanField = z.infer<
  typeof deleteJenisKegiatanFieldSchema
>;

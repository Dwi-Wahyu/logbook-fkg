// src/schema/kegiatan/TambahKegiatanSchema.ts

import { z } from "zod";

export const kegiatanStatusEnum = z.enum(["DIAJUKAN", "DISETUJUI", "DITOLAK"], {
  required_error: "Status kegiatan wajib diisi.",
});

export const lampiranImageExtensions = ["png", "jpeg", "jpg"];
export const validLampiranExtensions = [
  "png",
  "jpeg",
  "jpg",
  "pdf",
  "doc",
  "docx",
];

// Skema untuk satu FieldValue dari form
const fieldValueSchema = z.object({
  jenisKegiatanFieldId: z.string().min(1, { message: "Field ID is required." }),
  value: z.any().optional().nullable(), // Gunakan z.any() karena tipe data sebenarnya akan divalidasi di backend
});

export const tambahKegiatanSchema = z.object({
  // mata_kuliahId sekarang opsional
  mata_kuliahId: z.string().optional().nullable(),
  pengajuId: z.string().min(1, { message: "ID pengaju tidak valid." }), // <-- DIKEMBALIKAN KE SKEMA
  jenisKegiatanId: z
    .string()
    .min(1, { message: "Jenis Kegiatan wajib dipilih." }),
  lampiran: z
    .array(z.instanceof(File))
    .max(3, { message: "Maksimal 3 lampiran." })
    .optional(),
  status: kegiatanStatusEnum.default("DIAJUKAN").optional(),
  fieldValues: z.array(fieldValueSchema).optional(),
});

export type TTambahKegiatan = z.infer<typeof tambahKegiatanSchema>;

export const addCatatanSchema = z.object({
  kegiatanId: z.string().min(1, "ID Kegiatan wajib diisi."),
  penggunaId: z.string().min(1, "ID Pengguna wajib diisi."),
  konten: z.string().min(1, "Catatan tidak boleh kosong."),
});
export type TAddCatatan = z.infer<typeof addCatatanSchema>;

// src/schema/kegiatan/UpdateKegiatanSchema.ts

import { z } from "zod";
import { kegiatanStatusEnum } from "./TambahKegiatanSchema";

// import { z } from "zod"; // Sudah diimpor di atas
// import { kegiatanStatusEnum } from "./TambahKegiatanSchema"; // Sudah diimpor di atas

// Skema untuk satu FieldValue dari form (sama seperti di TambahKegiatanSchema)
const editFieldValueSchema = z.object({
  jenisKegiatanFieldId: z.string().min(1, { message: "Field ID is required." }),
  value: z.any().optional().nullable(), // Gunakan z.any() karena tipe data sebenarnya akan divalidasi di backend
});

export const editKegiatanSchema = z.object({
  id: z.string(), // ID Kegiatan untuk edit
  mata_kuliahId: z.string().optional().nullable(), // Mata kuliah sekarang opsional
  status: kegiatanStatusEnum,
  // fieldsData akan digantikan oleh fieldValues
  fieldValues: z.array(editFieldValueSchema).optional(), // Array dari nilai field kustom
  lampiran: z
    .array(z.instanceof(File))
    .max(3, { message: "Maksimal 3 lampiran baru yang dapat diunggah." })
    .optional(),
});

export type TEditKegiatan = z.infer<typeof editKegiatanSchema>;

export const updateStatusKegiatanSchema = z.object({
  kegiatanId: z.string(),
  status: kegiatanStatusEnum,
  alasanDitolak: z.string().optional(),
});

export type TUpdateStatusKegiatan = z.infer<typeof updateStatusKegiatanSchema>;

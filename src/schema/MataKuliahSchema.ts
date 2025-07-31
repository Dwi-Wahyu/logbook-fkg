// schema/mataKuliah/MataKuliahSchema.ts
import { z } from "zod";

export const tambahMataKuliahSchema = z.object({
  judul: z.string().min(3, {
    message: "Judul mata kuliah setidaknya 3 karakter.",
  }),
  semester: z.number().min(1, {
    message: "Semester minimal 1.",
  }),
  programStudiId: z.string().min(1, {
    message: "Program Studi wajib dipilih.",
  }), // Add this
});

export type TTambahMataKuliahSchema = z.infer<typeof tambahMataKuliahSchema>;

export const editMataKuliahSchema = z.object({
  id: z.number().int({ message: "ID Mata Kuliah tidak valid." }), // ID Mata Kuliah untuk edit
  judul: z.string().min(1, { message: "Judul mata kuliah wajib diisi." }),
  semester: z
    .number()
    .min(1, { message: "Semester wajib diisi dan minimal 1." }),
  programStudiId: z
    .string()
    .min(1, { message: "Program Studi wajib dipilih." }),
});

export type TEditMataKuliahSchema = z.infer<typeof editMataKuliahSchema>;

export const mataKuliahSearchParams = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(10),
  judul: z.string().optional(),
  semester: z.coerce.number().optional(),
  programStudiId: z.string().optional(), // Add this for searching
});

export type TMataKuliahSearchParams = z.infer<typeof mataKuliahSearchParams>;

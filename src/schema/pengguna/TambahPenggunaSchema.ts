import { z } from "zod";

export const tambahPenggunaSchema = z.object({
  nama: z.string().min(2, {
    message: "Nama setidaknya 2 karakter.",
  }),
  username: z.string().min(2, {
    message: "Username setidaknya 2 karakter.",
  }),
  password: z.string().min(8, {
    message: "Password setidaknya 8 karakter.",
  }),
  peran: z.enum(["DOSEN", "MAHASISWA", "ADMIN"]),
  programStudiId: z.string().min(1, {
    message: "Tolong pilih program studi.",
  }),
});

export type TTambahPenggunaSchema = z.infer<typeof tambahPenggunaSchema>;

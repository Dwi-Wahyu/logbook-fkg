// types/pengguna.ts

export interface ProfilSelect {
  nim: string | null;
  nip: string | null;
  angkatan: string | null;
}

export interface PenggunaBimbinganSelect {
  nama: string;
}

export interface PenggunaSelect {
  id: string;
  nama: string;
  username: string;
  profil?: ProfilSelect | null;
  bimbingan?: PenggunaBimbinganSelect[];
  koBimbingan?: PenggunaBimbinganSelect[];
}

import { z } from "zod";

export const profilSelectSchema = z.object({
  nim: z.string().nullable(),
  nip: z.string().nullable(),
  angkatan: z.string().nullable(),
});

export const penggunaBimbinganSchema = z.object({
  nama: z.string(),
});

export const penggunaSelectSchema = z.object({
  id: z.string(),
  nama: z.string(),
  username: z.string(),
  peran: z.enum(["ADMIN", "DOSEN", "MAHASISWA"]),
  profil: profilSelectSchema.nullish(),
  bimbingan: z.array(penggunaBimbinganSchema).optional(),
  koBimbingan: z.array(penggunaBimbinganSchema).optional(),
});

export type tabelPenggunaType = z.infer<typeof penggunaSelectSchema>;

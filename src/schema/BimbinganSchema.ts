import { z } from "zod";

export const pengajuanBimbinganSchema = z.object({
  idPengaju: z.string().min(1, "Student ID is required."),
  idPembimbing: z.string().min(1, "Supervisor ID is required."),
  kalimatPermohonan: z.string().optional(),
});

export type TPengajuanBimbinganForm = z.infer<typeof pengajuanBimbinganSchema>;
export const updatePembimbingSchema = z.object({
  mahasiswaId: z.string(), // ID Mahasiswa yang akan diubah pembimbingnya
  alasan: z.string().min(1, "Alasan perubahan wajib diisi."),
  pembimbingId: z.string().optional().nullable(), // Bisa null/undefined jika ingin mengosongkan pembimbing
});

export type TUpdatePembimbingSchema = z.infer<typeof updatePembimbingSchema>;

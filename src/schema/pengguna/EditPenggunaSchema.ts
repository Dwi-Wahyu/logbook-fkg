import { z } from "zod";

export const editPenggunaSchema = z.object({
  nama: z.string().min(1, {
    message: "Tolong ketik nama",
  }),
  username: z.string().min(10, {
    message: "Username setidaknya 10 karakter.",
  }),
});

export type TEditPenggunaSchema = z.infer<typeof editPenggunaSchema>;

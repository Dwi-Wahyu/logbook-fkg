import { z } from "zod";

export const updatePasswordSchema = z
  .object({
    id: z.string().min(1, { message: "ID pengguna diperlukan" }),
    oldPassword: z.string().min(1, { message: "Password lama diperlukan" }),
    newPassword: z
      .string()
      .min(8, { message: "Password baru minimal 8 karakter" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Konfirmasi password diperlukan" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru dan konfirmasi password tidak sama",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Password baru tidak boleh sama dengan password lama",
    path: ["newPassword"],
  });

export type TUpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(2, {
    message: "Username setidaknya 2 karakter.",
  }),
  password: z.string().min(8, {
    message: "Password setidaknya 8 karakter.",
  }),
});

export type TLoginSchema = z.infer<typeof loginSchema>;

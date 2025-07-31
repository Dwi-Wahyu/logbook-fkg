import { z } from "zod";

export const gantiProfilSchema = z.object({
  id: z.string(),
  files: z
    .array(z.custom<File>())
    .min(1, "Please select at least one file")
    .max(1, "Only one file allowed")
    .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), {
      message: "File size must be less than 5MB",
      path: ["files"],
    }),
});

export type TGantiProfilSchema = z.infer<typeof gantiProfilSchema>;

import { z } from "zod";

export const searchParamsSchema = z.object({
  page: z.number().default(1),
  perPage: z.number().default(10),
  nama: z.string(),
  // peran: z.enum(["asisten", "praktikan"]).optional(),
});

export type TSearchParamsSchema = z.infer<typeof searchParamsSchema>;

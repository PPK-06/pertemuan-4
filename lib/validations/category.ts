import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori tidak boleh kosong")
    .max(50, "Nama kategori maksimal 50 karakter"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

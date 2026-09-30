import { z } from "zod";

export const walletSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama dompet tidak boleh kosong")
    .max(50, "Nama dompet maksimal 50 karakter"),
  type: z
    .string()
    .trim()
    .max(50, "Tipe dompet maksimal 50 karakter")
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
});

export type WalletInput = z.infer<typeof walletSchema>;

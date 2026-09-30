import { z } from "zod";

export const budgetSchema = z
  .object({
    month: z
      .string()
      .regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, "Format bulan harus YYYY-MM"),
    limitAmount: z.coerce
      .number()
      .int("Batas anggaran harus berupa bilangan bulat")
      .positive("Batas anggaran harus lebih dari 0"),
    categoryId: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
    walletId: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
  })
  .refine((data) => data.categoryId !== null || data.walletId !== null, {
    message: "Minimal salah satu dari kategori atau dompet harus diisi",
    path: ["categoryId"],
  });

export type BudgetInput = z.infer<typeof budgetSchema>;

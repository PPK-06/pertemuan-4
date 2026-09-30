"use client";

import type { FormEvent } from "react";
import type { Option } from "@/lib/types/budget";

type BudgetFormValues = {
  categoryId: string;
  walletId: string;
  month: string;
  limitAmount: string;
};

type BudgetFormErrors = Partial<
  Record<keyof BudgetFormValues, string>
>;

type BudgetFormProps = {
  values: BudgetFormValues;
  errors: BudgetFormErrors;
  categories: Option[];
  wallets: Option[];
  isPending: boolean;
  onChange: (field: keyof BudgetFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function BudgetForm({
  values,
  errors,
  categories,
  wallets,
  isPending,
  onChange,
  onSubmit,
}: BudgetFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 text-gray-900"
    >
      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium">
          Kategori
        </label>

        <select
          id="category"
          value={values.categoryId}
          disabled={isPending}
          onChange={(e) => onChange("categoryId", e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
        >
          <option value="">Pilih kategori</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
        )}
      </div>

      <div>
        <label htmlFor="wallet" className="mb-1 block text-sm font-medium">
          Dompet
        </label>

        <select
          id="wallet"
          value={values.walletId}
          disabled={isPending}
          onChange={(e) => onChange("walletId", e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
        >
          <option value="">Pilih dompet</option>

          {wallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name}
            </option>
          ))}
        </select>

        {errors.walletId && (
          <p className="mt-1 text-sm text-red-600">{errors.walletId}</p>
        )}
      </div>

      <div>
        <label htmlFor="month" className="mb-1 block text-sm font-medium">
          Bulan
        </label>

        <input
          id="month"
          type="month"
          value={values.month}
          disabled={isPending}
          onChange={(e) => onChange("month", e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
        />

        {errors.month && (
          <p className="mt-1 text-sm text-red-600">{errors.month}</p>
        )}
      </div>

      <div>
        <label htmlFor="limit" className="mb-1 block text-sm font-medium">
          Batas Budget
        </label>

        <input
          id="limit"
          type="number"
          min="1"
          inputMode="numeric"
          value={values.limitAmount}
          disabled={isPending}
          onChange={(e) => onChange("limitAmount", e.target.value)}
          placeholder="Contoh: 1500000"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
        />

        {errors.limitAmount && (
          <p className="mt-1 text-sm text-red-600">
            {errors.limitAmount}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Menyimpan..." : "Simpan Budget"}
      </button>
    </form>
  );
}


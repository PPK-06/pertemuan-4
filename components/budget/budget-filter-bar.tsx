"use client";

import type { Option } from "@/lib/types/budget";

type BudgetFilterValues = {
  month: string;
  categoryId: string;
  walletId: string;
};

type BudgetFilterBarProps = {
  values: BudgetFilterValues;
  categories: Option[];
  wallets: Option[];
  onFilterChange: (values: BudgetFilterValues) => void;
};

export default function BudgetFilterBar({
  values,
  categories,
  wallets,
  onFilterChange,
}: BudgetFilterBarProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 text-gray-900 md:grid-cols-3">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="filter-month">
          Bulan
        </label>
        <input
          id="filter-month"
          type="month"
          value={values.month}
          onChange={(e) =>
            onFilterChange({ ...values, month: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="filter-category"
        >
          Kategori
        </label>

        <select
          id="filter-category"
          value={values.categoryId}
          onChange={(e) =>
            onFilterChange({ ...values, categoryId: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
        >
          <option value="">Semua kategori</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="filter-wallet"
        >
          Dompet
        </label>

        <select
          id="filter-wallet"
          value={values.walletId}
          onChange={(e) =>
            onFilterChange({ ...values, walletId: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
        >
          <option value="">Semua dompet</option>

          {wallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}


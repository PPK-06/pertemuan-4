"use client";

import type { BudgetWithUsage } from "@/lib/types/budget";
import BudgetProgressBar from "./budget-progress-bar";

type BudgetCardProps = {
  budget: BudgetWithUsage;
  isPending?: boolean;
  onEdit: (budget: BudgetWithUsage) => void;
  onDelete: (id: string) => void;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function BudgetCard({
  budget,
  isPending = false,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const title =
    budget.categoryName && budget.walletName
      ? `${budget.categoryName} â€¢ ${budget.walletName}`
      : budget.categoryName ?? budget.walletName ?? "Budget";

  const exceeded = budget.remainingAmount < 0;

  return (
    <article
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{budget.month}</p>
        </div>

        <p className="text-sm font-medium">
          {rupiah.format(budget.spentAmount)} /{" "}
          {rupiah.format(budget.limitAmount)}
        </p>
      </div>

      <BudgetProgressBar
        percentage={budget.percentage}
        status={budget.status}
      />

      <p
        className={`mt-4 text-sm font-medium ${
          exceeded ? "text-red-600" : "text-green-700"
        }`}
      >
        {exceeded ? "Kelebihan: " : "Sisa: "}
        {rupiah.format(Math.abs(budget.remainingAmount))}
      </p>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => onEdit(budget)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed"
        >
          Edit
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => onDelete(budget.id)}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed"
        >
          Hapus
        </button>
      </div>
    </article>
  );
}

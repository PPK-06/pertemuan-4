import type { BudgetSummary } from "@/lib/types/budget";
import BudgetProgressBar from "./budget-progress-bar";

type BudgetSummaryCardProps = {
  summary: BudgetSummary;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function BudgetSummaryCard({
  summary,
}: BudgetSummaryCardProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Ringkasan Budget</h2>
        <p className="text-sm text-gray-500">{summary.month}</p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="font-semibold">
            {rupiah.format(summary.totalBudget)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Total Pengeluaran</p>
          <p className="font-semibold">
            {rupiah.format(summary.totalSpent)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Sisa</p>
          <p
            className={`font-semibold ${
              summary.remaining < 0 ? "text-red-600" : "text-green-700"
            }`}
          >
            {rupiah.format(summary.remaining)}
          </p>
        </div>
      </div>

      <BudgetProgressBar
        percentage={summary.percentage}
        status={summary.status}
        size="lg"
      />

      <p className="mt-4 text-sm text-gray-600">
        Budget terlewati:{" "}
        <span className="font-semibold">{summary.exceededCount}</span>
      </p>
    </section>
  );
}


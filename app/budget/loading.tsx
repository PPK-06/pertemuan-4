import BudgetCardSkeleton from "@/components/budget/budget-card-skeleton";

export default function BudgetLoading() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Budget Bulanan</h1>
      <div className="flex flex-col gap-4" aria-busy="true">
        <p className="text-sm text-gray-500">Memuat anggaran...</p>
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
      </div>
    </div>
  );
}

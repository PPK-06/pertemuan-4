"use client";

import { useState } from "react";
import BudgetAlert from "@/components/budget/budget-alert";
import BudgetCard from "@/components/budget/budget-card";
import BudgetCardSkeleton from "@/components/budget/budget-card-skeleton";
import BudgetFilterBar from "@/components/budget/budget-filter-bar";
import BudgetFormContainer from "@/components/budget/budget-form-container";
import BudgetSummaryCard from "@/components/budget/budget-summary-card";
import { useBudgetManager } from "@/hooks/use-budget-manager";
import type {
  BudgetSummary,
  BudgetWithUsage,
  Option,
} from "@/lib/types/budget";

type BudgetManagerProps = {
  initialMonth: string;
  initialBudgets: BudgetWithUsage[];
  initialSummary: BudgetSummary;
  categoryOptions: Option[];
  walletOptions: Option[];
};

type FormTarget = { mode: "create" } | { mode: "edit"; budget: BudgetWithUsage };

export default function BudgetManager({
  initialMonth,
  initialBudgets,
  initialSummary,
  categoryOptions,
  walletOptions,
}: BudgetManagerProps) {
  const {
    filters,
    budgets,
    summary,
    alert,
    isLoading,
    isMutating,
    loadError,
    actionError,
    changeFilters,
    reload,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useBudgetManager({
    initialFilters: { month: initialMonth, categoryId: "", walletId: "" },
    initialBudgets,
    initialSummary,
    categoryOptions,
    walletOptions,
  });

  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);

  function handleDelete(id: string) {
    if (!confirm("Hapus anggaran ini?")) return;
    void deleteBudget(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <BudgetAlert isVisible={alert.isVisible} alertType={alert.alertType} />

      <BudgetSummaryCard summary={summary} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <BudgetFilterBar
          month={filters.month}
          categoryId={filters.categoryId}
          walletId={filters.walletId}
          categoryOptions={categoryOptions}
          walletOptions={walletOptions}
          isPending={isLoading}
          onMonthChange={(month: string) => changeFilters({ month })}
          onCategoryChange={(categoryId: string) =>
            changeFilters({ categoryId })
          }
          onWalletChange={(walletId: string) => changeFilters({ walletId })}
        />
        <button
          type="button"
          onClick={() => setFormTarget({ mode: "create" })}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          Tambah Anggaran
        </button>
      </div>

      {formTarget && (
        <BudgetFormContainer
          key={formTarget.mode === "edit" ? formTarget.budget.id : "create"}
          budget={formTarget.mode === "edit" ? formTarget.budget : undefined}
          defaultMonth={filters.month}
          categoryOptions={categoryOptions}
          walletOptions={walletOptions}
          isPending={isMutating}
          onCreate={createBudget}
          onUpdate={updateBudget}
          onClose={() => setFormTarget(null)}
        />
      )}

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      {loadError ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            type="button"
            onClick={reload}
            disabled={isLoading}
            className="rounded border px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {isLoading ? "Memuat..." : "Coba lagi"}
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <p className="text-sm text-gray-500">Memuat anggaran...</p>
          <BudgetCardSkeleton />
          <BudgetCardSkeleton />
          <BudgetCardSkeleton />
        </div>
      ) : budgets.length === 0 ? (
        <p className="text-sm text-gray-500">
          Belum ada anggaran untuk filter ini.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => setFormTarget({ mode: "edit", budget })}
              onDelete={() => handleDelete(budget.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

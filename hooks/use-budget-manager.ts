"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import {
  createBudgetAction,
  deleteBudgetAction,
  getBudgetOverviewAction,
  updateBudgetAction,
} from "@/lib/actions/budget";
import type { BudgetInput } from "@/lib/validations/budget";
import type {
  ActionResult,
  BudgetStatus,
  BudgetSummary,
  BudgetWithUsage,
  Option,
} from "@/lib/types/budget";

// String kosong berarti "semua kategori" / "semua dompet".
export type BudgetFilters = {
  month: string;
  categoryId: string;
  walletId: string;
};

export type BudgetAlertState = {
  isVisible: boolean;
  alertType: "warning" | "exceeded";
};

type BudgetChange =
  | { type: "create"; budget: BudgetWithUsage }
  | { type: "update"; budget: BudgetWithUsage }
  | { type: "delete"; id: string };

type UseBudgetManagerArgs = {
  initialFilters: BudgetFilters;
  initialBudgets: BudgetWithUsage[];
  initialSummary: BudgetSummary;
  categoryOptions: Option[];
  walletOptions: Option[];
};

const UNEXPECTED_ERROR = "Terjadi kesalahan. Silakan coba lagi.";

function matchesFilters(budget: BudgetWithUsage, filters: BudgetFilters) {
  return (
    budget.month === filters.month &&
    (!filters.categoryId || budget.categoryId === filters.categoryId) &&
    (!filters.walletId || budget.walletId === filters.walletId)
  );
}

function applyChange(
  budgets: BudgetWithUsage[],
  change: BudgetChange,
  filters: BudgetFilters
): BudgetWithUsage[] {
  switch (change.type) {
    case "create":
      return matchesFilters(change.budget, filters)
        ? [change.budget, ...budgets]
        : budgets;
    case "update":
      return matchesFilters(change.budget, filters)
        ? budgets.map((b) => (b.id === change.budget.id ? change.budget : b))
        : budgets.filter((b) => b.id !== change.budget.id);
    case "delete":
      return budgets.filter((b) => b.id !== change.id);
  }
}

// Perkiraan sementara untuk tampilan optimistic (aturan status di kontrak
// bagian 3). Nilai final selalu diambil dari hasil action.
function estimateUsage(spent: number, limit: number) {
  const percentage = limit > 0 ? Math.round((spent / limit) * 10000) / 100 : 0;
  let status: BudgetStatus = "safe";
  if (percentage > 100) {
    status = "exceeded";
  } else if (percentage >= 80) {
    status = "warning";
  }
  return { percentage, status };
}

export function getBudgetAlertState(
  budgets: BudgetWithUsage[]
): BudgetAlertState {
  const hasExceeded = budgets.some((b) => b.status === "exceeded");
  const hasWarning = budgets.some((b) => b.status === "warning");
  return {
    isVisible: hasExceeded || hasWarning,
    alertType: hasExceeded ? "exceeded" : "warning",
  };
}

export function useBudgetManager({
  initialFilters,
  initialBudgets,
  initialSummary,
  categoryOptions,
  walletOptions,
}: UseBudgetManagerArgs) {
  const [filters, setFilters] = useState(initialFilters);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [summary, setSummary] = useState(initialSummary);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [isLoading, startLoading] = useTransition();
  const [isMutating, startMutation] = useTransition();

  const [optimisticBudgets, applyOptimistic] = useOptimistic(
    budgets,
    (
      current: BudgetWithUsage[],
      action: { change: BudgetChange; filters: BudgetFilters }
    ) => applyChange(current, action.change, action.filters)
  );

  // Id budget yang mutasinya sedang berjalan; kembali null saat transition selesai.
  const [pendingBudgetId, setPendingBudgetId] = useOptimistic<string | null>(
    null
  );

  // Hanya respons dari permintaan overview terakhir yang boleh dipakai.
  const latestRequest = useRef(0);

  async function fetchOverview(target: BudgetFilters) {
    const requestId = ++latestRequest.current;
    let result: ActionResult<{
      budgets: BudgetWithUsage[];
      summary: BudgetSummary;
    }>;
    try {
      result = await getBudgetOverviewAction({
        month: target.month,
        categoryId: target.categoryId || undefined,
        walletId: target.walletId || undefined,
      });
    } catch {
      result = { success: false, error: UNEXPECTED_ERROR };
    }
    return { result, isLatest: requestId === latestRequest.current };
  }

  function loadOverview(target: BudgetFilters) {
    startLoading(async () => {
      const { result, isLatest } = await fetchOverview(target);
      if (!isLatest) return;
      startLoading(() => {
        if (result.success) {
          setBudgets(result.data.budgets);
          setSummary(result.data.summary);
          setLoadError(null);
        } else {
          setLoadError(result.error);
        }
      });
    });
  }

  function changeFilters(next: BudgetFilters) {
    setFilters(next);
    setActionError(null);
    loadOverview(next);
  }

  function reload() {
    loadOverview(filters);
  }

  // Menjalankan mutasi di dalam transition. Tampilan optimistic otomatis
  // kembali ke `budgets` (rollback) saat transition selesai, jadi state asli
  // hanya diubah ketika action berhasil.
  function runMutation<T>(
    optimisticChange: BudgetChange,
    run: () => Promise<ActionResult<T>>,
    toConfirmedChange: (data: T) => BudgetChange
  ): Promise<ActionResult<T>> {
    const target = filters;
    return new Promise((resolve) => {
      startMutation(async () => {
        applyOptimistic({ change: optimisticChange, filters: target });
        setPendingBudgetId(
          optimisticChange.type === "delete"
            ? optimisticChange.id
            : optimisticChange.budget.id
        );

        let result: ActionResult<T>;
        try {
          result = await run();
        } catch {
          result = { success: false, error: UNEXPECTED_ERROR };
        }

        if (!result.success) {
          resolve(result);
          return;
        }

        const confirmed = toConfirmedChange(result.data);
        const overview = await fetchOverview(target);
        startMutation(() => {
          if (overview.result.success && overview.isLatest) {
            setBudgets(overview.result.data.budgets);
            setSummary(overview.result.data.summary);
            setLoadError(null);
          } else {
            setBudgets((current) => applyChange(current, confirmed, target));
          }
        });
        resolve(result);
      });
    });
  }

  function toOptimisticBudget(
    input: BudgetInput,
    base?: BudgetWithUsage
  ): BudgetWithUsage {
    const spentAmount = base?.spentAmount ?? 0;
    return {
      id: base?.id ?? `optimistic-${Date.now()}`,
      month: input.month,
      categoryId: input.categoryId,
      categoryName:
        categoryOptions.find((c) => c.id === input.categoryId)?.name ?? null,
      walletId: input.walletId,
      walletName:
        walletOptions.find((w) => w.id === input.walletId)?.name ?? null,
      limitAmount: input.limitAmount,
      spentAmount,
      remainingAmount: input.limitAmount - spentAmount,
      ...estimateUsage(spentAmount, input.limitAmount),
    };
  }

  function createBudget(
    input: BudgetInput
  ): Promise<ActionResult<BudgetWithUsage>> {
    setActionError(null);
    return runMutation(
      { type: "create", budget: toOptimisticBudget(input) },
      () => createBudgetAction(input),
      (budget) => ({ type: "create", budget })
    );
  }

  function updateBudget(
    id: string,
    input: BudgetInput
  ): Promise<ActionResult<BudgetWithUsage>> {
    setActionError(null);
    const base = budgets.find((b) => b.id === id);
    return runMutation(
      { type: "update", budget: toOptimisticBudget(input, base) },
      () => updateBudgetAction(id, input),
      (budget) => ({ type: "update", budget })
    );
  }

  async function deleteBudget(id: string): Promise<ActionResult<{ id: string }>> {
    setActionError(null);
    const result = await runMutation(
      { type: "delete", id },
      () => deleteBudgetAction(id),
      (data) => ({ type: "delete", id: data.id })
    );
    if (!result.success) {
      setActionError(result.error);
    }
    return result;
  }

  return {
    filters,
    budgets: optimisticBudgets,
    summary,
    alert: getBudgetAlertState(optimisticBudgets),
    isLoading,
    isMutating,
    pendingBudgetId,
    loadError,
    actionError,
    changeFilters,
    reload,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}

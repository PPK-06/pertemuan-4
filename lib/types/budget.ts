export type BudgetStatus = "safe" | "warning" | "exceeded";

export type BudgetWithUsage = {
  id: string;
  month: string;
  categoryId: string | null;
  categoryName: string | null;
  walletId: string | null;
  walletName: string | null;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  status: BudgetStatus;
};

export type BudgetSummary = {
  month: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
  exceededCount: number;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type Option = {
  id: string;
  name: string;
};

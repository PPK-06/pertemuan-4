import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type {
  BudgetStatus,
  BudgetSummary,
  BudgetWithUsage,
  Option,
} from "@/lib/types/budget";

export function calculateBudgetStatus(
  spent: number,
  limit: number
): { percentage: number; status: BudgetStatus } {
  if (limit <= 0) {
    return spent > 0
      ? { percentage: 100, status: "exceeded" }
      : { percentage: 0, status: "safe" };
  }
  const rawPercentage = (spent / limit) * 100;
  const percentage = Math.round(rawPercentage * 100) / 100;

  let status: BudgetStatus = "safe";
  if (percentage > 100) {
    status = "exceeded";
  } else if (percentage >= 80) {
    status = "warning";
  }
  return { percentage, status };
}

function getMonthDateRange(month: string): { startOfMonth: Date; startOfNextMonth: Date } {
  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const startOfMonth = new Date(Date.UTC(year, m - 1, 1));
  const startOfNextMonth = new Date(Date.UTC(year, m, 1));
  return { startOfMonth, startOfNextMonth };
}

export async function getBudgetsWithUsage({
  month,
  categoryId,
  walletId,
}: {
  month: string;
  categoryId?: string;
  walletId?: string;
}): Promise<BudgetWithUsage[]> {
  const user = await requireUser();
  const { startOfMonth, startOfNextMonth } = getMonthDateRange(month);

  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      month,
      ...(categoryId ? { categoryId } : {}),
      ...(walletId ? { walletId } : {}),
    },
    include: {
      category: { select: { id: true, name: true } },
      wallet: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (budgets.length === 0) {
    return [];
  }

  const [categorySums, walletSums, comboSums] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lt: startOfNextMonth },
        categoryId: { not: null },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["walletId"],
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lt: startOfNextMonth },
        walletId: { not: null },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId", "walletId"],
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lt: startOfNextMonth },
        categoryId: { not: null },
        walletId: { not: null },
      },
      _sum: { amount: true },
    }),
  ]);

  const catMap = new Map<string, number>();
  for (const row of categorySums) {
    if (row.categoryId) {
      catMap.set(row.categoryId, Number(row._sum.amount ?? 0));
    }
  }

  const walletMap = new Map<string, number>();
  for (const row of walletSums) {
    if (row.walletId) {
      walletMap.set(row.walletId, Number(row._sum.amount ?? 0));
    }
  }

  const comboMap = new Map<string, number>();
  for (const row of comboSums) {
    if (row.categoryId && row.walletId) {
      comboMap.set(`${row.categoryId}:${row.walletId}`, Number(row._sum.amount ?? 0));
    }
  }

  return budgets.map((b) => {
    let spentAmount = 0;
    if (b.categoryId && b.walletId) {
      spentAmount = comboMap.get(`${b.categoryId}:${b.walletId}`) ?? 0;
    } else if (b.categoryId) {
      spentAmount = catMap.get(b.categoryId) ?? 0;
    } else if (b.walletId) {
      spentAmount = walletMap.get(b.walletId) ?? 0;
    }

    const limitAmount = Number(b.limitAmount);
    const remainingAmount = limitAmount - spentAmount;
    const { percentage, status } = calculateBudgetStatus(spentAmount, limitAmount);

    return {
      id: b.id,
      month: b.month,
      categoryId: b.categoryId,
      categoryName: b.category?.name ?? null,
      walletId: b.walletId,
      walletName: b.wallet?.name ?? null,
      limitAmount,
      spentAmount,
      remainingAmount,
      percentage,
      status,
    };
  });
}

export async function getBudgetSummary({
  month,
}: {
  month: string;
}): Promise<BudgetSummary> {
  const user = await requireUser();
  const { startOfMonth, startOfNextMonth } = getMonthDateRange(month);

  const [budgetAggregate, spentAggregate, budgetsWithUsage] = await Promise.all([
    prisma.budget.aggregate({
      where: { userId: user.id, month },
      _sum: { limitAmount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lt: startOfNextMonth },
      },
      _sum: { amount: true },
    }),
    getBudgetsWithUsage({ month }),
  ]);

  const totalBudget = Number(budgetAggregate._sum.limitAmount ?? 0);
  const totalSpent = Number(spentAggregate._sum.amount ?? 0);
  const remaining = totalBudget - totalSpent;
  const { percentage, status } = calculateBudgetStatus(totalSpent, totalBudget);
  const exceededCount = budgetsWithUsage.filter((b) => b.status === "exceeded").length;

  return {
    month,
    totalBudget,
    totalSpent,
    remaining,
    percentage,
    status,
    exceededCount,
  };
}

export async function getCategoryOptions(): Promise<Option[]> {
  const user = await requireUser();
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return categories.map((c) => ({ id: c.id, name: c.name }));
}

export async function getWalletOptions(): Promise<Option[]> {
  const user = await requireUser();
  const wallets = await prisma.wallet.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return wallets.map((w) => ({ id: w.id, name: w.name }));
}

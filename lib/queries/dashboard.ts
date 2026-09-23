import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { TransactionType } from "@/generated/prisma/client";

type FilterValue = "ALL" | TransactionType;

export async function getTransactionFilter(): Promise<FilterValue> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("transaction_filter")?.value;
  if (raw === "INCOME" || raw === "EXPENSE") return raw;
  return "ALL";
}

export async function getSummary(userId: number) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { type: true, amount: true },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    if (t.type === "INCOME") totalIncome += t.amount;
    else totalExpense += t.amount;
  }

  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

export async function getTransactions(userId: number, filter: FilterValue) {
  return prisma.transaction.findMany({
    where: {
      userId,
      ...(filter !== "ALL" ? { type: filter } : {}),
    },
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });
}

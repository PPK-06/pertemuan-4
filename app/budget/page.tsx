import BudgetManager from "@/components/budget/budget-manager";
// TODO: integrasi query Dhimas — ganti path import ke "@/lib/queries/budget".
import {
  getBudgetSummary,
  getBudgetsWithUsage,
  getCategoryOptions,
  getWalletOptions,
} from "@/lib/mocks/budget-mock";
import { requireUser } from "@/lib/session";

export default async function BudgetPage() {
  await requireUser();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [budgets, summary, categoryOptions, walletOptions] = await Promise.all([
    // TODO: integrasi query Dhimas
    getBudgetsWithUsage({ month }),
    // TODO: integrasi query Dhimas
    getBudgetSummary({ month }),
    // TODO: integrasi query Dhimas
    getCategoryOptions(),
    // TODO: integrasi query Dhimas
    getWalletOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Budget Bulanan</h1>
      <BudgetManager
        initialMonth={month}
        initialBudgets={budgets}
        initialSummary={summary}
        categoryOptions={categoryOptions}
        walletOptions={walletOptions}
      />
    </div>
  );
}

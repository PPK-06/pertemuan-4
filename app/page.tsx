import Link from "next/link";
import { requireUser } from "@/lib/session";
import {
  getTransactionFilter,
  getSummary,
  getTransactions,
} from "@/lib/queries/dashboard";
import SummaryCards from "@/components/dashboard/summary-cards";
import TypeFilter from "@/components/dashboard/type-filter";
import TransactionList from "@/components/dashboard/transaction-list";

export default async function DashboardPage() {
  const user = await requireUser();
  const filter = await getTransactionFilter();
  const summary = await getSummary(user.id);
  const transactions = await getTransactions(user.id, filter);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <SummaryCards
        balance={summary.balance}
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
      />

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold">Riwayat Transaksi</h2>
        <Link
          href="/transactions/new"
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          Tambah Transaksi
        </Link>
      </div>

      <TypeFilter currentFilter={filter} />

      <TransactionList transactions={transactions} />
    </div>
  );
}

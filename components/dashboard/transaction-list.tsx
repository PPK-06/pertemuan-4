import Link from "next/link";
import { formatDate, formatRupiah } from "@/lib/format";
import DeleteTransactionButton from "@/components/transactions/delete-transaction-button";
import type { Transaction } from "@/generated/prisma/client";

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-500">Belum ada transaksi.</p>;
  }

  return (
    <ul className="divide-y rounded border">
      {transactions.map((t) => (
        <li
          key={t.id}
          className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3"
        >
          <span className="w-24 shrink-0 text-sm text-gray-500">
            {formatDate(t.date)}
          </span>
          <span
            className={
              t.type === "INCOME"
                ? "w-24 shrink-0 text-sm font-medium text-green-600"
                : "w-24 shrink-0 text-sm font-medium text-red-600"
            }
          >
            {t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
          </span>
          <span className="w-32 shrink-0 text-sm font-semibold">
            {formatRupiah(t.amount)}
          </span>
          <span className="flex-1 text-sm text-gray-700">
            {t.description ?? <span className="italic text-gray-400">—</span>}
          </span>
          <div className="flex items-center gap-3">
            <Link
              href={`/transactions/${t.id}/edit`}
              className="text-sm text-blue-600 hover:underline"
            >
              Ubah
            </Link>
            <DeleteTransactionButton id={t.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}

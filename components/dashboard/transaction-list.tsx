import Link from "next/link";
import { formatDate, formatRupiah } from "@/lib/format";
import DeleteTransactionButton from "@/components/transactions/delete-transaction-button";
import type { Transaction } from "@/generated/prisma/client";

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div
        className="rounded-2xl p-10 text-center"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--accent-light)" }}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--accent)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Belum ada transaksi</p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Tambahkan transaksi pertama Anda</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="rounded-2xl px-5 py-4 transition-shadow hover:shadow-md"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Left: icon + info */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
                style={{
                  backgroundColor: t.type === "INCOME" ? "var(--income-light)" : "var(--expense-light)",
                }}
              >
                {t.type === "INCOME" ? "↑" : "↓"}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {t.description ?? <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Tanpa keterangan</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: t.type === "INCOME" ? "var(--income-light)" : "var(--expense-light)",
                      color: t.type === "INCOME" ? "var(--income)" : "var(--expense)",
                    }}
                  >
                    {t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDate(t.date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: amount + actions */}
            <div className="flex flex-col items-end gap-2">
              <p
                className="text-base font-bold"
                style={{ color: t.type === "INCOME" ? "var(--income)" : "var(--expense)" }}
              >
                {t.type === "INCOME" ? "+" : "-"}{formatRupiah(t.amount)}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={`/transactions/${t.id}/edit`}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  Edit
                </Link>
                <DeleteTransactionButton id={t.id} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

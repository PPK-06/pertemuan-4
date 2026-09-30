"use client";

import { useActionState } from "react";
import type { Transaction } from "@/generated/prisma/browser";
import { createTransaction, updateTransaction } from "@/lib/actions/transaction";
import { initialState } from "@/lib/action-state";
import { toDateInputValue } from "@/lib/format";

export default function TransactionForm({ transaction }: { transaction?: Transaction }) {
  const action = transaction ? updateTransaction : createTransaction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl p-6"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {transaction && <input type="hidden" name="id" value={transaction.id} />}

      <div>
        <label htmlFor="tx-type" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Jenis Transaksi
        </label>
        <select
          id="tx-type"
          name="type"
          defaultValue={transaction?.type ?? ""}
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-app)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">Pilih jenis transaksi</option>
          <option value="INCOME">Pemasukan</option>
          <option value="EXPENSE">Pengeluaran</option>
        </select>
      </div>

      <div>
        <label htmlFor="tx-amount" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Jumlah (Rp)
        </label>
        <input
          id="tx-amount"
          type="number"
          name="amount"
          defaultValue={transaction?.amount}
          placeholder="Contoh: 50000"
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-app)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      <div>
        <label htmlFor="tx-date" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Tanggal
        </label>
        <input
          id="tx-date"
          type="date"
          name="date"
          defaultValue={transaction ? toDateInputValue(new Date(transaction.date)) : ""}
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-app)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      <div>
        <label htmlFor="tx-description" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Deskripsi <span style={{ color: "var(--text-muted)" }}>(opsional)</span>
        </label>
        <input
          id="tx-description"
          type="text"
          name="description"
          defaultValue={transaction?.description ?? ""}
          placeholder="Catatan transaksi"
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-app)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {state.error && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "#fecaca", backgroundColor: "var(--expense-light)", color: "var(--expense)" }}
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "var(--accent)" }}
      >
        {pending ? "Menyimpan..." : transaction ? "Simpan Perubahan" : "Tambah Transaksi"}
      </button>
    </form>
  );
}

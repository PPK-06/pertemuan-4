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
    <form action={formAction} className="flex flex-col gap-4">
      {transaction && <input type="hidden" name="id" value={transaction.id} />}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Jenis Transaksi
        <select
          name="type"
          defaultValue={transaction?.type ?? ""}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="">Pilih jenis transaksi</option>
          <option value="INCOME">Pemasukan</option>
          <option value="EXPENSE">Pengeluaran</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Jumlah (Rp)
        <input
          type="number"
          name="amount"
          defaultValue={transaction?.amount}
          className="rounded border px-3 py-2 text-sm"
          placeholder="Contoh: 50000"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Tanggal
        <input
          type="date"
          name="date"
          defaultValue={transaction ? toDateInputValue(new Date(transaction.date)) : ""}
          className="rounded border px-3 py-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Deskripsi
        <input
          type="text"
          name="description"
          defaultValue={transaction?.description ?? ""}
          className="rounded border px-3 py-2 text-sm"
          placeholder="Catatan transaksi (opsional)"
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}

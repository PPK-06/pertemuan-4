"use client";

import { useActionState } from "react";
import { deleteTransaction } from "@/lib/actions/transaction";
import { initialState } from "@/lib/action-state";

export default function DeleteTransactionButton({ id }: { id: number }) {
  const [state, formAction, pending] = useActionState(deleteTransaction, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Hapus transaksi ini?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-sm text-red-600 disabled:opacity-50">
        Hapus
      </button>
      {state.error && <span className="ml-2 text-sm text-red-600">{state.error}</span>}
    </form>
  );
}

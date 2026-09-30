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
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ borderColor: "#fecaca", color: "var(--expense)" }}
      >
        {pending ? "..." : "Hapus"}
      </button>
      {state.error && (
        <span className="ml-2 text-xs" style={{ color: "var(--expense)" }}>
          {state.error}
        </span>
      )}
    </form>
  );
}

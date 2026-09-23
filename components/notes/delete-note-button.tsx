"use client";
// REFERENCE IMPLEMENTATION (bukan fitur SRS). Pola tombol hapus:
// hidden input id + confirm() sebelum submit. Tiru untuk DeleteTransactionButton.
import { useActionState } from "react";
import { deleteNote } from "@/lib/actions/note";
import { initialState } from "@/lib/action-state";

export default function DeleteNoteButton({ id }: { id: number }) {
  const [state, formAction, pending] = useActionState(deleteNote, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Hapus catatan ini?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-sm text-red-600">
        Hapus
      </button>
      {state.error && <span className="ml-2 text-sm text-red-600">{state.error}</span>}
    </form>
  );
}

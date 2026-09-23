"use client";
// REFERENCE IMPLEMENTATION (bukan fitur SRS). WAJIB ditiru polanya:
// useActionState + initialState, atribut name = nama field di schema.prisma,
// state.error tampil di atas tombol submit.
import { useActionState } from "react";
import { createNote } from "@/lib/actions/note";
import { initialState } from "@/lib/action-state";

export default function NoteForm() {
  const [state, formAction, pending] = useActionState(createNote, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Judul
        <input name="judul" className="rounded border px-3 py-2" placeholder="Tulis judul catatan" />
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

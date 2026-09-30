"use client";

import { useActionState } from "react";
import { register } from "@/lib/actions/auth";
import { initialState } from "@/lib/action-state";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-app)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
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
          style={{
            borderColor: "#fecaca",
            backgroundColor: "var(--expense-light)",
            color: "var(--expense)",
          }}
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
        {pending ? "Memproses..." : "Buat Akun"}
      </button>
    </form>
  );
}
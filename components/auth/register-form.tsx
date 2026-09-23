"use client";

import { useActionState } from "react";
import { register } from "@/lib/actions/auth";
import { initialState } from "@/lib/action-state";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    register,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1 block font-medium"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block font-medium"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded border p-2"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Daftar"}
      </button>
    </form>
  );
}
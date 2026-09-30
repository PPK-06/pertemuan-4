"use client";
import { useActionState } from "react";
import { setTransactionFilter } from "@/lib/actions/dashboard";
import { initialState } from "@/lib/action-state";

type FilterValue = "ALL" | "INCOME" | "EXPENSE";

interface TypeFilterProps {
  currentFilter: FilterValue;
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "INCOME", label: "Pemasukan" },
  { value: "EXPENSE", label: "Pengeluaran" },
];

export default function TypeFilter({ currentFilter }: TypeFilterProps) {
  const [, formAction, pending] = useActionState(
    setTransactionFilter,
    initialState,
  );

  return (
    <div
      className="flex gap-1 rounded-xl p-1"
      style={{ backgroundColor: "var(--border)" }}
    >
      {FILTERS.map(({ value, label }) => (
        <form key={value} action={formAction} className="flex-1">
          <input type="hidden" name="type" value={value} />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg py-1.5 text-sm font-medium transition-all disabled:opacity-50"
            style={
              currentFilter === value
                ? { backgroundColor: "var(--bg-card)", color: "var(--accent)", boxShadow: "var(--shadow-sm)" }
                : { backgroundColor: "transparent", color: "var(--text-secondary)" }
            }
          >
            {label}
          </button>
        </form>
      ))}
    </div>
  );
}

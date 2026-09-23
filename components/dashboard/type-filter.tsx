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
    <div className="flex gap-2">
      {FILTERS.map(({ value, label }) => (
        <form key={value} action={formAction}>
          <input type="hidden" name="type" value={value} />
          <button
            type="submit"
            disabled={pending}
            className={
              currentFilter === value
                ? "rounded border border-gray-900 bg-gray-900 px-4 py-1.5 text-sm text-white disabled:opacity-50"
                : "rounded border px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            }
          >
            {label}
          </button>
        </form>
      ))}
    </div>
  );
}

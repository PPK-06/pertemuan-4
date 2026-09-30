"use client";

import { useEffect } from "react";

export default function BudgetError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-xl font-semibold">Budget Bulanan</h1>
      <p className="text-sm text-red-600">
        Gagal memuat data anggaran. Silakan coba lagi.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        Coba lagi
      </button>
    </div>
  );
}

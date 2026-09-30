import { formatRupiah } from "@/lib/format";

interface SummaryCardsProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export default function SummaryCards({
  balance,
  totalIncome,
  totalExpense,
}: SummaryCardsProps) {
  const isNegative = balance < 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Saldo — hero card with accent */}
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: isNegative ? "var(--expense)" : "var(--accent)",
          boxShadow: "var(--shadow-md)",
          color: "#fff",
        }}
      >
        <p className="text-sm font-medium opacity-80">Saldo Saat Ini</p>
        <p className="mt-1.5 text-2xl font-bold tracking-tight">
          {formatRupiah(balance)}
        </p>
        {isNegative && (
          <p className="mt-1 text-xs opacity-75">⚠ Saldo negatif</p>
        )}
      </div>

      {/* Total Pemasukan */}
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--income)" }} />
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Pemasukan
          </p>
        </div>
        <p className="text-xl font-bold" style={{ color: "var(--income)" }}>
          {formatRupiah(totalIncome)}
        </p>
      </div>

      {/* Total Pengeluaran */}
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--expense)" }} />
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Pengeluaran
          </p>
        </div>
        <p className="text-xl font-bold" style={{ color: "var(--expense)" }}>
          {formatRupiah(totalExpense)}
        </p>
      </div>
    </div>
  );
}

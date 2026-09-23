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
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Saldo</p>
        <p className="mt-1 text-lg font-semibold">{formatRupiah(balance)}</p>
      </div>
      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Total Pemasukan</p>
        <p className="mt-1 text-lg font-semibold text-green-600">
          {formatRupiah(totalIncome)}
        </p>
      </div>
      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Total Pengeluaran</p>
        <p className="mt-1 text-lg font-semibold text-red-600">
          {formatRupiah(totalExpense)}
        </p>
      </div>
    </div>
  );
}

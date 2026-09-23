import TransactionForm from "@/components/transactions/transaction-form";
import { requireUser } from "@/lib/session";

export default async function NewTransactionPage() {
  await requireUser();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Tambah Transaksi</h1>
      <TransactionForm />
    </div>
  );
}

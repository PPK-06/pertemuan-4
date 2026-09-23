import { notFound } from "next/navigation";
import TransactionForm from "@/components/transactions/transaction-form";
import { getTransaction } from "@/lib/queries/transaction";
import { requireUser } from "@/lib/session";

export default async function EditTransactionPage(props: PageProps<"/transactions/[id]/edit">) {
  const user = await requireUser();
  const { id } = await props.params;
  const transactionId = Number(id);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    notFound();
  }

  const transaction = await getTransaction(transactionId, user.id);
  if (!transaction) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Ubah Transaksi</h1>
      <TransactionForm transaction={transaction} />
    </div>
  );
}

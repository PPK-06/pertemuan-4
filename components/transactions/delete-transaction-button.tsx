// STUB buatan PM. Isi diganti Orang 2 (FR-04): hubungkan ke deleteTransaction
// di lib/actions/transaction.ts dan wajib confirm("Hapus transaksi ini?").
// Nama export dan props { id: number } TIDAK boleh diubah.
export default function DeleteTransactionButton({ id }: { id: number }) {
  return (
    <button type="button" data-id={id} className="text-sm text-red-600">
      Hapus
    </button>
  );
}

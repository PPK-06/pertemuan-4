// DD/MM/YYYY
export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Rp 1.500.000
export function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

// Nilai default untuk <input type="date">: YYYY-MM-DD
export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type BudgetAlertProps = {
  isVisible: boolean;
  alertType: "warning" | "exceeded";
};

export default function BudgetAlert({
  isVisible,
  alertType,
}: BudgetAlertProps) {
  if (!isVisible) return null;

  const exceeded = alertType === "exceeded";

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 text-sm ${
        exceeded
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      <p className="font-semibold">
        {exceeded ? "Budget terlewati" : "Budget hampir habis"}
      </p>

      <p className="mt-1">
        {exceeded
          ? "Pengeluaran telah melebihi batas budget yang ditetapkan."
          : "Pengeluaran sudah mendekati batas budget yang ditetapkan."}
      </p>
    </div>
  );
}

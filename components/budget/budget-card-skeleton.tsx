export default function BudgetCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-xl border border-gray-200 bg-white p-5"
    >
      <div className="mb-4 flex justify-between gap-4">
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>

        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>

      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-3 w-full rounded-full bg-gray-200" />
      </div>

      <div className="mt-4 h-4 w-32 rounded bg-gray-200" />

      <div className="mt-5 flex gap-2">
        <div className="h-9 w-16 rounded-lg bg-gray-200" />
        <div className="h-9 w-20 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

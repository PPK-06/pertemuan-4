import type { BudgetStatus } from "@/lib/types/budget";

type BudgetProgressBarProps = {
  percentage: number;
  status: BudgetStatus;
  size?: "sm" | "md" | "lg";
};

const statusColor: Record<BudgetStatus, string> = {
  safe: "bg-green-500",
  warning: "bg-amber-500",
  exceeded: "bg-red-500",
};

const sizeClass = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export default function BudgetProgressBar({
  percentage,
  status,
  size = "md",
}: BudgetProgressBarProps) {
  const visualPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Pemakaian</span>
        <span className="font-medium text-gray-900">{Math.round(percentage)}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full overflow-hidden rounded-full bg-gray-200 ${sizeClass[size]}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${statusColor[status]}`}
          style={{ width: `${visualPercentage}%` }}
        />
      </div>
    </div>
  );
}


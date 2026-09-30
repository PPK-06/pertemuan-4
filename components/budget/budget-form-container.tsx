"use client";

import { useState } from "react";
import BudgetForm from "@/components/budget/budget-form";
import type { BudgetInput } from "@/lib/validations/budget";
import type { ActionResult, BudgetWithUsage, Option } from "@/lib/types/budget";

type BudgetFormContainerProps = {
  // Diisi saat mengedit; kosong berarti membuat budget baru.
  budget?: BudgetWithUsage;
  defaultMonth: string;
  categoryOptions: Option[];
  walletOptions: Option[];
  isPending: boolean;
  onCreate: (input: BudgetInput) => Promise<ActionResult<BudgetWithUsage>>;
  onUpdate: (
    id: string,
    input: BudgetInput
  ) => Promise<ActionResult<BudgetWithUsage>>;
  onClose: () => void;
};

type ActionFailure = Extract<ActionResult<BudgetWithUsage>, { success: false }>;

export default function BudgetFormContainer({
  budget,
  defaultMonth,
  categoryOptions,
  walletOptions,
  isPending,
  onCreate,
  onUpdate,
  onClose,
}: BudgetFormContainerProps) {
  const [failure, setFailure] = useState<ActionFailure | null>(null);

  async function handleSubmit(input: BudgetInput) {
    setFailure(null);
    const result = budget
      ? await onUpdate(budget.id, input)
      : await onCreate(input);
    if (result.success) {
      onClose();
    } else {
      setFailure(result);
    }
  }

  return (
    <BudgetForm
      budget={budget}
      defaultMonth={defaultMonth}
      categoryOptions={categoryOptions}
      walletOptions={walletOptions}
      isPending={isPending}
      error={failure?.error ?? null}
      fieldErrors={failure?.fieldErrors}
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  );
}

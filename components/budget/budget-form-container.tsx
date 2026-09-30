"use client";

import { useState } from "react";
import type { ComponentProps, FormEvent } from "react";
import BudgetForm from "@/components/budget/budget-form";
import type { BudgetInput } from "@/lib/validations/budget";
import type { ActionResult, BudgetWithUsage, Option } from "@/lib/types/budget";

// Bentuk values dan errors diturunkan dari props BudgetForm, tidak didefinisikan ulang.
type BudgetFormProps = ComponentProps<typeof BudgetForm>;
type FormValues = BudgetFormProps["values"];
type FormErrors = BudgetFormProps["errors"];

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

const FORM_FIELDS = ["categoryId", "walletId", "month", "limitAmount"] as const;

function toFormErrors(fieldErrors?: Record<string, string[]>): FormErrors {
  const errors: FormErrors = {};
  for (const field of FORM_FIELDS) {
    const message = fieldErrors?.[field]?.[0];
    if (message) errors[field] = message;
  }
  return errors;
}

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
  const [values, setValues] = useState<FormValues>({
    categoryId: budget?.categoryId ?? "",
    walletId: budget?.walletId ?? "",
    month: budget?.month ?? defaultMonth,
    limitAmount: budget ? String(budget.limitAmount) : "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleChange(field: keyof FormValues, value: string) {
    setValues((current: FormValues) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const input: BudgetInput = {
      month: values.month,
      limitAmount: Number(values.limitAmount),
      categoryId: values.categoryId || null,
      walletId: values.walletId || null,
    };
    const result = budget
      ? await onUpdate(budget.id, input)
      : await onCreate(input);

    if (result.success) {
      onClose();
      return;
    }

    const nextErrors = toFormErrors(result.fieldErrors);
    setErrors(nextErrors);
    // Pesan umum hanya ditampilkan kalau tidak ada error per field,
    // supaya pesan yang sama tidak muncul dua kali.
    if (Object.keys(nextErrors).length === 0) {
      setFormError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold">
        {budget ? "Edit Anggaran" : "Tambah Anggaran"}
      </h2>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <BudgetForm
        values={values}
        errors={errors}
        categories={categoryOptions}
        wallets={walletOptions}
        isPending={isPending}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      <button
        type="button"
        onClick={onClose}
        disabled={isPending}
        className="self-start rounded border px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      >
        Batal
      </button>
    </div>
  );
}

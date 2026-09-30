"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { budgetSchema } from "@/lib/validations/budget";
import { getBudgetsWithUsage, getBudgetSummary } from "@/lib/queries/budget";
import type {
  ActionResult,
  BudgetSummary,
  BudgetWithUsage,
} from "@/lib/types/budget";

function handleNextRedirect(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Abaikan jika dipanggil di luar konteks request Next.js (misal di test runner)
  }
}

function parseRawInput(input: unknown): unknown {
  if (typeof FormData !== "undefined" && input instanceof FormData) {
    return {
      month: input.get("month"),
      limitAmount: input.get("limitAmount"),
      categoryId: input.get("categoryId"),
      walletId: input.get("walletId"),
    };
  }
  return input;
}

export async function getBudgetOverviewAction(input: {
  month: string;
  categoryId?: string;
  walletId?: string;
}): Promise<ActionResult<{ budgets: BudgetWithUsage[]; summary: BudgetSummary }>> {
  try {
    await requireUser();

    if (!input.month || !/^\d{4}-(?:0[1-9]|1[0-2])$/.test(input.month)) {
      return { success: false, error: "Format bulan tidak valid. Gunakan YYYY-MM." };
    }

    const [budgets, summary] = await Promise.all([
      getBudgetsWithUsage({
        month: input.month,
        categoryId: input.categoryId,
        walletId: input.walletId,
      }),
      getBudgetSummary({ month: input.month }),
    ]);

    return {
      success: true,
      data: { budgets, summary },
    };
  } catch (error) {
    handleNextRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil data ringkasan anggaran.",
    };
  }
}

export async function createBudgetAction(
  input: unknown
): Promise<ActionResult<BudgetWithUsage>> {
  try {
    const user = await requireUser();
    const raw = parseRawInput(input);
    const parsed = budgetSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] ?? "Input tidak valid.";
      return {
        success: false,
        error: firstError,
        fieldErrors,
      };
    }

    const data = parsed.data;

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId: user.id },
      });
      if (!category) {
        return { success: false, error: "Kategori tidak ditemukan atau bukan milik Anda." };
      }
    }

    if (data.walletId) {
      const wallet = await prisma.wallet.findFirst({
        where: { id: data.walletId, userId: user.id },
      });
      if (!wallet) {
        return { success: false, error: "Dompet tidak ditemukan atau bukan milik Anda." };
      }
    }

    const duplicate = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        month: data.month,
        categoryId: data.categoryId ?? null,
        walletId: data.walletId ?? null,
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: "Anggaran untuk kombinasi periode, kategori, dan dompet ini sudah ada.",
      };
    }

    const created = await prisma.budget.create({
      data: {
        userId: user.id,
        month: data.month,
        limitAmount: data.limitAmount,
        categoryId: data.categoryId ?? null,
        walletId: data.walletId ?? null,
      },
      include: {
        category: { select: { id: true, name: true } },
        wallet: { select: { id: true, name: true } },
      },
    });

    safeRevalidatePath("/budget");

    const usages = await getBudgetsWithUsage({ month: data.month });
    const usage = usages.find((b) => b.id === created.id);

    return {
      success: true,
      data: usage ?? {
        id: created.id,
        month: created.month,
        categoryId: created.categoryId,
        categoryName: created.category?.name ?? null,
        walletId: created.walletId,
        walletName: created.wallet?.name ?? null,
        limitAmount: Number(created.limitAmount),
        spentAmount: 0,
        remainingAmount: Number(created.limitAmount),
        percentage: 0,
        status: "safe",
      },
    };
  } catch (error) {
    handleNextRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan anggaran.",
    };
  }
}

export async function updateBudgetAction(
  id: string,
  input: unknown
): Promise<ActionResult<BudgetWithUsage>> {
  try {
    const user = await requireUser();

    if (!id || typeof id !== "string") {
      return { success: false, error: "ID anggaran tidak valid." };
    }

    const existing = await prisma.budget.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Anggaran tidak ditemukan atau Anda tidak memiliki akses.",
      };
    }

    const raw = parseRawInput(input);
    const parsed = budgetSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] ?? "Input tidak valid.";
      return {
        success: false,
        error: firstError,
        fieldErrors,
      };
    }

    const data = parsed.data;

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId: user.id },
      });
      if (!category) {
        return { success: false, error: "Kategori tidak ditemukan atau bukan milik Anda." };
      }
    }

    if (data.walletId) {
      const wallet = await prisma.wallet.findFirst({
        where: { id: data.walletId, userId: user.id },
      });
      if (!wallet) {
        return { success: false, error: "Dompet tidak ditemukan atau bukan milik Anda." };
      }
    }

    const duplicate = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        month: data.month,
        categoryId: data.categoryId ?? null,
        walletId: data.walletId ?? null,
        NOT: { id },
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: "Anggaran untuk kombinasi periode, kategori, dan dompet ini sudah ada.",
      };
    }

    await prisma.budget.update({
      where: { id },
      data: {
        month: data.month,
        limitAmount: data.limitAmount,
        categoryId: data.categoryId ?? null,
        walletId: data.walletId ?? null,
      },
    });

    safeRevalidatePath("/budget");

    const usages = await getBudgetsWithUsage({ month: data.month });
    const usage = usages.find((b) => b.id === id);

    if (!usage) {
      return { success: false, error: "Data anggaran yang diperbarui tidak ditemukan." };
    }

    return {
      success: true,
      data: usage,
    };
  } catch (error) {
    handleNextRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui anggaran.",
    };
  }
}

export async function deleteBudgetAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();

    if (!id || typeof id !== "string") {
      return { success: false, error: "ID anggaran tidak valid." };
    }

    const existing = await prisma.budget.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Anggaran tidak ditemukan atau Anda tidak memiliki akses.",
      };
    }

    await prisma.budget.delete({
      where: { id },
    });

    safeRevalidatePath("/budget");

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    handleNextRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus anggaran.",
    };
  }
}

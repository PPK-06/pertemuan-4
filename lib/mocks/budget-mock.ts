// MOCK SEMENTARA untuk halaman /budget. Nama dan signature fungsi sengaja sama
// persis dengan milik Dhimas (lib/queries/budget.ts dan lib/actions/budget.ts)
// supaya penggantian nanti cukup mengubah path import.
//
// Data hidup di memori modul: mutasi hanya bertahan sampai halaman di-reload.
//
// Cara memicu kegagalan (SEMENTARA, untuk menguji rollback dan state error):
// - Client, lewat console browser:
//     localStorage.setItem("budget-mock-fail", "all")
//   Nilai boleh "all" atau gabungan "overview,create,update,delete".
//   Matikan dengan localStorage.removeItem("budget-mock-fail").
// - Server (memicu app/budget/error.tsx): jalankan dev server dengan env
//     BUDGET_MOCK_FAIL=query
import type { BudgetInput } from "@/lib/validations/budget";
import type {
  ActionResult,
  BudgetStatus,
  BudgetSummary,
  BudgetWithUsage,
  Option,
} from "@/lib/types/budget";

const MOCK_DELAY_MS = 600;
const FAIL_STORAGE_KEY = "budget-mock-fail";

type FailTarget = "query" | "overview" | "create" | "update" | "delete";

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function shouldFail(target: FailTarget): boolean {
  let flag: string | null | undefined;
  if (typeof window === "undefined") {
    flag = process.env.BUDGET_MOCK_FAIL;
  } else {
    try {
      flag = window.localStorage.getItem(FAIL_STORAGE_KEY);
    } catch {
      flag = null;
    }
  }
  if (!flag) return false;
  const targets = flag.split(",").map((t) => t.trim());
  return targets.includes("all") || targets.includes(target);
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function calculateStatus(
  spent: number,
  limit: number
): { percentage: number; status: BudgetStatus } {
  if (limit <= 0) {
    return spent > 0
      ? { percentage: 100, status: "exceeded" }
      : { percentage: 0, status: "safe" };
  }
  const percentage = Math.round((spent / limit) * 10000) / 100;
  let status: BudgetStatus = "safe";
  if (percentage > 100) {
    status = "exceeded";
  } else if (percentage >= 80) {
    status = "warning";
  }
  return { percentage, status };
}

const categories: Option[] = [
  { id: "cat-food", name: "Makanan" },
  { id: "cat-transport", name: "Transportasi" },
  { id: "cat-entertainment", name: "Hiburan" },
  { id: "cat-bills", name: "Tagihan" },
];

const wallets: Option[] = [
  { id: "wallet-cash", name: "Tunai" },
  { id: "wallet-bank", name: "Rekening Bank" },
  { id: "wallet-ewallet", name: "E-Wallet" },
];

type MockBudget = {
  id: string;
  month: string;
  categoryId: string | null;
  walletId: string | null;
  limitAmount: number;
  spentAmount: number;
};

// Satu budget per status (safe, warning, exceeded) di bulan berjalan.
// Bulan lain sengaja kosong supaya state kosong bisa diuji lewat filter bulan.
let store: MockBudget[] = [
  {
    id: "mock-1",
    month: currentMonth(),
    categoryId: "cat-food",
    walletId: null,
    limitAmount: 1500000,
    spentAmount: 600000,
  },
  {
    id: "mock-2",
    month: currentMonth(),
    categoryId: "cat-transport",
    walletId: null,
    limitAmount: 500000,
    spentAmount: 450000,
  },
  {
    id: "mock-3",
    month: currentMonth(),
    categoryId: null,
    walletId: "wallet-ewallet",
    limitAmount: 300000,
    spentAmount: 375000,
  },
];

let nextId = store.length + 1;

function toBudgetWithUsage(budget: MockBudget): BudgetWithUsage {
  const { percentage, status } = calculateStatus(
    budget.spentAmount,
    budget.limitAmount
  );
  return {
    id: budget.id,
    month: budget.month,
    categoryId: budget.categoryId,
    categoryName:
      categories.find((c) => c.id === budget.categoryId)?.name ?? null,
    walletId: budget.walletId,
    walletName: wallets.find((w) => w.id === budget.walletId)?.name ?? null,
    limitAmount: budget.limitAmount,
    spentAmount: budget.spentAmount,
    remainingAmount: budget.limitAmount - budget.spentAmount,
    percentage,
    status,
  };
}

function filterBudgets(input: {
  month: string;
  categoryId?: string;
  walletId?: string;
}): BudgetWithUsage[] {
  return store
    .filter(
      (b) =>
        b.month === input.month &&
        (!input.categoryId || b.categoryId === input.categoryId) &&
        (!input.walletId || b.walletId === input.walletId)
    )
    .map(toBudgetWithUsage);
}

function summarize(month: string): BudgetSummary {
  const budgets = filterBudgets({ month });
  const totalBudget = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const { percentage, status } = calculateStatus(totalSpent, totalBudget);
  return {
    month,
    totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
    percentage,
    status,
    exceededCount: budgets.filter((b) => b.status === "exceeded").length,
  };
}

type ValidationResult =
  | { success: true; data: BudgetInput }
  | { success: false; error: string; fieldErrors: Record<string, string[]> };

// Meniru aturan lib/validations/budget.ts agar fieldErrors bisa diuji di form.
function validate(input: unknown, excludeId?: string): ValidationResult {
  const raw = (input ?? {}) as Record<string, unknown>;
  const fieldErrors: Record<string, string[]> = {};

  const month = typeof raw.month === "string" ? raw.month : "";
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month)) {
    fieldErrors.month = ["Format bulan harus YYYY-MM"];
  }

  const limitAmount = Number(raw.limitAmount);
  if (!Number.isInteger(limitAmount)) {
    fieldErrors.limitAmount = ["Batas anggaran harus berupa bilangan bulat"];
  } else if (limitAmount <= 0) {
    fieldErrors.limitAmount = ["Batas anggaran harus lebih dari 0"];
  }

  const categoryId =
    typeof raw.categoryId === "string" && raw.categoryId.trim() !== ""
      ? raw.categoryId.trim()
      : null;
  const walletId =
    typeof raw.walletId === "string" && raw.walletId.trim() !== ""
      ? raw.walletId.trim()
      : null;
  if (categoryId === null && walletId === null) {
    fieldErrors.categoryId = [
      "Minimal salah satu dari kategori atau dompet harus diisi",
    ];
  }

  const firstError = Object.values(fieldErrors).flat()[0];
  if (firstError) {
    return { success: false, error: firstError, fieldErrors };
  }

  const duplicate = store.some(
    (b) =>
      b.id !== excludeId &&
      b.month === month &&
      b.categoryId === categoryId &&
      b.walletId === walletId
  );
  if (duplicate) {
    return {
      success: false,
      error:
        "Anggaran untuk kombinasi periode, kategori, dan dompet ini sudah ada.",
      fieldErrors: {},
    };
  }

  return { success: true, data: { month, limitAmount, categoryId, walletId } };
}

export async function getBudgetsWithUsage(input: {
  month: string;
  categoryId?: string;
  walletId?: string;
}): Promise<BudgetWithUsage[]> {
  await delay();
  if (shouldFail("query")) {
    throw new Error("Mock: gagal memuat daftar anggaran.");
  }
  return filterBudgets(input);
}

export async function getBudgetSummary({
  month,
}: {
  month: string;
}): Promise<BudgetSummary> {
  await delay();
  if (shouldFail("query")) {
    throw new Error("Mock: gagal memuat ringkasan anggaran.");
  }
  return summarize(month);
}

export async function getCategoryOptions(): Promise<Option[]> {
  await delay();
  return categories;
}

export async function getWalletOptions(): Promise<Option[]> {
  await delay();
  return wallets;
}

export async function getBudgetOverviewAction(input: {
  month: string;
  categoryId?: string;
  walletId?: string;
}): Promise<
  ActionResult<{ budgets: BudgetWithUsage[]; summary: BudgetSummary }>
> {
  await delay();
  if (shouldFail("overview")) {
    return { success: false, error: "Mock: gagal mengambil data anggaran." };
  }
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(input.month)) {
    return {
      success: false,
      error: "Format bulan tidak valid. Gunakan YYYY-MM.",
    };
  }
  return {
    success: true,
    data: { budgets: filterBudgets(input), summary: summarize(input.month) },
  };
}

export async function createBudgetAction(
  input: unknown
): Promise<ActionResult<BudgetWithUsage>> {
  await delay();
  if (shouldFail("create")) {
    return { success: false, error: "Mock: gagal menambahkan anggaran." };
  }
  const parsed = validate(input);
  if (!parsed.success) {
    return parsed;
  }
  const created: MockBudget = {
    id: `mock-${nextId++}`,
    month: parsed.data.month,
    categoryId: parsed.data.categoryId,
    walletId: parsed.data.walletId,
    limitAmount: parsed.data.limitAmount,
    spentAmount: 0,
  };
  store = [created, ...store];
  return { success: true, data: toBudgetWithUsage(created) };
}

export async function updateBudgetAction(
  id: string,
  input: unknown
): Promise<ActionResult<BudgetWithUsage>> {
  await delay();
  if (shouldFail("update")) {
    return { success: false, error: "Mock: gagal memperbarui anggaran." };
  }
  const existing = store.find((b) => b.id === id);
  if (!existing) {
    return {
      success: false,
      error: "Anggaran tidak ditemukan atau Anda tidak memiliki akses.",
    };
  }
  const parsed = validate(input, id);
  if (!parsed.success) {
    return parsed;
  }
  const updated: MockBudget = {
    ...existing,
    month: parsed.data.month,
    categoryId: parsed.data.categoryId,
    walletId: parsed.data.walletId,
    limitAmount: parsed.data.limitAmount,
  };
  store = store.map((b) => (b.id === id ? updated : b));
  return { success: true, data: toBudgetWithUsage(updated) };
}

export async function deleteBudgetAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  await delay();
  if (shouldFail("delete")) {
    return { success: false, error: "Mock: gagal menghapus anggaran." };
  }
  if (!store.some((b) => b.id === id)) {
    return {
      success: false,
      error: "Anggaran tidak ditemukan atau Anda tidak memiliki akses.",
    };
  }
  store = store.filter((b) => b.id !== id);
  return { success: true, data: { id } };
}

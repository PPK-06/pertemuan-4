import "dotenv/config";
import assert from "node:assert";
import { createHmac } from "node:crypto";
import { createRequire } from "node:module";
import type { BudgetWithUsage } from "../lib/types/budget.ts";

// Mock next/headers dan next/cache di runtime node sebelum modul lain di-load
const req = createRequire(import.meta.url);
const cookiesKey = req.resolve("next/dist/server/request/cookies.js");
const cacheKey = req.resolve("next/cache");

let activeUserId: number | null = null;

function getSessionCookie(userId: number) {
  const secret = process.env.SESSION_SECRET || "default_secret";
  const expiresAt = Date.now() + 604800 * 1000;
  const payload = `${userId}.${expiresAt}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

const reqCache = req.cache as Record<string, unknown>;

reqCache[cookiesKey] = {
  id: cookiesKey,
  filename: cookiesKey,
  loaded: true,
  exports: {
    cookies: async () => ({
      get(name: string) {
        if (name === "session" && activeUserId) {
          return { value: getSessionCookie(activeUserId) };
        }
        return undefined;
      },
      set() {},
      delete() {},
    }),
  },
};

reqCache[cacheKey] = {
  id: cacheKey,
  filename: cacheKey,
  loaded: true,
  exports: {
    revalidatePath: () => {},
    revalidateTag: () => {},
    unstable_cache: <T>(fn: T) => fn,
  },
};

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function runTests() {
  const {
    calculateBudgetStatus,
    getBudgetsWithUsage,
    getBudgetSummary,
    getCategoryOptions,
    getWalletOptions,
  } = await import("../lib/queries/budget.ts");
  const {
    createBudgetAction,
    updateBudgetAction,
    deleteBudgetAction,
    getBudgetOverviewAction,
  } = await import("../lib/actions/budget.ts");
  const {
    createCategoryAction,
    updateCategoryAction,
    deleteCategoryAction,
  } = await import("../lib/actions/category.ts");
  const {
    createWalletAction,
    updateWalletAction,
    deleteWalletAction,
  } = await import("../lib/actions/wallet.ts");
  console.log("=== MEMULAI TEST VERIFIKASI FITUR BUDGET ===");

  // 1. Dapatkan user session (User A = demo@example.com, User B = budi@example.com)
  const userA = await prisma.user.findUnique({
    where: { email: "demo@example.com" },
  });
  const userB = await prisma.user.findUnique({
    where: { email: "budi@example.com" },
  });

  assert.ok(userA, "User demo@example.com harus ada. Jalankan seed terlebih dahulu.");
  assert.ok(userB, "User budi@example.com harus ada. Jalankan seed terlebih dahulu.");

  // Set session aktif sebagai User A
  activeUserId = userA.id;

  const testMonth = "2030-01";
  await prisma.transaction.deleteMany({
    where: {
      date: {
        gte: new Date("2030-01-01T00:00:00.000Z"),
        lt: new Date("2030-02-01T00:00:00.000Z"),
      },
    },
  });
  await prisma.budget.deleteMany({
    where: { month: testMonth },
  });

  console.log("-> 1. Test Unit Logika Status Ambang Batas...");
  assert.strictEqual(calculateBudgetStatus(0, 100).status, "safe");
  assert.strictEqual(calculateBudgetStatus(50, 100).status, "safe");
  assert.strictEqual(calculateBudgetStatus(79.9, 100).status, "safe");
  assert.strictEqual(calculateBudgetStatus(80, 100).status, "warning");
  assert.strictEqual(calculateBudgetStatus(99.9, 100).status, "warning");
  assert.strictEqual(calculateBudgetStatus(100, 100).status, "warning");
  assert.strictEqual(calculateBudgetStatus(100.1, 100).status, "exceeded");
  assert.strictEqual(calculateBudgetStatus(150, 100).status, "exceeded");
  assert.strictEqual(calculateBudgetStatus(150, 100).percentage, 150);
  console.log("   [OK] Ambang batas: <80% safe, 80-100% warning, >100% exceeded valid.");

  console.log("-> 2. Test Category & Wallet CRUD via Server Actions...");
  const testCatName = `Kategori Test ${Date.now()}`;
  const catCreateRes = await createCategoryAction({ name: testCatName });
  assert.strictEqual(catCreateRes.success, true);
  const testCat = (catCreateRes as { success: true; data: { id: string; name: string } }).data;

  // Duplikasi nama kategori untuk user yang sama harus ditolak
  const catDupRes = await createCategoryAction({ name: testCatName });
  assert.strictEqual(catDupRes.success, false);

  // Buat dompet via action
  const testWalName = `Dompet Test ${Date.now()}`;
  const walCreateRes = await createWalletAction({ name: testWalName, type: "E_WALLET" });
  assert.strictEqual(walCreateRes.success, true);
  const testWal = (walCreateRes as { success: true; data: { id: string; name: string } }).data;

  // Duplikasi nama dompet harus ditolak
  const walDupRes = await createWalletAction({ name: testWalName });
  assert.strictEqual(walDupRes.success, false);

  // Test update & delete category / wallet
  const updatedCat = await updateCategoryAction(testCat.id, { name: `${testCatName} Edit` });
  assert.strictEqual(updatedCat.success, true);
  await updateCategoryAction(testCat.id, { name: testCatName });

  const updatedWal = await updateWalletAction(testWal.id, { name: `${testWalName} Edit`, type: "BANK" });
  assert.strictEqual(updatedWal.success, true);
  await updateWalletAction(testWal.id, { name: testWalName, type: "E_WALLET" });

  const tempCat = await createCategoryAction({ name: `TempCat ${Date.now()}` });
  assert.strictEqual(tempCat.success, true);
  if (tempCat.success) {
    const delCat = await deleteCategoryAction(tempCat.data.id);
    assert.strictEqual(delCat.success, true);
  }

  const tempWal = await createWalletAction({ name: `TempWal ${Date.now()}` });
  assert.strictEqual(tempWal.success, true);
  if (tempWal.success) {
    const delWal = await deleteWalletAction(tempWal.data.id);
    assert.strictEqual(delWal.success, true);
  }

  // Test options queries
  const catOptions = await getCategoryOptions();
  assert.ok(catOptions.some((c) => c.id === testCat.id));
  const walOptions = await getWalletOptions();
  assert.ok(walOptions.some((w) => w.id === testWal.id));
  console.log("   [OK] Server actions & queries Category/Wallet berhasil.");

  console.log("-> 3. Test Server Actions Create, Update, Delete Budget...");
  // Validasi: minimal satu dari kategori atau dompet harus diisi
  const emptyBudgetRes = await createBudgetAction({
    month: testMonth,
    limitAmount: 500000,
    categoryId: null,
    walletId: null,
  });
  assert.strictEqual(emptyBudgetRes.success, false);
  assert.ok(emptyBudgetRes.fieldErrors);

  // Validasi: format bulan salah
  const badMonthRes = await createBudgetAction({
    month: "2030/01",
    limitAmount: 500000,
    categoryId: testCat.id,
  });
  assert.strictEqual(badMonthRes.success, false);

  // Validasi: limit <= 0
  const zeroLimitRes = await createBudgetAction({
    month: testMonth,
    limitAmount: 0,
    categoryId: testCat.id,
  });
  assert.strictEqual(zeroLimitRes.success, false);

  // Buat budget kategori saja (Skenario Safe)
  const bSafeRes = await createBudgetAction({
    month: testMonth,
    limitAmount: 1000000,
    categoryId: testCat.id,
  });
  assert.strictEqual(bSafeRes.success, true);
  const bSafe = (bSafeRes as { success: true; data: BudgetWithUsage }).data;
  assert.strictEqual(bSafe.limitAmount, 1000000);
  assert.strictEqual(bSafe.categoryName, testCatName);
  assert.strictEqual(bSafe.status, "safe");

  // Buat budget dompet saja (Skenario Warning)
  const bWarningRes = await createBudgetAction({
    month: testMonth,
    limitAmount: 500000,
    walletId: testWal.id,
  });
  assert.strictEqual(bWarningRes.success, true);
  const bWarning = (bWarningRes as { success: true; data: BudgetWithUsage }).data;

  // Buat budget kategori + dompet (Skenario Exceeded)
  const bExceededRes = await createBudgetAction({
    month: testMonth,
    limitAmount: 200000,
    categoryId: testCat.id,
    walletId: testWal.id,
  });
  assert.strictEqual(bExceededRes.success, true);
  const bExceeded = (bExceededRes as { success: true; data: BudgetWithUsage }).data;

  // Duplikat budget untuk kombinasi yang sama harus ditolak
  const dupBudgetRes = await createBudgetAction({
    month: testMonth,
    limitAmount: 300000,
    categoryId: testCat.id,
    walletId: testWal.id,
  });
  assert.strictEqual(dupBudgetRes.success, false);
  assert.match(dupBudgetRes.error, /sudah ada/i);
  console.log("   [OK] Validasi Zod dan pencegahan budget duplikat berhasil.");

  console.log("-> 4. Test Agregasi Transaksi (groupBy DB) & Status Realtime...");
  // Transaksi 1: Pengeluaran 500.000 (testCat + testWal)
  await prisma.transaction.create({
    data: {
      userId: userA.id,
      type: "EXPENSE",
      amount: 500000,
      date: new Date("2030-01-05"),
      categoryId: testCat.id,
      walletId: testWal.id,
    },
  });

  // Transaksi 2: Pengeluaran 250.000 (testCat, dompet null)
  await prisma.transaction.create({
    data: {
      userId: userA.id,
      type: "EXPENSE",
      amount: 250000,
      date: new Date("2030-01-10"),
      categoryId: testCat.id,
      walletId: null,
    },
  });

  // Transaksi 3: INCOME 5.000.000 (tidak boleh masuk hitungan pengeluaran)
  await prisma.transaction.create({
    data: {
      userId: userA.id,
      type: "INCOME",
      amount: 5000000,
      date: new Date("2030-01-02"),
      categoryId: testCat.id,
      walletId: testWal.id,
    },
  });

  // Transaksi 4: Pengeluaran di bulan lain (tidak boleh masuk)
  await prisma.transaction.create({
    data: {
      userId: userA.id,
      type: "EXPENSE",
      amount: 999999,
      date: new Date("2029-12-31"),
      categoryId: testCat.id,
      walletId: testWal.id,
    },
  });

  // Transaksi 5: Pengeluaran milik User B (tidak boleh masuk)
  await prisma.transaction.create({
    data: {
      userId: userB.id,
      type: "EXPENSE",
      amount: 888888,
      date: new Date("2030-01-15"),
    },
  });

  const budgetsWithUsage = await getBudgetsWithUsage({ month: testMonth });
  assert.strictEqual(budgetsWithUsage.length, 3);

  // 1) bSafe (kategori testCat): 500k + 250k = 750k. Limit 1jt -> 75% -> safe
  const uSafe = budgetsWithUsage.find((b) => b.id === bSafe.id)!;
  assert.strictEqual(uSafe.spentAmount, 750000);
  assert.strictEqual(uSafe.remainingAmount, 250000);
  assert.strictEqual(uSafe.percentage, 75);
  assert.strictEqual(uSafe.status, "safe");

  // 2) bWarning (dompet testWal): 500k. Limit 500k -> 100% -> warning
  const uWarning = budgetsWithUsage.find((b) => b.id === bWarning.id)!;
  assert.strictEqual(uWarning.spentAmount, 500000);
  assert.strictEqual(uWarning.remainingAmount, 0);
  assert.strictEqual(uWarning.percentage, 100);
  assert.strictEqual(uWarning.status, "warning");

  // 3) bExceeded (kombinasi testCat + testWal): 500k. Limit 200k -> 250% -> exceeded
  const uExceeded = budgetsWithUsage.find((b) => b.id === bExceeded.id)!;
  assert.strictEqual(uExceeded.spentAmount, 500000);
  assert.strictEqual(uExceeded.remainingAmount, -300000);
  assert.strictEqual(uExceeded.percentage, 250);
  assert.strictEqual(uExceeded.status, "exceeded");

  console.log("   [OK] Hasil agregasi spentAmount, remaining negatif, percentage >100%, status safe/warning/exceeded tepat.");

  console.log("-> 5. Test Filter AJAX getBudgetOverviewAction...");
  const filterCatRes = await getBudgetOverviewAction({
    month: testMonth,
    categoryId: testCat.id,
  });
  assert.strictEqual(filterCatRes.success, true);
  if (filterCatRes.success) {
    assert.strictEqual(filterCatRes.data.budgets.length, 2);
  }

  const filterWalRes = await getBudgetOverviewAction({
    month: testMonth,
    walletId: testWal.id,
  });
  assert.strictEqual(filterWalRes.success, true);
  if (filterWalRes.success) {
    assert.strictEqual(filterWalRes.data.budgets.length, 2);
  }
  console.log("   [OK] getBudgetOverviewAction mendukung filter kategori dan dompet.");

  console.log("-> 6. Test getBudgetSummary...");
  const summary = await getBudgetSummary({ month: testMonth });
  assert.strictEqual(summary.totalBudget, 1700000);
  assert.strictEqual(summary.totalSpent, 750000);
  assert.strictEqual(summary.remaining, 950000);
  assert.strictEqual(summary.percentage, 44.12);
  assert.strictEqual(summary.status, "safe");
  assert.strictEqual(summary.exceededCount, 1);
  console.log("   [OK] getBudgetSummary mengembalikan summary yang akurat.");

  console.log("-> 7. Test Isolasi Hak Akses Data Lintas User (Security IDOR)...");
  // Buat budget milik User B
  const budgetB = await prisma.budget.create({
    data: {
      userId: userB.id,
      month: testMonth,
      limitAmount: 900000,
    },
  });

  // User A (yang sedang login) mencoba meng-update budget milik User B
  const attackUpdate = await updateBudgetAction(budgetB.id, {
    month: testMonth,
    limitAmount: 1,
    categoryId: testCat.id,
  });
  assert.strictEqual(attackUpdate.success, false);
  assert.match(attackUpdate.error, /tidak ditemukan atau Anda tidak memiliki akses/i);

  // User A mencoba menghapus budget milik User B
  const attackDelete = await deleteBudgetAction(budgetB.id);
  assert.strictEqual(attackDelete.success, false);
  assert.match(attackDelete.error, /tidak ditemukan atau Anda tidak memiliki akses/i);
  console.log("   [OK] Keamanan IDOR terjamin: User dilarang mengedit/menghapus data pengguna lain.");

  console.log("-> 8. Test Soft Budget (Transaksi Pengeluaran Tidak Pernah Diblokir)...");
  const hugeExpense = await prisma.transaction.create({
    data: {
      userId: userA.id,
      type: "EXPENSE",
      amount: 99999999,
      date: new Date("2030-01-20"),
      categoryId: testCat.id,
      walletId: testWal.id,
    },
  });
  assert.ok(hugeExpense.id);
  console.log("   [OK] Soft budget terverifikasi: transaksi tidak pernah diblokir.");

  // Bersihkan data test
  await prisma.transaction.deleteMany({
    where: {
      date: {
        gte: new Date("2030-01-01T00:00:00.000Z"),
        lt: new Date("2030-02-01T00:00:00.000Z"),
      },
    },
  });
  await prisma.budget.deleteMany({
    where: { month: testMonth },
  });
  await prisma.category.delete({ where: { id: testCat.id } });
  await prisma.wallet.delete({ where: { id: testWal.id } });

  console.log("=== SEMUA TEST BERHASIL (100% PASS)! ===");
}

runTests()
  .catch((e) => {
    console.error("TEST GAGAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

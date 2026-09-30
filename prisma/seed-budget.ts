import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const defaultCategories = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja",
  "Tagihan & Utilitas",
  "Hiburan",
  "Kesehatan",
];

const defaultWallets = [
  { name: "Dompet Tunai", type: "CASH" },
  { name: "Rekening BCA", type: "BANK" },
  { name: "GoPay", type: "E_WALLET" },
];

async function main() {
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@example.com" },
  });

  if (!demoUser) {
    console.log("User demo@example.com tidak ditemukan. Jalankan seed utama terlebih dahulu (npm run seed).");
    return;
  }

  // 1. Seed Categories
  const categoryMap = new Map<string, string>();
  for (const catName of defaultCategories) {
    const cat = await prisma.category.upsert({
      where: {
        userId_name: {
          userId: demoUser.id,
          name: catName,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        name: catName,
      },
    });
    categoryMap.set(catName, cat.id);
  }

  // 2. Seed Wallets
  const walletMap = new Map<string, string>();
  for (const w of defaultWallets) {
    const wal = await prisma.wallet.upsert({
      where: {
        userId_name: {
          userId: demoUser.id,
          name: w.name,
        },
      },
      update: { type: w.type },
      create: {
        userId: demoUser.id,
        name: w.name,
        type: w.type,
      },
    });
    walletMap.set(w.name, wal.id);
  }

  // 3. Update existing transactions with category and wallet if unassigned
  const makananId = categoryMap.get("Makanan & Minuman")!;
  const transportId = categoryMap.get("Transportasi")!;
  const tagihanId = categoryMap.get("Tagihan & Utilitas")!;
  const belanjaId = categoryMap.get("Belanja")!;

  const cashId = walletMap.get("Dompet Tunai")!;
  const bcaId = walletMap.get("Rekening BCA")!;
  const gopayId = walletMap.get("GoPay")!;

  // Hubungkan transaksi demo yang sudah ada ke kategori/dompet
  const txs = await prisma.transaction.findMany({
    where: { userId: demoUser.id },
  });

  for (const tx of txs) {
    if (tx.description?.includes("kos")) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { categoryId: tagihanId, walletId: bcaId },
      });
    } else if (tx.description?.includes("Belanja")) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { categoryId: belanjaId, walletId: gopayId },
      });
    } else if (tx.description?.includes("Pulsa")) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { categoryId: tagihanId, walletId: gopayId },
      });
    } else if (tx.description?.includes("Makan")) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { categoryId: makananId, walletId: cashId },
      });
    } else if (!tx.description && tx.type === "EXPENSE") {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { categoryId: transportId, walletId: cashId },
      });
    }
  }

  // 4. Seed Budgets untuk demo bulan 2026-09
  // Skenario:
  // a) Tagihan & Utilitas: limit 2.000.000, spent 1.620.000 (81% -> warning)
  // b) Makanan & Minuman: limit 50.000, spent 85.000 (170% -> exceeded)
  // c) Belanja: limit 500.000, spent 250.000 (50% -> safe)
  // d) Dompet Tunai: limit 500.000, spent 130.000 (26% -> safe)

  const month = "2026-09";

  const budgetSeeds = [
    {
      month,
      limitAmount: 2000000,
      categoryId: tagihanId,
      walletId: null,
    },
    {
      month,
      limitAmount: 50000,
      categoryId: makananId,
      walletId: null,
    },
    {
      month,
      limitAmount: 500000,
      categoryId: belanjaId,
      walletId: null,
    },
    {
      month,
      limitAmount: 500000,
      categoryId: null,
      walletId: cashId,
    },
    {
      month,
      limitAmount: 100000,
      categoryId: transportId,
      walletId: cashId,
    },
  ];

  for (const b of budgetSeeds) {
    const existing = await prisma.budget.findFirst({
      where: {
        userId: demoUser.id,
        month: b.month,
        categoryId: b.categoryId,
        walletId: b.walletId,
      },
    });

    if (existing) {
      await prisma.budget.update({
        where: { id: existing.id },
        data: { limitAmount: b.limitAmount },
      });
    } else {
      await prisma.budget.create({
        data: {
          userId: demoUser.id,
          month: b.month,
          limitAmount: b.limitAmount,
          categoryId: b.categoryId,
          walletId: b.walletId,
        },
      });
    }
  }

  console.log("Seed budget selesai: Kategori default, dompet default, dan contoh anggaran 2026-09 telah dibuat.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

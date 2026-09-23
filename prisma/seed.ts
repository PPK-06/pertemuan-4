// Jalankan: npm run seed  (atau npx prisma db seed)
// Dijalankan langsung oleh Node (type stripping), jadi import wajib relatif + berekstensi .ts.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import { hashPassword } from "../lib/password.ts";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Row = { type: "INCOME" | "EXPENSE"; amount: number; date: string; description: string | null };

const users: { email: string; transactions: Row[] }[] = [
  {
    email: "demo@example.com",
    transactions: [
      { type: "INCOME", amount: 5000000, date: "2026-09-01", description: "Gaji September" },
      { type: "EXPENSE", amount: 1500000, date: "2026-09-02", description: "Bayar kos" },
      { type: "EXPENSE", amount: 250000, date: "2026-09-05", description: "Belanja bulanan" },
      { type: "INCOME", amount: 750000, date: "2026-09-10", description: "Proyek freelance" },
      { type: "EXPENSE", amount: 45000, date: "2026-09-12", description: null },
      { type: "EXPENSE", amount: 120000, date: "2026-09-15", description: "Pulsa dan internet" },
      { type: "INCOME", amount: 200000, date: "2026-09-18", description: "Uang saku" },
      { type: "EXPENSE", amount: 85000, date: "2026-09-20", description: "Makan di luar" },
    ],
  },
  {
    // Saldo negatif: untuk demo tampilan saldo minus.
    email: "budi@example.com",
    transactions: [
      { type: "INCOME", amount: 3000000, date: "2026-09-03", description: "Gaji" },
      { type: "EXPENSE", amount: 3500000, date: "2026-09-08", description: "Servis motor" },
      { type: "EXPENSE", amount: 60000, date: "2026-09-14", description: "Bensin" },
    ],
  },
  // Tanpa transaksi: untuk demo tampilan kosong.
  { email: "sari@example.com", transactions: [] },
];

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.catatan.deleteMany();

  for (const u of users) {
    await prisma.user.create({
      data: {
        email: u.email,
        password: hashPassword("password123"),
        transactions: {
          create: u.transactions.map((t) => ({ ...t, date: new Date(t.date) })),
        },
      },
    });
  }

  await prisma.catatan.createMany({
    data: [{ judul: "Contoh catatan pertama" }, { judul: "Contoh catatan kedua" }],
  });

  console.log("Seed selesai: 3 user, 11 transaksi, 2 catatan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

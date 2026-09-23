# 00 — Panduan Global (Expense Tracker)

## 1. Keputusan Teknis
- Stack: Next.js 16 App Router + TypeScript + Prisma 7 (PostgreSQL) + Tailwind 4. DILARANG menambah dependency apa pun.
- Halaman = Server Component. Pakai `"use client"` hanya untuk file yang butuh `useActionState`.
- Mutasi = Server Action (`"use server"`) dipanggil lewat `<form action>`. DILARANG membuat Route Handler (`app/api/`).
- Baca data = fungsi async di `lib/queries/*.ts` yang memanggil `prisma` langsung, dipanggil dari page.
- Validasi = cek manual di awal Server Action; kembalikan pesan error pertama saja.
- UI = elemen HTML + class Tailwind langsung di file. Tanpa design system.
- Params dinamis: `export default async function Page(props: PageProps<"/transactions/[id]/edit">)` lalu `const { id } = await props.params`.
- Tidak memakai `proxy.ts`/middleware. Proteksi dilakukan di tiap page (lihat bagian 7).
- Password: hash dengan `hashPassword()` / cek dengan `verifyPassword()` dari `lib/password.ts` (node:crypto `scryptSync`, format simpan `"<saltHex>:<hashHex>"`).
- **Session cookie:**
  - Nama: `session`.
  - Isi: `"<userId>.<expiresAt>.<signature>"`; `expiresAt` = epoch ms; `signature` = HMAC-SHA256 hex dari `"<userId>.<expiresAt>"` dengan kunci `process.env.SESSION_SECRET` (node:crypto `createHmac`).
  - Verifikasi: hitung ulang signature, bandingkan dengan `timingSafeEqual`, tolak jika beda atau `Date.now() > expiresAt`, lalu ambil user dari DB berdasarkan `userId`.
  - Masa berlaku: 7 hari (`maxAge: 604800`).
  - Flag: `httpOnly: true`, `sameSite: "lax"`, `secure: process.env.NODE_ENV === "production"`, `path: "/"`.
  - Stateless: tidak ada tabel session di DB. Logout = hapus cookie `session`.
  - `SESSION_SECRET` wajib ada di `.env` tiap orang (string acak ≥ 32 karakter).
- **Cookie filter (FR-06):** nama `transaction_filter`, nilai `ALL` | `INCOME` | `EXPENSE`, default `ALL`, `maxAge: 31536000`, `httpOnly: true`, `sameSite: "lax"`, `path: "/"`. Di-set oleh Server Action `setTransactionFilter`, dibaca oleh query dashboard. Nilai tak dikenal → `ALL`.

## 2. Skema Data
```prisma
enum TransactionType {
  INCOME
  EXPENSE
}

model User {
  id           Int           @id @default(autoincrement())
  email        String        @unique
  password     String
  createdAt    DateTime      @default(now())
  transactions Transaction[]
}

model Transaction {
  id          Int             @id @default(autoincrement())
  userId      Int
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        TransactionType
  amount      Int
  date        DateTime        @db.Date
  description String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([userId])
}
```
- Client Prisma di-generate ke `generated/prisma`. Import type & enum dari `@/generated/prisma/client` (server) atau `@/generated/prisma/browser` (file `"use client"`). Import instance dari `@/lib/prisma` (`import { prisma } from "@/lib/prisma"`).
- DILARANG mendeklarasikan ulang `User`, `Transaction`, `TransactionType` sebagai interface/type manual.
- `password` berisi hash, bukan plaintext. Jangan pernah kirim `password` ke Client Component.

## 3. Enum & Konstanta
- `TransactionType`: `INCOME` (label "Pemasukan"), `EXPENSE` (label "Pengeluaran").
- `amount`: integer Rupiah > 0, tanpa desimal.
- `date` disimpan: `new Date("YYYY-MM-DD")` dari `<input type="date">`. Ditampilkan: `DD/MM/YYYY` via `formatDate()`. Nilai default input edit via `toDateInputValue()`.
- Uang ditampilkan via `formatRupiah()` → `Rp 1.500.000`.
- Ketiga helper format ada di `lib/format.ts` (milik PM). DILARANG memformat tanggal/uang dengan cara lain.
- Saldo = total `INCOME` − total `EXPENSE` milik user login. Saldo & dua total dihitung dari SEMUA transaksi user, tidak terpengaruh filter. Filter hanya memengaruhi daftar riwayat.
- Urutan riwayat: `orderBy: [{ date: "desc" }, { id: "desc" }]`. Tanpa pagination.
- User seed (dibuat PM): email `demo@example.com`, password `password123`.

## 4. Struktur Folder & Konvensi Penamaan
- Halaman: `app/<segment>/page.tsx`
- Query: `lib/queries/<domain>.ts`
- Mutasi (Server Action): `lib/actions/<domain>.ts`, baris pertama `"use server"`
- Komponen domain: `components/<domain>/<nama-komponen>.tsx`
- Komponen bersama: `components/ui/` (milik PM)
- Helper: `lib/<nama>.ts`
- Model PascalCase singular, field camelCase, komponen PascalCase, nama file kebab-case.
- Semua identifier kode dalam Bahasa Inggris. Semua teks di layar (label, tombol, pesan error, judul, placeholder) dalam Bahasa Indonesia.

## 5. Daftar Route
| Path | File | Proteksi | Pemilik |
|---|---|---|---|
| `/` (Dashboard) | `app/page.tsx` | auth | Orang 3 |
| `/login` | `app/login/page.tsx` | public | Orang 1 |
| `/register` | `app/register/page.tsx` | public | Orang 1 |
| `/transactions/new` | `app/transactions/new/page.tsx` | auth | Orang 2 |
| `/transactions/[id]/edit` | `app/transactions/[id]/edit/page.tsx` | auth | Orang 2 |
- Logout dan hapus transaksi tidak punya route; keduanya Server Action.
- Halaman public: jika `await getCurrentUser()` tidak null → `redirect("/")`.

## 6. Kontrak Form & Mutasi Data
Atribut `name` pada input form HARUS sama persis dengan nama field di schema.prisma.

| Form | Field `name` | Aturan cek manual |
|---|---|---|
| login, register | `email` | wajib, mengandung `@`, di-`trim().toLowerCase()`; register: belum terdaftar |
| login, register | `password` | wajib; register: minimal 8 karakter |
| transaksi | `type` | wajib, `INCOME` atau `EXPENSE` |
| transaksi | `amount` | wajib, `Number.isInteger(n) && n > 0` |
| transaksi | `date` | wajib, cocok `/^\d{4}-\d{2}-\d{2}$/` |
| transaksi | `description` | opsional, `trim()`, maks 255; kosong → `null` |
| transaksi (edit/hapus) | `id` | hidden input, `Number(id)` |
| filter | `type` | `ALL` / `INCOME` / `EXPENSE` |

Pola SERAGAM untuk semua Server Action:
```ts
import type { ActionState } from "@/lib/action-state"; // { error: string | null }

export async function createTransaction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const amount = Number(formData.get("amount"));
  if (!Number.isInteger(amount) || amount <= 0) return { error: "Jumlah harus bilangan bulat lebih dari 0." };
  // ...cek field lain
  await prisma.transaction.create({ data: { userId: user.id, type, amount, date: new Date(date), description } });
  revalidatePath("/");
  redirect("/");
}
```
- Client memakai `const [state, formAction, pending] = useActionState(createTransaction, initialState)`; tampilkan `state.error` di atas tombol submit.
- Update/hapus WAJIB membatasi pemilik: `prisma.transaction.updateMany({ where: { id, userId: user.id }, data })` / `deleteMany(...)`; jika `count === 0` → `{ error: "Transaksi tidak ditemukan." }`.
- Query milik user WAJIB memakai `where: { userId: user.id }`. Halaman edit: `findFirst({ where: { id, userId: user.id } })`, jika null → `notFound()`.
- Nama action: `login`, `register`, `logout` (Orang 1); `createTransaction`, `updateTransaction`, `deleteTransaction` (Orang 2); `setTransactionFilter` (Orang 3).

## 7. Kontrak Session
File: `lib/session.ts`. Signature FINAL:
```ts
export async function getCurrentUser(): Promise<User | null>; // null jika tidak login / cookie invalid
export async function requireUser(): Promise<User>;           // redirect("/login") jika tidak login
export async function createSession(userId: number): Promise<void>; // hanya dipakai lib/actions/auth.ts
export async function deleteSession(): Promise<void>;               // hanya dipakai lib/actions/auth.ts
```
- Setiap page auth dan setiap Server Action mutasi WAJIB memanggil `const user = await requireUser()` di baris pertama.
- SEMUA orang WAJIB memakai helper ini. DILARANG membaca/menulis cookie `session` secara langsung di luar `lib/session.ts`.
- Isi awal = stub PM: `getCurrentUser()` mengembalikan `prisma.user.findUnique({ where: { email: "demo@example.com" } })`; `createSession`/`deleteSession` kosong. Orang 1 mengganti isinya sesuai bagian 1 tanpa mengubah signature.

## 8. Ownership Map
| Orang | FR | Boleh buat/ubah | Branch |
|---|---|---|---|
| Orang 1 | FR-01, FR-02 | `app/login/`, `app/register/`, `components/auth/`, `lib/actions/auth.ts`, `lib/session.ts` (isi saja) | `feature/fr-01-auth` |
| Orang 2 | FR-03, FR-04 | `app/transactions/`, `components/transactions/`, `lib/actions/transaction.ts`, `lib/queries/transaction.ts` | `feature/fr-03-transaction-crud` |
| Orang 3 | FR-05, FR-06 | `app/page.tsx`, `components/dashboard/`, `lib/actions/dashboard.ts`, `lib/queries/dashboard.ts` | `feature/fr-05-dashboard` |

Titik temu (stub dibuat PM, isi diganti pemilik, props TIDAK boleh diubah):
- `components/auth/logout-button.tsx` → `export default function LogoutButton()`; milik Orang 1, dirender Orang 3 di header dashboard.
- `components/transactions/delete-transaction-button.tsx` → `export default function DeleteTransactionButton({ id }: { id: number })`; milik Orang 2, dirender Orang 3 di tiap baris riwayat. Wajib `confirm("Hapus transaksi ini?")` sebelum submit.
- Tautan: Orang 3 memakai `<Link href="/transactions/new">` dan `<Link href={`/transactions/${t.id}/edit`}>`.

File milik PM — DILARANG disentuh siapa pun:
- `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, `prisma7.config.ts`
- `lib/prisma.ts`, `lib/password.ts`, `lib/format.ts`, `lib/action-state.ts`
- `app/layout.tsx`, `app/globals.css`, `components/ui/`
- `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `docs/`

Pengecualian: `lib/session.ts` milik Orang 1 — hanya Orang 1 yang boleh mengubah isinya, signature tetap. Perubahan pada file milik PM harus diminta ke PM, jangan diubah sendiri.

## 9. Sudah Tersedia di Main — Jangan Dibuat Ulang
- Prisma Client: `lib/prisma.ts` (singleton). Import: `import { prisma } from "@/lib/prisma"`. Type/enum: `import type { User, Transaction } from "@/generated/prisma/client"`. Generator memakai `importFileExtension = "ts"`; `tsconfig.json` sudah `allowImportingTsExtensions`.
- Model `User`, `Transaction`, enum `TransactionType` sudah dimigrasi (`prisma/migrations/*_add_user_transaction`). JANGAN buat migrasi sendiri.
- Session: `lib/session.ts` — MASIH STUB, selalu mengembalikan `demo@example.com`. WAJIB dipakai semua orang (`requireUser()` / `getCurrentUser()`), walau masih stub. Hanya Orang 1 yang mengganti isinya.
- Reference implementation (WAJIB ditiru polanya, jangan diubah): `app/notes/page.tsx`, `lib/queries/note.ts`, `lib/actions/note.ts`, `components/notes/note-form.tsx`, `components/notes/delete-note-button.tsx`. Buka `/notes` untuk melihatnya jalan.
- Seed (`npm run seed`, menghapus & mengisi ulang semua data). Password semua user: `password123`.
  - `demo@example.com` — 8 transaksi (3 `INCOME`, 5 `EXPENSE`, 1 tanpa `description`), saldo positif.
  - `budi@example.com` — 3 transaksi, saldo negatif.
  - `sari@example.com` — 0 transaksi (demo tampilan kosong).
  - 2 baris `Catatan`.
- Sudah ada, JANGAN dibuat ulang: `lib/password.ts` (`hashPassword`, `verifyPassword`), `lib/format.ts` (`formatDate`, `formatRupiah`, `toDateInputValue`), `lib/action-state.ts` (`ActionState`, `initialState`), `app/layout.tsx` (header + navigasi + email user + `LogoutButton`), stub `components/auth/logout-button.tsx`, stub `components/transactions/delete-transaction-button.tsx`, `.env.example`.
- Header navigasi sudah ada di layout. JANGAN membuat header/nav lagi di halaman.
- Folder kosong (`.gitkeep`) sudah dibuat untuk semua path di bagian 5 dan 8.

## 10. Konvensi Git
- Branch: `feature/fr-XX-nama-singkat`.
- Commit: baris head singkat, baris kosong, lalu body. Tanpa co-author.
- Sebelum PR: `git pull --rebase origin main`. Conflict diselesaikan di branch sendiri, bukan oleh PM.
- JANGAN commit `.env`, `.next/`, `node_modules/`, `generated/`.
- Setelah pull yang membawa perubahan schema dari PM: `npx prisma migrate dev` lalu `npx prisma generate`.

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/session";
import LogoutButton from "@/components/auth/logout-button";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Pencatatan pemasukan dan pengeluaran pribadi",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <header className="flex flex-wrap items-center gap-4 border-b px-6 py-3">
          <span className="font-semibold">Expense Tracker</span>
          <nav className="flex flex-wrap gap-4 text-sm">
            <Link href="/">Dashboard</Link>
            <Link href="/transactions/new">Tambah Transaksi</Link>
            <Link href="/login">Masuk</Link>
            <Link href="/register">Daftar</Link>
            <Link href="/notes">Catatan (contoh)</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span>{user.email}</span>
                <LogoutButton />
              </>
            ) : (
              <span>Belum masuk</span>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}

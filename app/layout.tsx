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
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--bg-app)" }}>

        {/* ── Top Navbar ── */}
        <header
          className="sticky top-0 z-50 border-b"
          style={{
            backgroundColor: "var(--bg-nav)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-6">

            {/* Logo / Brand */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
                style={{ backgroundColor: "var(--accent)" }}
              >
                ET
              </div>
              <span className="font-semibold text-sm hidden sm:block" style={{ color: "var(--text-primary)" }}>
                Expense Tracker
              </span>
            </Link>

            {/* Main Nav Links */}
            {user && (
              <nav className="flex items-center gap-1 flex-1">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-blue-50"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/budget"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-blue-50"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Budget
                </Link>
                <Link
                  href="/transactions/new"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors text-white"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah
                </Link>
              </nav>
            )}

            {/* Right: Auth area */}
            <div className="ml-auto flex items-center gap-3">
              {user ? (
                <>
                  {/* Avatar chip */}
                  <div className="flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: "var(--border)", backgroundColor: "var(--accent-light)" }}>
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-semibold"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium hidden md:block" style={{ color: "var(--accent)" }}>
                      {user.email.split("@")[0]}
                    </span>
                  </div>
                  <LogoutButton />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-lg px-4 py-1.5 text-sm font-medium border transition-colors hover:bg-gray-50"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="border-t py-4 text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-nav)" }}>
          © 2026 Expense Tracker
        </footer>

      </body>
    </html>
  );
}

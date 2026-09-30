import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/session";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-sm py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white text-xl font-bold"
          style={{ backgroundColor: "var(--accent)" }}
        >
          ET
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Selamat datang kembali
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Masuk untuk melanjutkan ke akun Anda
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <LoginForm />
      </div>

      <p className="mt-5 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium"
          style={{ color: "var(--accent)" }}
        >
          Daftar sekarang
        </Link>
      </p>

      {/* Demo hint */}
      <div
        className="mt-4 rounded-xl border px-4 py-3 text-xs text-center"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--accent-light)",
          color: "var(--accent)",
        }}
      >
        Demo: <strong>demo@example.com</strong> / <strong>password123</strong>
      </div>
    </div>
  );
}
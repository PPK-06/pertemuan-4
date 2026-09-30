import Link from "next/link";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/session";

export default async function RegisterPage() {
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
          Buat akun baru
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Mulai catat keuangan Anda hari ini
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
        <RegisterForm />
      </div>

      <p className="mt-5 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium"
          style={{ color: "var(--accent)" }}
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}

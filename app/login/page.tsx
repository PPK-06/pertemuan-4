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
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Masuk
      </h1>

      <LoginForm />

      <p className="mt-4 text-sm">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="underline"
        >
          Daftar
        </Link>
      </p>
    </main>
  );
}
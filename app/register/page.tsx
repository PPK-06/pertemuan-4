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
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Daftar
      </h1>

      <RegisterForm />

      <p className="mt-4 text-sm">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="underline"
        >
          Masuk
        </Link>
      </p>
    </main>
  );
}

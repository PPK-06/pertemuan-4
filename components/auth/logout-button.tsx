import { logout } from "@/lib/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors hover:bg-gray-50"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        Keluar
      </button>
    </form>
  );
}
import { logout } from "@/lib/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded border px-3 py-1"
      >
        Keluar
      </button>
    </form>
  );
}
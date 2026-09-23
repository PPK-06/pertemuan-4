// STUB SEMENTARA buatan PM.
// Isi file ini akan diganti oleh pemilik FR autentikasi (Orang 1) sesuai
// bagian 1 & 7 di docs/00-panduan-global.md.
// SIGNATURE DAN RETURN TYPE TIDAK BOLEH DIUBAH.
// Selain Orang 1, DILARANG mengubah file ini atau membaca cookie "session" langsung.
import { redirect } from "next/navigation";
import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// STUB: selalu mengembalikan user seed pertama (demo@example.com).
export async function getCurrentUser(): Promise<User | null> {
  return prisma.user.findUnique({ where: { email: "demo@example.com" } });
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// STUB: belum membuat cookie. Hanya dipakai lib/actions/auth.ts.
export async function createSession(userId: number): Promise<void> {
  void userId;
}

// STUB: belum menghapus cookie. Hanya dipakai lib/actions/auth.ts.
export async function deleteSession(): Promise<void> {}

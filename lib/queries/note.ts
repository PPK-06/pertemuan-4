// REFERENCE IMPLEMENTATION (bukan fitur SRS). WAJIB ditiru polanya:
// fungsi async, panggil prisma langsung, tanpa repository/service layer.
// Untuk data milik user, tambahkan where: { userId: user.id }.
import { prisma } from "@/lib/prisma";

export async function getNotes() {
  return prisma.catatan.findMany({ orderBy: { id: "desc" } });
}

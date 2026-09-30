import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function getCategories() {
  const user = await requireUser();
  return prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: string) {
  const user = await requireUser();
  return prisma.category.findFirst({
    where: { id, userId: user.id },
  });
}

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function getWallets() {
  const user = await requireUser();
  return prisma.wallet.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
}

export async function getWalletById(id: string) {
  const user = await requireUser();
  return prisma.wallet.findFirst({
    where: { id, userId: user.id },
  });
}

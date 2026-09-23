import { prisma } from "@/lib/prisma";

export async function getTransaction(id: number, userId: number) {
  return prisma.transaction.findFirst({
    where: { id, userId },
  });
}

export const getTransactionById = getTransaction;

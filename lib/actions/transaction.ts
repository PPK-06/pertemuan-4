"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { TransactionType } from "@/generated/prisma/client";

export async function createTransaction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const type = formData.get("type");
  if (type !== "INCOME" && type !== "EXPENSE") {
    return { error: "Jenis transaksi wajib dipilih." };
  }

  const amount = Number(formData.get("amount"));
  if (!Number.isInteger(amount) || amount <= 0) {
    return { error: "Jumlah harus bilangan bulat lebih dari 0." };
  }

  const dateRaw = String(formData.get("date") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRaw) || isNaN(new Date(dateRaw).getTime())) {
    return { error: "Tanggal tidak valid." };
  }

  const descriptionRaw = String(formData.get("description") ?? "").trim();
  if (descriptionRaw.length > 255) {
    return { error: "Deskripsi maksimal 255 karakter." };
  }
  const description = descriptionRaw.length > 0 ? descriptionRaw : null;

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: type as TransactionType,
      amount,
      date: new Date(dateRaw),
      description,
    },
  });

  revalidatePath("/");
  redirect("/");
}

export async function updateTransaction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { error: "ID transaksi tidak valid." };
  }

  const type = formData.get("type");
  if (type !== "INCOME" && type !== "EXPENSE") {
    return { error: "Jenis transaksi wajib dipilih." };
  }

  const amount = Number(formData.get("amount"));
  if (!Number.isInteger(amount) || amount <= 0) {
    return { error: "Jumlah harus bilangan bulat lebih dari 0." };
  }

  const dateRaw = String(formData.get("date") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRaw) || isNaN(new Date(dateRaw).getTime())) {
    return { error: "Tanggal tidak valid." };
  }

  const descriptionRaw = String(formData.get("description") ?? "").trim();
  if (descriptionRaw.length > 255) {
    return { error: "Deskripsi maksimal 255 karakter." };
  }
  const description = descriptionRaw.length > 0 ? descriptionRaw : null;

  const result = await prisma.transaction.updateMany({
    where: { id, userId: user.id },
    data: {
      type: type as TransactionType,
      amount,
      date: new Date(dateRaw),
      description,
    },
  });

  if (result.count === 0) {
    return { error: "Transaksi tidak ditemukan." };
  }

  revalidatePath("/");
  redirect("/");
}

export async function deleteTransaction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { error: "ID transaksi tidak valid." };
  }

  const result = await prisma.transaction.deleteMany({
    where: { id, userId: user.id },
  });

  if (result.count === 0) {
    return { error: "Transaksi tidak ditemukan." };
  }

  revalidatePath("/");
  redirect("/");
}

"use server";
// REFERENCE IMPLEMENTATION (bukan fitur SRS). WAJIB ditiru polanya:
// signature (prevState, formData) => Promise<ActionState>, requireUser() di
// baris pertama, cek manual, return pesan error pertama, lalu revalidatePath + redirect.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function createNote(prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const judul = String(formData.get("judul") ?? "").trim();
  if (!judul) return { error: "Judul wajib diisi." };
  if (judul.length > 100) return { error: "Judul maksimal 100 karakter." };

  await prisma.catatan.create({ data: { judul } });
  revalidatePath("/notes");
  redirect("/notes");
}

export async function deleteNote(prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const id = Number(formData.get("id"));
  // Untuk data milik user: deleteMany({ where: { id, userId: user.id } }).
  const result = await prisma.catatan.deleteMany({ where: { id } });
  if (result.count === 0) return { error: "Catatan tidak ditemukan." };

  revalidatePath("/notes");
  redirect("/notes");
}

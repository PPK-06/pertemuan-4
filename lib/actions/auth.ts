"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  createSession,
  deleteSession,
  requireUser,
} from "@/lib/session";

export async function register(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!email) {
    return { error: "Email wajib diisi." };
  }

  if (!email.includes("@")) {
    return { error: "Email tidak valid." };
  }

  if (!password) {
    return { error: "Password wajib diisi." };
  }

  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email sudah terdaftar." };
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashPassword(password),
    },
  });

  await createSession(user.id);

  redirect("/");
}

export async function login(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!email) {
    return { error: "Email wajib diisi." };
  }

  if (!email.includes("@")) {
    return { error: "Email tidak valid." };
  }

  if (!password) {
    return { error: "Password wajib diisi." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !verifyPassword(password, user.password)) {
    return { error: "Email atau password salah." };
  }

  await createSession(user.id);

  redirect("/");
}

export async function logout(): Promise<void> {
  await requireUser();
  await deleteSession();

  redirect("/login");
}
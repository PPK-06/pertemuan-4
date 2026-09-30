"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { categorySchema } from "@/lib/validations/category";
import type { ActionResult } from "@/lib/types/budget";

function handleNextRedirect(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Abaikan jika dipanggil di luar konteks request Next.js (misal di test runner)
  }
}

function parseRawInput(input: unknown): unknown {
  if (typeof FormData !== "undefined" && input instanceof FormData) {
    return {
      name: input.get("name"),
    };
  }
  return input;
}

export async function createCategoryAction(
  input: unknown
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const user = await requireUser();
    const raw = parseRawInput(input);
    const parsed = categorySchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] ?? "Input tidak valid.";
      return { success: false, error: firstError, fieldErrors };
    }

    const { name } = parsed.data;

    const existing = await prisma.category.findUnique({
      where: {
        userId_name: {
          userId: user.id,
          name,
        },
      },
    });

    if (existing) {
      return { success: false, error: "Kategori dengan nama tersebut sudah ada." };
    }

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    safeRevalidatePath("/budget");
    return { success: true, data: category };
  } catch (error) {
    handleNextRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan kategori.",
    };
  }
}

export async function updateCategoryAction(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const user = await requireUser();

    if (!id || typeof id !== "string") {
      return { success: false, error: "ID kategori tidak valid." };
    }

    const existing = await prisma.category.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return { success: false, error: "Kategori tidak ditemukan atau bukan milik Anda." };
    }

    const raw = parseRawInput(input);
    const parsed = categorySchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] ?? "Input tidak valid.";
      return { success: false, error: firstError, fieldErrors };
    }

    const { name } = parsed.data;

    const duplicate = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name,
        NOT: { id },
      },
    });

    if (duplicate) {
      return { success: false, error: "Kategori dengan nama tersebut sudah ada." };
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name },
      select: { id: true, name: true },
    });

    safeRevalidatePath("/budget");
    return { success: true, data: updated };
  } catch (error) {
    handleNextRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui kategori.",
    };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();

    if (!id || typeof id !== "string") {
      return { success: false, error: "ID kategori tidak valid." };
    }

    const existing = await prisma.category.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return { success: false, error: "Kategori tidak ditemukan atau bukan milik Anda." };
    }

    await prisma.category.delete({
      where: { id },
    });

    safeRevalidatePath("/budget");
    return { success: true, data: { id } };
  } catch (error) {
    handleNextRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus kategori.",
    };
  }
}

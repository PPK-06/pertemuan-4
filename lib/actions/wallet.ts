"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { walletSchema } from "@/lib/validations/wallet";
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
      type: input.get("type"),
    };
  }
  return input;
}

export async function createWalletAction(
  input: unknown
): Promise<ActionResult<{ id: string; name: string; type: string | null }>> {
  try {
    const user = await requireUser();
    const raw = parseRawInput(input);
    const parsed = walletSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] ?? "Input tidak valid.";
      return { success: false, error: firstError, fieldErrors };
    }

    const { name, type } = parsed.data;

    const existing = await prisma.wallet.findUnique({
      where: {
        userId_name: {
          userId: user.id,
          name,
        },
      },
    });

    if (existing) {
      return { success: false, error: "Dompet dengan nama tersebut sudah ada." };
    }

    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        name,
        type: type ?? null,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    safeRevalidatePath("/budget");
    return { success: true, data: wallet };
  } catch (error) {
    handleNextRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan dompet.",
    };
  }
}

export async function updateWalletAction(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string; name: string; type: string | null }>> {
  try {
    const user = await requireUser();

    if (!id || typeof id !== "string") {
      return { success: false, error: "ID dompet tidak valid." };
    }

    const existing = await prisma.wallet.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return { success: false, error: "Dompet tidak ditemukan atau bukan milik Anda." };
    }

    const raw = parseRawInput(input);
    const parsed = walletSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] ?? "Input tidak valid.";
      return { success: false, error: firstError, fieldErrors };
    }

    const { name, type } = parsed.data;

    const duplicate = await prisma.wallet.findFirst({
      where: {
        userId: user.id,
        name,
        NOT: { id },
      },
    });

    if (duplicate) {
      return { success: false, error: "Dompet dengan nama tersebut sudah ada." };
    }

    const updated = await prisma.wallet.update({
      where: { id },
      data: {
        name,
        type: type ?? null,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    safeRevalidatePath("/budget");
    return { success: true, data: updated };
  } catch (error) {
    handleNextRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui dompet.",
    };
  }
}

export async function deleteWalletAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();

    if (!id || typeof id !== "string") {
      return { success: false, error: "ID dompet tidak valid." };
    }

    const existing = await prisma.wallet.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return { success: false, error: "Dompet tidak ditemukan atau bukan milik Anda." };
    }

    await prisma.wallet.delete({
      where: { id },
    });

    safeRevalidatePath("/budget");
    return { success: true, data: { id } };
  } catch (error) {
    handleNextRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus dompet.",
    };
  }
}

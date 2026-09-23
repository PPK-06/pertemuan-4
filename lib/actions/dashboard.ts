"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/session";

export async function setTransactionFilter(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const type = String(formData.get("type") ?? "").trim();
  if (type !== "ALL" && type !== "INCOME" && type !== "EXPENSE") {
    return { error: "Jenis filter tidak valid." };
  }

  const cookieStore = await cookies();
  cookieStore.set("transaction_filter", type, {
    maxAge: 31536000,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/");
  redirect("/");
}

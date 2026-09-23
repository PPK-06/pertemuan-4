import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 604800;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET belum diatur.");
  }

  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (!session) {
    return null;
  }

  const parts = session.value.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [userIdText, expiresAtText, signature] = parts;

  const userId = Number(userIdText);
  const expiresAt = Number(expiresAtText);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return null;
  }

  const payload = `${userId}.${expiresAt}`;
  const expectedSignature = sign(payload);

  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (actualBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function createSession(userId: number): Promise<void> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;

  const payload = `${userId}.${expiresAt}`;
  const signature = sign(payload);

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    `${payload}.${signature}`,
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    },
  );
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
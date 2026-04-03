import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { logEvent } from "@/lib/services/auditLog";

export const BCRYPT_COST = 12;
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isAccountLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false;
  return lockedUntil > new Date();
}

export async function recordFailedAttempt(userId: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  const newAttempts = user.failedAttempts + 1;
  const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;
  const lockedUntil = shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null;

  await db.update(users)
    .set({
      failedAttempts: newAttempts,
      ...(shouldLock && { lockedUntil }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  if (shouldLock) {
    logger.warn({ userId, event: "account_locked" }, "Account locked after max failed attempts");
    await logEvent({
      nivel: "warn",
      evento: "auth.account_locked",
      userId,
      entidad: "users",
      entidadId: userId,
      payload: { failedAttempts: newAttempts },
    });
  }
}

export async function resetFailedAttempts(userId: string): Promise<void> {
  await db.update(users)
    .set({ failedAttempts: 0, lockedUntil: null, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { systemConfig } from "@/lib/db/schema";

export async function getConfigValue(key: string): Promise<string | null> {
  const [row] = await db
    .select({ value: systemConfig.value })
    .from(systemConfig)
    .where(eq(systemConfig.key, key))
    .limit(1);
  return row?.value ?? null;
}

export async function setConfigValue(key: string, value: string): Promise<void> {
  await db
    .update(systemConfig)
    .set({ value, updatedAt: new Date() })
    .where(eq(systemConfig.key, key));
}

export async function incrementAndGetCounter(key: string): Promise<number> {
  const [result] = await db
    .update(systemConfig)
    .set({
      value: sql`(${systemConfig.value}::int + 1)::text`,
      updatedAt: new Date(),
    })
    .where(eq(systemConfig.key, key))
    .returning({ value: systemConfig.value });
  return parseInt(result.value, 10);
}

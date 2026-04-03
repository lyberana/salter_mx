import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { idempotencyKeys } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

type Handler = (req: NextRequest) => Promise<NextResponse>;

export async function withIdempotency(req: NextRequest, handler: Handler): Promise<NextResponse> {
  const key = req.headers.get("x-idempotency-key");

  // No key provided — just run the handler normally
  if (!key) return handler(req);

  // Check if we already processed this key (within 24 hours)
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [existing] = await db
    .select()
    .from(idempotencyKeys)
    .where(and(eq(idempotencyKeys.key, key), gt(idempotencyKeys.createdAt, cutoff)))
    .limit(1);

  if (existing) {
    // Return the cached response
    return NextResponse.json(existing.responseBody, { status: existing.responseStatus });
  }

  // Execute the handler
  const response = await handler(req);

  // Store the result (best effort — don't fail the request if storage fails)
  try {
    const body = await response.clone().json();
    await db.insert(idempotencyKeys).values({
      key,
      responseStatus: response.status,
      responseBody: body,
    }).onConflictDoNothing();
  } catch {
    // Ignore storage errors — idempotency is best-effort
  }

  return response;
}

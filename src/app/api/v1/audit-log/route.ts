import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { getRequestLogger } from "@/lib/context/request-context";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const log = getRequestLogger(req);
  const checkRole = requireRole(["administrador"]);
  const sessionOrError = await checkRole(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const { searchParams } = new URL(req.url);
  const nivel = searchParams.get("nivel");
  const evento = searchParams.get("evento");
  const userId = searchParams.get("userId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const offset = (page - 1) * limit;

  try {
    const conditions = [];
    if (nivel) conditions.push(eq(auditLog.nivel, nivel as any));
    if (evento) conditions.push(eq(auditLog.evento, evento));
    if (userId) conditions.push(eq(auditLog.userId, userId));
    if (from) conditions.push(gte(auditLog.createdAt, new Date(from)));
    if (to) conditions.push(lte(auditLog.createdAt, new Date(to)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      db.select().from(auditLog).where(where).orderBy(desc(auditLog.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(auditLog).where(where),
    ]);

    return NextResponse.json({
      data: rows,
      meta: { page, limit, total: countResult[0]?.count ?? 0 },
    });
  } catch (err) {
    log.error({ err }, "Error querying audit log");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

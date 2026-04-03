import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/middleware/auth";
import { db } from "@/lib/db";
import { importaciones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrError = await requireSession(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const { id } = await params;

  const [record] = await db
    .select()
    .from(importaciones)
    .where(eq(importaciones.id, id))
    .limit(1);

  if (!record) {
    return NextResponse.json(
      { data: null, errors: [{ code: "NOT_FOUND", message: "Importación no encontrada" }] },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: record });
}

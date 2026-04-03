import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/services/auth";
import { z } from "zod";

const schema = z.object({
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, errors: [{ code: "NO_AUTENTICADO", message: "Autenticación requerida" }] },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, errors: parsed.error.issues.map(e => ({ code: "VALIDATION_ERROR", message: e.message })) },
      { status: 422 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await db.update(users)
    .set({ passwordHash, mustChangePassword: false, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ data: { ok: true } });
}

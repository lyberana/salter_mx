import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { getRequestLogger } from "@/lib/context/request-context";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/services/auth";
import { z } from "zod";
import crypto from "crypto";

const updateUserSchema = z.object({
  nombre: z.string().min(1).optional(),
  rol: z.enum(["administrador", "coordinador", "operador", "cliente"]).optional(),
  activo: z.boolean().optional(),
});

function generateRandomPassword(): string {
  return crypto.randomBytes(6).toString("base64url").slice(0, 10);
}

// PATCH — edit user (nombre, rol, activo)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const log = getRequestLogger(req);
  const checkRole = requireRole(["administrador"]);
  const sessionOrError = await checkRole(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const { id } = await params;
  const adminId = (sessionOrError.user as any).id as string;

  try {
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, errors: parsed.error.issues.map(e => ({ code: "VALIDATION_ERROR", message: e.message })) },
        { status: 422 }
      );
    }

    const [updated] = await db.update(users)
      .set({ ...parsed.data, updatedBy: adminId, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id, email: users.email, nombre: users.nombre,
        rol: users.rol, activo: users.activo, updatedAt: users.updatedAt, updatedBy: users.updatedBy,
      });

    if (!updated) {
      return NextResponse.json({ data: null, errors: [{ code: "NOT_FOUND", message: "Usuario no encontrado" }] }, { status: 404 });
    }

    log.info({ event: "user.updated", id, by: adminId, changes: parsed.data });
    return NextResponse.json({ data: updated });
  } catch (err) {
    log.error({ err }, "Error updating user");
    return NextResponse.json({ data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] }, { status: 500 });
  }
}

// POST — reset password
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const log = getRequestLogger(req);
  const checkRole = requireRole(["administrador"]);
  const sessionOrError = await checkRole(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const { id } = await params;
  const adminId = (sessionOrError.user as any).id as string;

  try {
    const body = await req.json().catch(() => ({}));
    const action = (body as any).action;

    if (action !== "reset-password") {
      return NextResponse.json({ data: null, errors: [{ code: "INVALID_ACTION", message: "Acción no válida" }] }, { status: 422 });
    }

    const tempPassword = generateRandomPassword();
    const passwordHash = await hashPassword(tempPassword);

    const [updated] = await db.update(users)
      .set({ passwordHash, mustChangePassword: true, updatedBy: adminId, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({ id: users.id, email: users.email, nombre: users.nombre });

    if (!updated) {
      return NextResponse.json({ data: null, errors: [{ code: "NOT_FOUND", message: "Usuario no encontrado" }] }, { status: 404 });
    }

    log.info({ event: "user.password_reset", id, by: adminId });
    return NextResponse.json({ data: { ...updated, tempPassword } });
  } catch (err) {
    log.error({ err }, "Error resetting password");
    return NextResponse.json({ data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] }, { status: 500 });
  }
}

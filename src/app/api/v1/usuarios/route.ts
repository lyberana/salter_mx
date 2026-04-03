import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { getRequestLogger } from "@/lib/context/request-context";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { hashPassword } from "@/lib/services/auth";
import { z } from "zod";
import crypto from "crypto";

const createUserSchema = z.object({
  nickname: z.string().min(1).regex(/^[a-z0-9._-]+$/i, "Solo letras, números, puntos, guiones"),
  nombre: z.string().min(1),
  rol: z.enum(["administrador", "coordinador", "operador", "cliente"]),
});

function generateRandomPassword(): string {
  return crypto.randomBytes(6).toString("base64url").slice(0, 10);
}

export async function GET(req: NextRequest) {
  const log = getRequestLogger(req);
  const checkRole = requireRole(["administrador"]);
  const sessionOrError = await checkRole(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        nombre: users.nombre,
        rol: users.rol,
        activo: users.activo,
        updatedBy: users.updatedBy,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ data: rows, meta: { total: rows.length } });
  } catch (err) {
    log.error({ err }, "Error listing users");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const log = getRequestLogger(req);
  const checkRole = requireRole(["administrador"]);
  const sessionOrError = await checkRole(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, errors: parsed.error.issues.map((e) => ({ code: "VALIDATION_ERROR", message: e.message, field: e.path.join(".") })) },
        { status: 422 }
      );
    }

    const email = `${parsed.data.nickname.toLowerCase()}@gfsalter.com`;

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json(
        { data: null, errors: [{ code: "EMAIL_DUPLICADO", message: `El correo ${email} ya está registrado` }] },
        { status: 409 }
      );
    }

    const tempPassword = generateRandomPassword();
    const passwordHash = await hashPassword(tempPassword);

    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        nombre: parsed.data.nombre,
        rol: parsed.data.rol,
        mustChangePassword: true,
      })
      .returning({
        id: users.id, email: users.email, nombre: users.nombre,
        rol: users.rol, activo: users.activo, createdAt: users.createdAt,
      });

    log.info({ event: "user.created", id: created.id, rol: created.rol });
    return NextResponse.json({ data: { ...created, tempPassword } }, { status: 201 });
  } catch (err) {
    log.error({ err }, "Error creating user");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

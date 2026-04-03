import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export type UserRole = "administrador" | "coordinador" | "operador" | "cliente";

export async function requireSession(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { data: null, errors: [{ code: "NO_AUTENTICADO", message: "Autenticación requerida" }] },
      { status: 401 }
    );
  }
  return session;
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (req: NextRequest) => {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { data: null, errors: [{ code: "NO_AUTENTICADO", message: "Autenticación requerida" }] },
        { status: 401 }
      );
    }
    const userRole = (session.user as any).role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { data: null, errors: [{ code: "NO_AUTORIZADO", message: "No tienes permisos para esta operación" }] },
        { status: 403 }
      );
    }
    return session;
  };
}

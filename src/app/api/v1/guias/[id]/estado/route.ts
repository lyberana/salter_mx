import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { withIdempotency } from "@/lib/middleware/idempotency";
import { getRequestLogger } from "@/lib/context/request-context";
import { cambiarEstadoGuiaSchema } from "@/lib/schemas/guias";
import * as guiasService from "@/lib/services/guias";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withIdempotency(req, async (request) => {
    const log = getRequestLogger(request);
    const checkRole = requireRole(["coordinador", "administrador"]);
    const sessionOrError = await checkRole(request);
    if (sessionOrError instanceof NextResponse) return sessionOrError;

    const { id } = await params;

    try {
      const body = await request.json();
      const parsed = cambiarEstadoGuiaSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            data: null,
            errors: parsed.error.issues.map((e) => ({
              code: "VALIDATION_ERROR",
              message: e.message,
              field: e.path.join("."),
            })),
          },
          { status: 422 }
        );
      }

      const changedBy = (sessionOrError.user as { id?: string }).id!;
      const result = await guiasService.cambiarEstadoGuia(id, parsed.data.estado, changedBy);
      if (!result.ok) {
        const status = result.code === "GUIA_NO_ENCONTRADA" ? 404 : 422;
        return NextResponse.json(
          { data: null, errors: [{ code: result.code, message: result.message }] },
          { status }
        );
      }

      log.info({ event: "guia.estado.updated", id, estado: parsed.data.estado });
      return NextResponse.json({ data: result.data });
    } catch (err) {
      log.error({ err, id }, "Error updating guía estado");
      return NextResponse.json(
        { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
        { status: 500 }
      );
    }
  });
}

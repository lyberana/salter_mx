import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/middleware/auth";
import { withIdempotency } from "@/lib/middleware/idempotency";
import { getRequestLogger } from "@/lib/context/request-context";
import { cambiarEstadoOrdenSchema } from "@/lib/schemas/ordenes";
import * as service from "@/lib/services/ordenes";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withIdempotency(req, async (request) => {
    const log = getRequestLogger(request);
    const sessionOrError = await requireSession(request);
    if (sessionOrError instanceof NextResponse) return sessionOrError;

    const { id } = await params;

    try {
      const body = await request.json();
      const parsed = cambiarEstadoOrdenSchema.safeParse({
        ...body,
        changedBy: (sessionOrError.user as { id?: string }).id,
      });
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

      const result = await service.cambiarEstadoOrden(id, parsed.data.estado, parsed.data.changedBy);
      if (!result.ok) {
        const status = result.code === "ORDEN_NO_ENCONTRADA" ? 404 : 422;
        return NextResponse.json(
          { data: null, errors: [{ code: result.code, message: result.message }] },
          { status }
        );
      }

      log.info({ event: "orden.estado.updated", id, estado: parsed.data.estado });
      return NextResponse.json({ data: result.data });
    } catch (err) {
      log.error({ err, id }, "Error updating orden estado");
      return NextResponse.json(
        { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
        { status: 500 }
      );
    }
  });
}

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/middleware/auth";
import { withIdempotency } from "@/lib/middleware/idempotency";
import { getRequestLogger } from "@/lib/context/request-context";
import { createOrdenSchema } from "@/lib/schemas/ordenes";
import * as service from "@/lib/services/ordenes";

export async function GET(req: NextRequest) {
  const log = getRequestLogger(req);
  const sessionOrError = await requireSession(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const result = await service.listOrdenes();
    if (!result.ok) {
      return NextResponse.json(
        { data: null, errors: [{ code: result.code, message: result.message }] },
        { status: 400 }
      );
    }
    return NextResponse.json({ data: result.data });
  } catch (err) {
    log.error({ err }, "Error listing órdenes");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withIdempotency(req, async (request) => {
    const log = getRequestLogger(request);
    const sessionOrError = await requireSession(request);
    if (sessionOrError instanceof NextResponse) return sessionOrError;

    try {
      const body = await request.json();
      const parsed = createOrdenSchema.safeParse({
        ...body,
        createdBy: (sessionOrError.user as { id?: string }).id,
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

      const result = await service.createOrden(parsed.data);
      if (!result.ok) {
        const status = result.code === "ENVIO_EN_ORDEN_ACTIVA" ? 409 : 422;
        return NextResponse.json(
          { data: null, errors: [{ code: result.code, message: result.message, field: result.field }] },
          { status }
        );
      }

      log.info({ event: "orden.created", id: result.data.id });
      return NextResponse.json({ data: result.data }, { status: 201 });
    } catch (err) {
      log.error({ err }, "Error creating orden");
      return NextResponse.json(
        { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
        { status: 500 }
      );
    }
  });
}

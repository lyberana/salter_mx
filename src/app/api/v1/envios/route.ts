import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/middleware/auth";
import { withIdempotency } from "@/lib/middleware/idempotency";
import { getRequestLogger } from "@/lib/context/request-context";
import { createEnvioSchema, listEnviosSchema } from "@/lib/schemas/envios";
import * as service from "@/lib/services/envios";

export async function GET(req: NextRequest) {
  const log = getRequestLogger(req);
  const sessionOrError = await requireSession(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const { searchParams } = new URL(req.url);
  const parsed = listEnviosSchema.safeParse({
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 20),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, errors: [{ code: "VALIDATION_ERROR", message: "Parámetros inválidos" }] },
      { status: 422 }
    );
  }

  try {
    const result = await service.listEnvios(parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { data: null, errors: [{ code: result.code, message: result.message }] },
        { status: 400 }
      );
    }
    return NextResponse.json({
      data: result.data.data,
      meta: { page: result.data.page, limit: result.data.limit, total: result.data.total },
    });
  } catch (err) {
    log.error({ err }, "Error listing envíos");
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
      const parsed = createEnvioSchema.safeParse({
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

      const result = await service.createEnvio(parsed.data);
      if (!result.ok) {
        const status = result.code === "FOLIO_DUPLICADO" ? 409 : 422;
        return NextResponse.json(
          { data: null, errors: [{ code: result.code, message: result.message, field: result.field }] },
          { status }
        );
      }

      log.info({ event: "envio.created", id: result.data.id });
      return NextResponse.json({ data: result.data }, { status: 201 });
    } catch (err) {
      log.error({ err }, "Error creating envío");
      return NextResponse.json(
        { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
        { status: 500 }
      );
    }
  });
}

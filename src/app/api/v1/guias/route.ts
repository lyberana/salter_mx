import { NextRequest, NextResponse } from "next/server";
import { requireSession, requireRole } from "@/lib/middleware/auth";
import { withIdempotency } from "@/lib/middleware/idempotency";
import { getRequestLogger } from "@/lib/context/request-context";
import { createGuiaSchema } from "@/lib/schemas/guias";
import * as guiasService from "@/lib/services/guias";

export async function GET(req: NextRequest) {
  const log = getRequestLogger(req);
  const sessionOrError = await requireSession(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
    const estado = searchParams.get("estado") ?? undefined;

    const result = await guiasService.listGuias({ page, limit, estado });
    if (!result.ok) {
      return NextResponse.json(
        { data: null, errors: [{ code: result.code, message: result.message }] },
        { status: 400 }
      );
    }
    return NextResponse.json({ data: result.data });
  } catch (err) {
    log.error({ err }, "Error listing guías");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withIdempotency(req, async (request) => {
    const log = getRequestLogger(request);
    const checkRole = requireRole(["coordinador", "administrador"]);
    const sessionOrError = await checkRole(request);
    if (sessionOrError instanceof NextResponse) return sessionOrError;

    try {
      const body = await request.json();
      const parsed = createGuiaSchema.safeParse(body);
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

      const userId = (sessionOrError.user as { id?: string }).id!;
      const result = await guiasService.createGuia(parsed.data, userId);
      if (!result.ok) {
        return NextResponse.json(
          { data: null, errors: [{ code: result.code, message: result.message, field: result.field }] },
          { status: 422 }
        );
      }

      log.info({ event: "guia.created", id: result.data.id, folio: result.data.folio });
      return NextResponse.json({ data: result.data }, { status: 201 });
    } catch (err) {
      log.error({ err }, "Error creating guía");
      return NextResponse.json(
        { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
        { status: 500 }
      );
    }
  });
}

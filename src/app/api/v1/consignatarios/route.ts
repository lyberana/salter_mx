import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/middleware/auth";
import { getRequestLogger } from "@/lib/context/request-context";
import { createRemitenteSchema } from "@/lib/schemas/remitentes";
import * as service from "@/lib/services/remitentes";
import * as repo from "@/lib/repositories/remitentes";

export async function GET(req: NextRequest) {
  const log = getRequestLogger(req);
  const sessionOrError = await requireSession(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  try {
    const results = await repo.searchConsignatarios(q);
    log.info({ event: "consignatarios.search", query: q, count: results.length });
    return NextResponse.json({ data: results, meta: { total: results.length } });
  } catch (err) {
    log.error({ err }, "Error searching consignatarios");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const log = getRequestLogger(req);
  const sessionOrError = await requireSession(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const body = await req.json();
    const parsed = createRemitenteSchema.safeParse(body);
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

    const result = await service.createConsignatario(parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { data: null, errors: [{ code: result.code, message: result.message, field: result.field }] },
        { status: 422 }
      );
    }

    log.info({ event: "consignatario.created", id: result.data.id });
    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (err) {
    log.error({ err }, "Error creating consignatario");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

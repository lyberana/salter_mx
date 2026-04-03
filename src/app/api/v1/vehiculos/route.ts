import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/middleware/auth";
import { getRequestLogger } from "@/lib/context/request-context";
import { createVehiculoSchema } from "@/lib/schemas/flota";
import * as service from "@/lib/services/flota";
import * as repo from "@/lib/repositories/flota";

export async function GET(req: NextRequest) {
  const log = getRequestLogger(req);
  const sessionOrError = await requireSession(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const results = await repo.listVehiculos();
    log.info({ event: "vehiculos.list", count: results.length });
    return NextResponse.json({ data: results, meta: { total: results.length } });
  } catch (err) {
    log.error({ err }, "Error listing vehiculos");
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
    const parsed = createVehiculoSchema.safeParse(body);
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

    const result = await service.createVehiculo(parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { data: null, errors: [{ code: result.code, message: result.message, field: result.field }] },
        { status: 422 }
      );
    }

    log.info({ event: "vehiculo.created", id: result.data.id });
    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (err) {
    log.error({ err }, "Error creating vehiculo");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

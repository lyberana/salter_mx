import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { getRequestLogger } from "@/lib/context/request-context";
import { updateSystemConfigSchema } from "@/lib/schemas/guias";
import * as systemConfigService from "@/lib/services/systemConfig";

export async function GET(req: NextRequest) {
  const log = getRequestLogger(req);
  const checkRole = requireRole(["administrador"]);
  const sessionOrError = await checkRole(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const result = await systemConfigService.getConfig();
    if (!result.ok) {
      return NextResponse.json(
        { data: null, errors: [{ code: result.code, message: result.message }] },
        { status: 500 }
      );
    }
    return NextResponse.json({ data: result.data });
  } catch (err) {
    log.error({ err }, "Error fetching system config");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const log = getRequestLogger(req);
  const checkRole = requireRole(["administrador"]);
  const sessionOrError = await checkRole(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const body = await req.json();
    const parsed = updateSystemConfigSchema.safeParse(body);
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

    const result = await systemConfigService.updateConfig(parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { data: null, errors: [{ code: result.code, message: result.message, field: result.field }] },
        { status: 422 }
      );
    }

    log.info({ event: "system_config.updated", changes: parsed.data });
    return NextResponse.json({ data: result.data });
  } catch (err) {
    log.error({ err }, "Error updating system config");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/middleware/auth";
import { getRequestLogger } from "@/lib/context/request-context";
import * as guiasService from "@/lib/services/guias";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const log = getRequestLogger(req);
  const sessionOrError = await requireSession(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const { id } = await params;

  try {
    const result = await guiasService.getGuiaById(id);
    if (!result.ok) {
      const status = result.code === "GUIA_NO_ENCONTRADA" ? 404 : 500;
      return NextResponse.json(
        { data: null, errors: [{ code: result.code, message: result.message }] },
        { status }
      );
    }
    return NextResponse.json({ data: result.data });
  } catch (err) {
    log.error({ err, id }, "Error fetching guía");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

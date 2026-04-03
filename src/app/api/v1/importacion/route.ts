import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/middleware/auth";
import { getRequestLogger } from "@/lib/context/request-context";
import { db } from "@/lib/db";
import { importaciones } from "@/lib/db/schema";
import { inngest } from "@/lib/inngest/client";

const VALID_ENTIDADES = ["remitentes", "consignatarios", "envios"];

export async function POST(req: NextRequest) {
  const log = getRequestLogger(req);
  const sessionOrError = await requireSession(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const entidad = formData.get("entidad") as string;
    const dryRun = formData.get("dryRun") === "true";

    if (!file) {
      return NextResponse.json(
        { data: null, errors: [{ code: "VALIDATION_ERROR", message: "Archivo requerido" }] },
        { status: 422 }
      );
    }

    if (!VALID_ENTIDADES.includes(entidad)) {
      return NextResponse.json(
        { data: null, errors: [{ code: "VALIDATION_ERROR", message: "Entidad inválida" }] },
        { status: 422 }
      );
    }

    const userId = (sessionOrError.user as any).id as string;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create importacion record
    const [record] = await db.insert(importaciones).values({
      userId,
      nombreArchivo: file.name,
      entidad: entidad as "remitentes" | "consignatarios" | "envios",
    }).returning();

    // Send to Inngest for background processing
    await inngest.send({
      name: "importacion/procesar",
      data: {
        importacionId: record.id,
        fileBuffer: buffer.toString("base64"),
        filename: file.name,
        entidad,
        userId,
        dryRun,
      },
    });

    log.info({ event: "importacion.queued", id: record.id, entidad, dryRun });
    return NextResponse.json(
      { data: { id: record.id, estado: "pendiente", dryRun } },
      { status: 202 }
    );
  } catch (err) {
    log.error({ err }, "Error uploading import file");
    return NextResponse.json(
      { data: null, errors: [{ code: "SERVER_ERROR", message: "Error interno" }] },
      { status: 500 }
    );
  }
}

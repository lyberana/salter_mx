import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const VALID_ENTIDADES = ["remitentes", "consignatarios", "envios"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ entidad: string }> }
) {
  const { entidad } = await params;

  if (!VALID_ENTIDADES.includes(entidad)) {
    return NextResponse.json(
      { data: null, errors: [{ code: "NOT_FOUND", message: "Plantilla no encontrada" }] },
      { status: 404 }
    );
  }

  try {
    const filePath = join(process.cwd(), "public", "templates", `${entidad}.csv`);
    const content = readFileSync(filePath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${entidad}_plantilla.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { data: null, errors: [{ code: "NOT_FOUND", message: "Plantilla no encontrada" }] },
      { status: 404 }
    );
  }
}

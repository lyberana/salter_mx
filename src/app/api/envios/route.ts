import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(req: Request) {
  const { folio, peso, comentarios } = await req.json();
  await sql`
    INSERT INTO envios (folio, peso, comentarios, fecha)
    VALUES (${folio}, ${peso}, ${comentarios}, CURRENT_DATE)
  `;
  return NextResponse.json({ success: true });
}

export async function GET() {
  const rows = await sql`
    SELECT 
      e.id, e.folio, e.peso, e.comentarios, e.fecha,
      r.nombre AS remitente_nombre,
      r.direccion AS remitente_direccion,
      r.telefono AS remitente_telefono,
      c.nombre AS consignatario_nombre,
      c.direccion AS consignatario_direccion,
      c.telefono AS consignatario_telefono
    FROM envios e
    LEFT JOIN remitentes r ON e.remitente_id = r.id
    LEFT JOIN consignatarios c ON e.consignatario_id = c.id
    ORDER BY e.id DESC
  `;
  return NextResponse.json(rows);
}

import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { envios, envioEstadoHistorial, envioImagenes } from "@/lib/db/schema";

export async function createEnvio(data: typeof envios.$inferInsert) {
  const [created] = await db.insert(envios).values(data).returning();
  return created;
}

export async function getEnvioById(id: string) {
  const [row] = await db.select().from(envios).where(eq(envios.id, id)).limit(1);
  return row ?? null;
}

export async function getEnvioByFolio(folio: string) {
  const [row] = await db.select().from(envios).where(eq(envios.folio, folio)).limit(1);
  return row ?? null;
}

export async function listEnvios(page: number, limit: number) {
  const safeLimit = Math.min(limit, 50);
  const offset = (page - 1) * safeLimit;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(envios)
      .orderBy(desc(envios.createdAt))
      .limit(safeLimit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(envios),
  ]);

  const total = countResult[0]?.count ?? 0;
  return { data: rows, total, page, limit: safeLimit };
}

export async function updateEstado(
  envioId: string,
  estadoAnterior: string | null,
  estadoNuevo: string,
  changedBy: string,
  lat?: number | null,
  lng?: number | null,
  notas?: string | null
) {
  const [updated] = await db
    .update(envios)
    .set({ estado: estadoNuevo as typeof envios.$inferInsert["estado"], updatedAt: new Date() })
    .where(eq(envios.id, envioId))
    .returning();

  if (!updated) return null;

  const [historial] = await db
    .insert(envioEstadoHistorial)
    .values({
      envioId,
      estadoAnterior,
      estadoNuevo,
      changedBy,
      lat: lat != null ? String(lat) : null,
      lng: lng != null ? String(lng) : null,
      notas,
    })
    .returning();

  return { envio: updated, historial };
}

export async function countImagenes(envioId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(envioImagenes)
    .where(eq(envioImagenes.envioId, envioId));
  return result?.count ?? 0;
}

export async function addImagen(data: typeof envioImagenes.$inferInsert) {
  const [created] = await db.insert(envioImagenes).values(data).returning();
  return created;
}

export async function getHistorialEstados(envioId: string) {
  return db
    .select()
    .from(envioEstadoHistorial)
    .where(eq(envioEstadoHistorial.envioId, envioId))
    .orderBy(desc(envioEstadoHistorial.createdAt));
}

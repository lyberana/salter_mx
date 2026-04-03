import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { ordenes, envios } from "@/lib/db/schema";

export async function createOrden(data: typeof ordenes.$inferInsert) {
  const [created] = await db.insert(ordenes).values(data).returning();
  return created;
}

export async function getOrdenById(id: string) {
  const [row] = await db.select().from(ordenes).where(eq(ordenes.id, id)).limit(1);
  return row ?? null;
}

export async function listOrdenes() {
  return db.select().from(ordenes).orderBy(desc(ordenes.createdAt));
}

export async function updateOrdenEstado(id: string, estado: string) {
  const [updated] = await db.update(ordenes)
    .set({ estado: estado as typeof ordenes.$inferInsert["estado"], updatedAt: new Date() })
    .where(eq(ordenes.id, id))
    .returning();
  return updated ?? null;
}

export async function assignVehiculoOperador(id: string, vehiculoId: string, operadorId: string) {
  const [updated] = await db.update(ordenes)
    .set({ vehiculoId, operadorId, updatedAt: new Date() })
    .where(eq(ordenes.id, id))
    .returning();
  return updated ?? null;
}

export async function getNextSecuencial(yearMonth: string): Promise<number> {
  const prefix = `ORD-${yearMonth}-`;
  const [result] = await db.select({ count: sql<number>`count(*)::int` })
    .from(ordenes)
    .where(sql`${ordenes.numeroOrden} LIKE ${prefix + '%'}`);
  return (result?.count ?? 0) + 1;
}

export async function getEnviosDeOrden(ordenId: string) {
  return db.select().from(envios).where(eq(envios.ordenId, ordenId));
}

export async function asignarEnviosAOrden(envioIds: string[], ordenId: string) {
  await db.update(envios)
    .set({ ordenId, updatedAt: new Date() })
    .where(inArray(envios.id, envioIds));
}

export async function cascadeEnviosToEntregado(ordenId: string) {
  await db.update(envios)
    .set({ estado: "entregado", updatedAt: new Date() })
    .where(eq(envios.ordenId, ordenId));
}

export async function getEnviosEnOrdenActiva(envioIds: string[]) {
  return db.select({ id: envios.id, ordenId: envios.ordenId })
    .from(envios)
    .where(and(
      inArray(envios.id, envioIds),
      sql`${envios.ordenId} IS NOT NULL`
    ));
}

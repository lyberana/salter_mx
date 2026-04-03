import { eq, or, ilike, and, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { remitentes, consignatarios, envios } from "@/lib/db/schema";

// --- Remitentes ---

export async function createRemitente(data: typeof remitentes.$inferInsert) {
  const [created] = await db.insert(remitentes).values(data).returning();
  return created;
}

export async function getRemitenteById(id: string) {
  const [row] = await db.select().from(remitentes).where(eq(remitentes.id, id)).limit(1);
  return row ?? null;
}

export async function searchRemitentes(query: string) {
  return db
    .select()
    .from(remitentes)
    .where(
      or(
        ilike(remitentes.nombre, `%${query}%`),
        ilike(remitentes.rfc, `%${query}%`),
        ilike(remitentes.cp, `%${query}%`)
      )
    )
    .limit(50);
}

export async function updateRemitente(
  id: string,
  data: Partial<typeof remitentes.$inferInsert>
) {
  const [updated] = await db
    .update(remitentes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(remitentes.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteRemitente(id: string) {
  await db.delete(remitentes).where(eq(remitentes.id, id));
}

export async function hasActiveEnviosRemitente(id: string): Promise<boolean> {
  const rows = await db
    .select({ id: envios.id })
    .from(envios)
    .where(
      and(
        eq(envios.remitenteId, id),
        ne(envios.estado, "cancelado"),
        ne(envios.estado, "entregado")
      )
    )
    .limit(1);
  return rows.length > 0;
}

// --- Consignatarios ---

export async function createConsignatario(data: typeof consignatarios.$inferInsert) {
  const [created] = await db.insert(consignatarios).values(data).returning();
  return created;
}

export async function getConsignatarioById(id: string) {
  const [row] = await db
    .select()
    .from(consignatarios)
    .where(eq(consignatarios.id, id))
    .limit(1);
  return row ?? null;
}

export async function searchConsignatarios(query: string) {
  return db
    .select()
    .from(consignatarios)
    .where(
      or(
        ilike(consignatarios.nombre, `%${query}%`),
        ilike(consignatarios.rfc, `%${query}%`),
        ilike(consignatarios.cp, `%${query}%`)
      )
    )
    .limit(50);
}

export async function updateConsignatario(
  id: string,
  data: Partial<typeof consignatarios.$inferInsert>
) {
  const [updated] = await db
    .update(consignatarios)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(consignatarios.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteConsignatario(id: string) {
  await db.delete(consignatarios).where(eq(consignatarios.id, id));
}

export async function hasActiveEnviosConsignatario(id: string): Promise<boolean> {
  const rows = await db
    .select({ id: envios.id })
    .from(envios)
    .where(
      and(
        eq(envios.consignatarioId, id),
        ne(envios.estado, "cancelado"),
        ne(envios.estado, "entregado")
      )
    )
    .limit(1);
  return rows.length > 0;
}

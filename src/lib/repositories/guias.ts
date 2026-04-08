import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { guias, remitentes, consignatarios } from "@/lib/db/schema";

export async function createGuia(data: typeof guias.$inferInsert) {
  const [created] = await db.insert(guias).values(data).returning();
  return created;
}

export async function getGuiaById(id: string) {
  const [row] = await db
    .select({
      id: guias.id,
      folio: guias.folio,
      estado: guias.estado,
      remitenteId: guias.remitenteId,
      consignatarioId: guias.consignatarioId,
      pesoKg: guias.pesoKg,
      piezas: guias.piezas,
      tipoContenido: guias.tipoContenido,
      numeroCuenta: guias.numeroCuenta,
      recolectadoPor: guias.recolectadoPor,
      recibidoPor: guias.recibidoPor,
      comentarios: guias.comentarios,
      createdBy: guias.createdBy,
      createdAt: guias.createdAt,
      updatedAt: guias.updatedAt,
      remitente: {
        id: remitentes.id,
        nombre: remitentes.nombre,
        rfc: remitentes.rfc,
        calle: remitentes.calle,
        numExt: remitentes.numExt,
        numInt: remitentes.numInt,
        colonia: remitentes.colonia,
        municipio: remitentes.municipio,
        estado: remitentes.estado,
        cp: remitentes.cp,
        telefono: remitentes.telefono,
        email: remitentes.email,
      },
      consignatario: {
        id: consignatarios.id,
        nombre: consignatarios.nombre,
        rfc: consignatarios.rfc,
        calle: consignatarios.calle,
        numExt: consignatarios.numExt,
        numInt: consignatarios.numInt,
        colonia: consignatarios.colonia,
        municipio: consignatarios.municipio,
        estado: consignatarios.estado,
        cp: consignatarios.cp,
        telefono: consignatarios.telefono,
        email: consignatarios.email,
      },
    })
    .from(guias)
    .leftJoin(remitentes, eq(guias.remitenteId, remitentes.id))
    .leftJoin(consignatarios, eq(guias.consignatarioId, consignatarios.id))
    .where(eq(guias.id, id))
    .limit(1);
  return row ?? null;
}


export interface GuiaFilters {
  estado?: string;
  page?: number;
  limit?: number;
}

export async function listGuias(filters?: GuiaFilters) {
  const limit = Math.min(filters?.limit ?? 20, 50);
  const page = filters?.page ?? 1;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters?.estado) {
    conditions.push(eq(guias.estado, filters.estado as "creada" | "en_ruta" | "completada" | "cancelada"));
  }

  const query = db
    .select()
    .from(guias)
    .orderBy(desc(guias.createdAt))
    .limit(limit)
    .offset(offset);

  if (conditions.length > 0) {
    return query.where(conditions[0]);
  }

  return query;
}

export async function updateGuiaEstado(id: string, estado: string) {
  const [updated] = await db
    .update(guias)
    .set({
      estado: estado as typeof guias.$inferInsert["estado"],
      updatedAt: new Date(),
    })
    .where(eq(guias.id, id))
    .returning();
  return updated ?? null;
}

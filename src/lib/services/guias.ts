import * as repo from "@/lib/repositories/guias";
import type { GuiaFilters } from "@/lib/repositories/guias";
import { createGuiaSchema, type CreateGuiaInput } from "@/lib/schemas/guias";
import * as systemConfigService from "@/lib/services/systemConfig";
import { logEvent } from "@/lib/services/auditLog";
import { logger } from "@/lib/logger";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; field?: string };

// ─── createGuia ──────────────────────────────────────────────────────────────

export async function createGuia(
  input: CreateGuiaInput,
  userId: string
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.createGuia>>>> {
  const parsed = createGuiaSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: firstError.message,
      field: firstError.path.join("."),
    };
  }

  // Generate folio
  const folioResult = await systemConfigService.getNextFolio();
  if (!folioResult.ok) {
    return folioResult;
  }

  try {
    const guia = await repo.createGuia({
      folio: folioResult.data,
      estado: "creada",
      remitenteId: parsed.data.remitenteId,
      consignatarioId: parsed.data.consignatarioId,
      pesoKg: String(parsed.data.pesoKg),
      piezas: parsed.data.piezas,
      tipoContenido: parsed.data.tipoContenido ?? null,
      numeroCuenta: parsed.data.numeroCuenta ?? null,
      recolectadoPor: parsed.data.recolectadoPor ?? null,
      comentarios: parsed.data.comentarios ?? null,
      createdBy: userId,
    });

    await logEvent({
      nivel: "info",
      evento: "guia.created",
      userId,
      entidad: "guias",
      entidadId: guia.id,
      payload: { folio: guia.folio },
    });

    logger.info({ event: "guia.created", id: guia.id, folio: guia.folio });
    return { ok: true, data: guia };
  } catch (err) {
    logger.error({ err }, "Failed to create guia");
    return { ok: false, code: "SERVER_ERROR", message: "Error al crear la guía" };
  }
}

// ─── getGuiaById ─────────────────────────────────────────────────────────────

export async function getGuiaById(
  id: string
): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof repo.getGuiaById>>>>> {
  try {
    const guia = await repo.getGuiaById(id);
    if (!guia) {
      return { ok: false, code: "GUIA_NO_ENCONTRADA", message: "Guía no encontrada" };
    }
    return { ok: true, data: guia };
  } catch (err) {
    logger.error({ err }, "Failed to get guia by id");
    return { ok: false, code: "SERVER_ERROR", message: "Error al obtener la guía" };
  }
}

// ─── listGuias ───────────────────────────────────────────────────────────────

export async function listGuias(
  filters?: GuiaFilters
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.listGuias>>>> {
  try {
    const result = await repo.listGuias(filters);
    return { ok: true, data: result };
  } catch (err) {
    logger.error({ err }, "Failed to list guias");
    return { ok: false, code: "SERVER_ERROR", message: "Error al listar las guías" };
  }
}

// ─── cambiarEstadoGuia ──────────────────────────────────────────────────────

export async function cambiarEstadoGuia(
  id: string,
  estado: string,
  changedBy: string
): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof repo.updateGuiaEstado>>>>> {
  try {
    const guia = await repo.getGuiaById(id);
    if (!guia) {
      return { ok: false, code: "GUIA_NO_ENCONTRADA", message: "Guía no encontrada" };
    }

    const estadoAnterior = guia.estado;
    const updated = await repo.updateGuiaEstado(id, estado);
    if (!updated) {
      return { ok: false, code: "UPDATE_FALLIDO", message: "No se pudo actualizar el estado" };
    }

    await logEvent({
      nivel: "info",
      evento: "guia.estado.updated",
      userId: changedBy,
      entidad: "guias",
      entidadId: id,
      payload: { estadoAnterior, nuevoEstado: estado },
    });

    logger.info({ event: "guia.estado.updated", id, estadoAnterior, nuevoEstado: estado });
    return { ok: true, data: updated };
  } catch (err) {
    logger.error({ err }, "Failed to update guia estado");
    return { ok: false, code: "SERVER_ERROR", message: "Error al cambiar el estado de la guía" };
  }
}

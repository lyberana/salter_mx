import * as repo from "@/lib/repositories/ordenes";
import * as envioRepo from "@/lib/repositories/envios";
import * as flotaService from "@/lib/services/flota";
import { generateNumeroOrden, calcularPesoTotal } from "@/lib/utils/orden";
import { logEvent } from "@/lib/services/auditLog";
import { logger } from "@/lib/logger";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; field?: string };

// ─── createOrden ─────────────────────────────────────────────────────────────

export async function createOrden(input: {
  envioIds: string[];
  fechaEntregaComprometida?: string;
  vehiculoId?: string;
  operadorId?: string;
  createdBy: string;
}): Promise<ServiceResult<Awaited<ReturnType<typeof repo.createOrden>>>> {
  // Validate all envíos exist and are pendiente
  for (const envioId of input.envioIds) {
    const envio = await envioRepo.getEnvioById(envioId);
    if (!envio) {
      return { ok: false, code: "ENVIO_NO_ENCONTRADO", message: `Envío ${envioId} no encontrado` };
    }
    if (envio.estado !== "pendiente") {
      return {
        ok: false,
        code: "ENVIO_NO_PENDIENTE",
        message: `El envío ${envio.folio} no está en estado pendiente`,
      };
    }
  }

  // Check no envío is already in an active order
  const enOrdenActiva = await repo.getEnviosEnOrdenActiva(input.envioIds);
  if (enOrdenActiva.length > 0) {
    return {
      ok: false,
      code: "ENVIO_EN_ORDEN_ACTIVA",
      message: `El envío ${enOrdenActiva[0].id} ya pertenece a la orden ${enOrdenActiva[0].ordenId}`,
    };
  }

  // Generate order number
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const secuencial = await repo.getNextSecuencial(yearMonth);
  const numeroOrden = generateNumeroOrden(now, secuencial);

  // Calculate total weight from envíos
  const envios = await Promise.all(input.envioIds.map(id => envioRepo.getEnvioById(id)));
  const pesoTotal = calcularPesoTotal(envios.filter(Boolean).map(e => e!.pesoKg));

  // Validate vehicle capacity if assigned
  if (input.vehiculoId) {
    const vehiculoResult = await flotaService.asignarVehiculoAOrden(input.vehiculoId, pesoTotal);
    if (!vehiculoResult.ok) return vehiculoResult;
  }

  // Create order
  const orden = await repo.createOrden({
    numeroOrden,
    fechaEntregaComprometida: input.fechaEntregaComprometida,
    vehiculoId: input.vehiculoId,
    operadorId: input.operadorId,
    pesoTotalKg: String(pesoTotal),
    createdBy: input.createdBy,
  });

  // Assign envíos to order
  await repo.asignarEnviosAOrden(input.envioIds, orden.id);

  await logEvent({
    nivel: "info",
    evento: "orden.created",
    userId: input.createdBy,
    entidad: "ordenes",
    entidadId: orden.id,
    payload: { numeroOrden, envioCount: input.envioIds.length, pesoTotal },
  });

  logger.info({ event: "orden.created", id: orden.id, numeroOrden, envioCount: input.envioIds.length });
  return { ok: true, data: orden };
}

// ─── cambiarEstadoOrden ──────────────────────────────────────────────────────

export async function cambiarEstadoOrden(
  ordenId: string,
  nuevoEstado: string,
  changedBy: string
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.updateOrdenEstado>>>> {
  const orden = await repo.getOrdenById(ordenId);
  if (!orden) {
    return { ok: false, code: "ORDEN_NO_ENCONTRADA", message: "Orden no encontrada" };
  }

  const estadoAnterior = orden.estado;
  const updated = await repo.updateOrdenEstado(ordenId, nuevoEstado);
  if (!updated) {
    return { ok: false, code: "UPDATE_FALLIDO", message: "No se pudo actualizar el estado" };
  }

  // Cascade: when order completes, all envíos become entregado (Req 3.6)
  if (nuevoEstado === "completada") {
    await repo.cascadeEnviosToEntregado(ordenId);
    logger.info({ event: "orden.completada.cascade", ordenId, enviosUpdated: true });
  }

  await logEvent({
    nivel: "info",
    evento: "orden.estado.updated",
    userId: changedBy,
    entidad: "ordenes",
    entidadId: ordenId,
    payload: { estadoAnterior, nuevoEstado },
  });

  logger.info({ event: "orden.estado.updated", ordenId, estadoAnterior, nuevoEstado });
  return { ok: true, data: updated };
}

// ─── getOrdenById ────────────────────────────────────────────────────────────

export async function getOrdenById(
  id: string
): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof repo.getOrdenById>>>>> {
  const orden = await repo.getOrdenById(id);
  if (!orden) {
    return { ok: false, code: "ORDEN_NO_ENCONTRADA", message: "Orden no encontrada" };
  }
  return { ok: true, data: orden };
}

// ─── listOrdenes ─────────────────────────────────────────────────────────────

export async function listOrdenes(): Promise<ServiceResult<Awaited<ReturnType<typeof repo.listOrdenes>>>> {
  const result = await repo.listOrdenes();
  return { ok: true, data: result };
}

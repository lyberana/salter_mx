import * as repo from "@/lib/repositories/envios";
import { logEvent } from "@/lib/services/auditLog";
import type {
  CreateEnvioInput,
  UpdateEstadoInput,
  AddImagenInput,
  ListEnviosInput,
} from "@/lib/schemas/envios";

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; field?: string };

// ─── createEnvio ─────────────────────────────────────────────────────────────

export async function createEnvio(
  input: CreateEnvioInput
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.createEnvio>>>> {
  const existing = await repo.getEnvioByFolio(input.folio);
  if (existing) {
    await logEvent({
      nivel: "warn",
      evento: "envio.create.folio_duplicado",
      userId: input.createdBy,
      entidad: "envios",
      payload: { folio: input.folio },
      errorMessage: "Folio duplicado",
    });
    return {
      ok: false,
      code: "FOLIO_DUPLICADO",
      message: `El folio "${input.folio}" ya existe en la base de datos`,
      field: "folio",
    };
  }

  const created = await repo.createEnvio({
    folio: input.folio,
    pesoKg: String(input.pesoKg),
    largoCm: input.largoCm != null ? String(input.largoCm) : null,
    anchoCm: input.anchoCm != null ? String(input.anchoCm) : null,
    altoCm: input.altoCm != null ? String(input.altoCm) : null,
    tipoContenido: input.tipoContenido,
    valorDeclarado: String(input.valorDeclarado ?? 0),
    piezas: input.piezas ?? 1,
    embalaje: input.embalaje,
    ruta: input.ruta,
    numeroCuenta: input.numeroCuenta,
    guiaExterna: input.guiaExterna,
    codigoRastreo: input.codigoRastreo,
    facturado: input.facturado ?? false,
    comentarios: input.comentarios,
    remitenteId: input.remitenteId,
    consignatarioId: input.consignatarioId,
    ordenId: input.ordenId,
    createdBy: input.createdBy,
  });

  await logEvent({
    nivel: "info",
    evento: "envio.created",
    userId: input.createdBy,
    entidad: "envios",
    entidadId: created.id,
    payload: { folio: created.folio, estado: created.estado },
  });

  return { ok: true, data: created };
}

// ─── getEnvioById ─────────────────────────────────────────────────────────────

export async function getEnvioById(
  id: string
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.getEnvioById>>>> {
  const envio = await repo.getEnvioById(id);
  if (!envio) {
    return { ok: false, code: "ENVIO_NO_ENCONTRADO", message: "Envío no encontrado" };
  }
  return { ok: true, data: envio };
}

// ─── listEnvios ───────────────────────────────────────────────────────────────

export async function listEnvios(
  input: ListEnviosInput
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.listEnvios>>>> {
  const result = await repo.listEnvios(input.page, input.limit);
  return { ok: true, data: result };
}

// ─── updateEstado ─────────────────────────────────────────────────────────────

export async function updateEstado(
  envioId: string,
  input: UpdateEstadoInput
): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof repo.updateEstado>>>>> {
  const envio = await repo.getEnvioById(envioId);
  if (!envio) {
    return { ok: false, code: "ENVIO_NO_ENCONTRADO", message: "Envío no encontrado" };
  }

  const result = await repo.updateEstado(
    envioId,
    envio.estado,
    input.estadoNuevo,
    input.changedBy,
    input.lat,
    input.lng,
    input.notas
  );

  if (!result) {
    return { ok: false, code: "UPDATE_FALLIDO", message: "No se pudo actualizar el estado" };
  }

  await logEvent({
    nivel: "info",
    evento: "envio.estado.updated",
    userId: input.changedBy,
    entidad: "envios",
    entidadId: envioId,
    payload: {
      estadoAnterior: envio.estado,
      estadoNuevo: input.estadoNuevo,
      lat: input.lat,
      lng: input.lng,
      notas: input.notas,
    },
  });

  return { ok: true, data: result };
}

// ─── addImagen ────────────────────────────────────────────────────────────────

export async function addImagen(
  envioId: string,
  input: AddImagenInput,
  userId?: string
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.addImagen>>>> {
  // Validate size
  if (input.sizeBytes > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      code: "IMAGEN_DEMASIADO_GRANDE",
      message: `La imagen supera el tamaño máximo de 5 MB`,
      field: "sizeBytes",
    };
  }

  // Validate format
  if (input.mimeType !== "image/jpeg" && input.mimeType !== "image/png") {
    return {
      ok: false,
      code: "FORMATO_IMAGEN_INVALIDO",
      message: "Solo se permiten imágenes en formato JPG o PNG",
      field: "mimeType",
    };
  }

  // Validate envio exists
  const envio = await repo.getEnvioById(envioId);
  if (!envio) {
    return { ok: false, code: "ENVIO_NO_ENCONTRADO", message: "Envío no encontrado" };
  }

  // Validate image count
  const count = await repo.countImagenes(envioId);
  if (count >= MAX_IMAGES) {
    return {
      ok: false,
      code: "LIMITE_IMAGENES_ALCANZADO",
      message: `El envío ya tiene el máximo de ${MAX_IMAGES} imágenes permitidas`,
    };
  }

  const imagen = await repo.addImagen({
    envioId,
    url: input.url,
    filename: input.filename,
    sizeBytes: input.sizeBytes,
  });

  await logEvent({
    nivel: "info",
    evento: "envio.imagen.added",
    userId,
    entidad: "envios",
    entidadId: envioId,
    payload: { filename: input.filename, sizeBytes: input.sizeBytes },
  });

  return { ok: true, data: imagen };
}

import { validateRfc } from "@/lib/utils/rfc";
import { validateCp } from "@/lib/utils/cp";
import * as repo from "@/lib/repositories/remitentes";
import { logEvent } from "@/lib/services/auditLog";

export type CreateRemitenteInput = {
  nombre: string;
  rfc: string;
  calle: string;
  numExt: string;
  numInt?: string;
  colonia: string;
  municipio: string;
  estado: string;
  cp: string;
  pais?: string;
  telefono: string;
  email: string;
};

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; field?: string };

export async function createRemitente(
  input: CreateRemitenteInput
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.createRemitente>>>> {
  if (!validateRfc(input.rfc)) {
    return {
      ok: false,
      code: "RFC_INVALIDO",
      message: "El RFC no cumple el formato SAT",
      field: "rfc",
    };
  }
  if (!validateCp(input.cp)) {
    return {
      ok: false,
      code: "CP_INVALIDO",
      message: "El CP debe tener exactamente 5 dígitos",
      field: "cp",
    };
  }
  const created = await repo.createRemitente({ ...input, pais: input.pais ?? "MEX" });
  await logEvent({
    nivel: "info",
    evento: "remitente.created",
    entidad: "remitentes",
    entidadId: created.id,
    payload: { nombre: created.nombre, rfc: created.rfc },
  });
  return { ok: true, data: created };
}

export async function deleteRemitente(id: string): Promise<ServiceResult<void>> {
  const hasActive = await repo.hasActiveEnviosRemitente(id);
  if (hasActive) {
    return {
      ok: false,
      code: "ENTIDAD_CON_DEPENDENCIAS",
      message: "No se puede eliminar: el remitente tiene envíos activos asociados",
    };
  }
  await repo.deleteRemitente(id);
  await logEvent({
    nivel: "info",
    evento: "remitente.deleted",
    entidad: "remitentes",
    entidadId: id,
  });
  return { ok: true, data: undefined };
}

export async function createConsignatario(
  input: CreateRemitenteInput
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.createConsignatario>>>> {
  if (!validateRfc(input.rfc)) {
    return {
      ok: false,
      code: "RFC_INVALIDO",
      message: "El RFC no cumple el formato SAT",
      field: "rfc",
    };
  }
  if (!validateCp(input.cp)) {
    return {
      ok: false,
      code: "CP_INVALIDO",
      message: "El CP debe tener exactamente 5 dígitos",
      field: "cp",
    };
  }
  const created = await repo.createConsignatario({ ...input, pais: input.pais ?? "MEX" });
  await logEvent({
    nivel: "info",
    evento: "consignatario.created",
    entidad: "consignatarios",
    entidadId: created.id,
    payload: { nombre: created.nombre, rfc: created.rfc },
  });
  return { ok: true, data: created };
}

export async function deleteConsignatario(id: string): Promise<ServiceResult<void>> {
  const hasActive = await repo.hasActiveEnviosConsignatario(id);
  if (hasActive) {
    return {
      ok: false,
      code: "ENTIDAD_CON_DEPENDENCIAS",
      message: "No se puede eliminar: el consignatario tiene envíos activos asociados",
    };
  }
  await repo.deleteConsignatario(id);
  await logEvent({
    nivel: "info",
    evento: "consignatario.deleted",
    entidad: "consignatarios",
    entidadId: id,
  });
  return { ok: true, data: undefined };
}

import * as repo from "@/lib/repositories/flota";
import { logEvent } from "@/lib/services/auditLog";
import type { CreateVehiculoInput, CreateOperadorInput } from "@/lib/schemas/flota";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; field?: string };

// ─── Vehiculos ───────────────────────────────────────────────────────────────

export async function createVehiculo(
  input: CreateVehiculoInput
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.createVehiculo>>>> {
  const created = await repo.createVehiculo({
    placa: input.placa,
    numeroEconomico: input.numeroEconomico,
    tipo: input.tipo,
    capacidadKg: String(input.capacidadKg),
    capacidadM3: String(input.capacidadM3),
    anioModelo: input.anioModelo,
  });
  await logEvent({
    nivel: "info",
    evento: "vehiculo.created",
    entidad: "vehiculos",
    entidadId: created.id,
    payload: { placa: created.placa, tipo: created.tipo },
  });
  return { ok: true, data: created };
}

export async function cambiarEstadoVehiculo(
  vehiculoId: string,
  nuevoEstado: "disponible" | "en_ruta" | "en_mantenimiento" | "inactivo"
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.updateVehiculoEstado>>>> {
  const vehiculo = await repo.getVehiculoById(vehiculoId);
  if (!vehiculo) {
    return { ok: false, code: "VEHICULO_NO_ENCONTRADO", message: "Vehículo no encontrado" };
  }

  const updated = await repo.updateVehiculoEstado(vehiculoId, nuevoEstado);
  if (!updated) {
    return { ok: false, code: "UPDATE_FALLIDO", message: "No se pudo actualizar el estado del vehículo" };
  }
  await logEvent({
    nivel: "info",
    evento: "vehiculo.estado.updated",
    entidad: "vehiculos",
    entidadId: vehiculoId,
    payload: { estadoAnterior: vehiculo.estado, nuevoEstado },
  });
  return { ok: true, data: updated };
}

export async function asignarVehiculoAOrden(
  vehiculoId: string,
  pesoTotalOrden: number
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.updateVehiculoEstado>>>> {
  const vehiculo = await repo.getVehiculoById(vehiculoId);
  if (!vehiculo) {
    return { ok: false, code: "VEHICULO_NO_ENCONTRADO", message: "Vehículo no encontrado" };
  }

  if (vehiculo.estado !== "disponible") {
    return {
      ok: false,
      code: "VEHICULO_NO_DISPONIBLE",
      message: `El vehículo está en estado "${vehiculo.estado}", debe estar "disponible"`,
    };
  }

  const capacidadKg = Number(vehiculo.capacidadKg);
  if (capacidadKg < pesoTotalOrden) {
    return {
      ok: false,
      code: "CAPACIDAD_INSUFICIENTE",
      message: `Capacidad del vehículo (${capacidadKg} kg) es menor al peso de la orden (${pesoTotalOrden} kg)`,
    };
  }

  const updated = await repo.updateVehiculoEstado(vehiculoId, "en_ruta");
  if (!updated) {
    return { ok: false, code: "UPDATE_FALLIDO", message: "No se pudo actualizar el estado del vehículo" };
  }
  await logEvent({
    nivel: "info",
    evento: "vehiculo.asignado_a_orden",
    entidad: "vehiculos",
    entidadId: vehiculoId,
    payload: { pesoTotalOrden, capacidadKg },
  });
  return { ok: true, data: updated };
}

// ─── Operadores ──────────────────────────────────────────────────────────────

export async function createOperador(
  input: CreateOperadorInput
): Promise<ServiceResult<Awaited<ReturnType<typeof repo.createOperador>>>> {
  if (input.curp.length !== 18) {
    return {
      ok: false,
      code: "CURP_INVALIDO",
      message: "El CURP debe tener exactamente 18 caracteres",
      field: "curp",
    };
  }

  const created = await repo.createOperador({
    nombre: input.nombre,
    curp: input.curp,
    licenciaNum: input.licenciaNum,
    licenciaVence: input.licenciaVence,
    telefono: input.telefono,
    rfc: input.rfc,
  });
  await logEvent({
    nivel: "info",
    evento: "operador.created",
    entidad: "operadores",
    entidadId: created.id,
    payload: { nombre: created.nombre, curp: created.curp },
  });
  return { ok: true, data: created };
}

export async function getAlertasLicencia(): Promise<
  ServiceResult<Awaited<ReturnType<typeof repo.getOperadoresLicenciaProximaVencer>>>
> {
  const operadores = await repo.getOperadoresLicenciaProximaVencer(30);
  return { ok: true, data: operadores };
}

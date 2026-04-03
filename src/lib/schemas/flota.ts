import { z } from "zod";

export const tipoVehiculoEnum = z.enum([
  "camioneta",
  "camion_3_5t",
  "camion_10t",
  "trailer",
]);

export type TipoVehiculo = z.infer<typeof tipoVehiculoEnum>;

export const estadoVehiculoEnum = z.enum([
  "disponible",
  "en_ruta",
  "en_mantenimiento",
  "inactivo",
]);

export type EstadoVehiculo = z.infer<typeof estadoVehiculoEnum>;

export const createVehiculoSchema = z.object({
  placa:           z.string().min(1, "La placa es requerida"),
  numeroEconomico: z.string().min(1, "El número económico es requerido"),
  tipo:            tipoVehiculoEnum,
  capacidadKg:     z.number().positive("La capacidad en kg debe ser mayor a 0"),
  capacidadM3:     z.number().positive("La capacidad en m³ debe ser mayor a 0"),
  anioModelo:      z.number().int().min(1900).max(2100),
});

export type CreateVehiculoInput = z.infer<typeof createVehiculoSchema>;

export const createOperadorSchema = z.object({
  nombre:        z.string().min(1, "El nombre es requerido"),
  curp:          z.string().length(18, "El CURP debe tener exactamente 18 caracteres"),
  licenciaNum:   z.string().min(1, "El número de licencia es requerido"),
  licenciaVence: z.string().min(1, "La fecha de vencimiento es requerida"),
  telefono:      z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  rfc:           z.string().min(12).max(13).optional(),
});

export type CreateOperadorInput = z.infer<typeof createOperadorSchema>;

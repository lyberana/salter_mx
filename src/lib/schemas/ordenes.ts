import { z } from "zod";

export const createOrdenSchema = z.object({
  envioIds: z.array(z.string().uuid()).min(1, "Se requiere al menos un envío"),
  fechaEntregaComprometida: z.string().optional(),
  vehiculoId: z.string().uuid().optional(),
  operadorId: z.string().uuid().optional(),
  createdBy: z.string().uuid(),
});

export type CreateOrdenInput = z.infer<typeof createOrdenSchema>;

export const cambiarEstadoOrdenSchema = z.object({
  estado: z.enum(["borrador", "confirmada", "en_ruta", "completada", "cancelada"]),
  changedBy: z.string().uuid(),
});

export type CambiarEstadoOrdenInput = z.infer<typeof cambiarEstadoOrdenSchema>;

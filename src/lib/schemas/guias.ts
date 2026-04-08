import { z } from "zod";

export const createGuiaSchema = z.object({
  remitenteId:     z.string().uuid(),
  consignatarioId: z.string().uuid(),
  pesoKg:          z.number().positive(),
  piezas:          z.number().int().min(1),
  tipoContenido:   z.string().optional(),
  numeroCuenta:    z.string().optional(),
  recolectadoPor:  z.string().optional(),
  comentarios:     z.string().optional(),
});

export type CreateGuiaInput = z.infer<typeof createGuiaSchema>;

export const cambiarEstadoGuiaSchema = z.object({
  estado: z.enum(["en_ruta", "completada", "cancelada"]),
});

export type CambiarEstadoGuiaInput = z.infer<typeof cambiarEstadoGuiaSchema>;

export const updateSystemConfigSchema = z.object({
  folio_prefix:   z.string().min(1).max(10).optional(),
  default_copies: z.number().int().min(1).max(10).optional(),
});

export type UpdateSystemConfigInput = z.infer<typeof updateSystemConfigSchema>;

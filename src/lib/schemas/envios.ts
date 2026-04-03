import { z } from "zod";

export const estadoEnvioEnum = z.enum([
  "pendiente",
  "recolectado",
  "en_transito",
  "en_reparto",
  "entregado",
  "no_entregado",
  "cancelado",
]);

export type EstadoEnvio = z.infer<typeof estadoEnvioEnum>;

export const createEnvioSchema = z.object({
  folio:           z.string().min(1, "El folio es requerido"),
  pesoKg:          z.number().positive("El peso debe ser mayor a 0"),
  largoCm:         z.number().positive().optional(),
  anchoCm:         z.number().positive().optional(),
  altoCm:          z.number().positive().optional(),
  tipoContenido:   z.string().min(1, "El tipo de contenido es requerido"),
  valorDeclarado:  z.number().min(0).default(0),
  piezas:          z.number().int().min(1).default(1),
  embalaje:        z.string().optional(),
  ruta:            z.string().optional(),
  numeroCuenta:    z.string().optional(),
  guiaExterna:     z.string().optional(),
  codigoRastreo:   z.string().optional(),
  facturado:       z.boolean().default(false),
  comentarios:     z.string().optional(),
  remitenteId:     z.string().uuid("ID de remitente inválido"),
  consignatarioId: z.string().uuid("ID de consignatario inválido"),
  ordenId:         z.string().uuid().optional(),
  createdBy:       z.string().uuid("ID de usuario inválido"),
});

export type CreateEnvioInput = z.infer<typeof createEnvioSchema>;

export const updateEstadoSchema = z.object({
  estadoNuevo: estadoEnvioEnum,
  changedBy:   z.string().uuid("ID de usuario inválido"),
  lat:         z.number().optional(),
  lng:         z.number().optional(),
  notas:       z.string().optional(),
});

export type UpdateEstadoInput = z.infer<typeof updateEstadoSchema>;

export const addImagenSchema = z.object({
  url:       z.string().url("URL de imagen inválida"),
  filename:  z.string().min(1, "El nombre de archivo es requerido"),
  sizeBytes: z.number().int().positive("El tamaño debe ser mayor a 0"),
  mimeType:  z.enum(["image/jpeg", "image/png"], {
    message: "Solo se permiten imágenes JPG o PNG",
  }),
});

export type AddImagenInput = z.infer<typeof addImagenSchema>;

export const listEnviosSchema = z.object({
  page:  z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type ListEnviosInput = z.infer<typeof listEnviosSchema>;

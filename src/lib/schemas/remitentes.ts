import { z } from "zod";

export const createRemitenteSchema = z.object({
  nombre:    z.string().min(1, "El nombre es requerido"),
  rfc:       z.string().min(12).max(13),
  calle:     z.string().min(1),
  numExt:    z.string().min(1),
  numInt:    z.string().optional(),
  colonia:   z.string().min(1),
  municipio: z.string().min(1),
  estado:    z.string().min(1),
  cp:        z.string().length(5, "El CP debe tener 5 dígitos"),
  pais:      z.string().default("MEX"),
  telefono:  z.string().min(10),
  email:     z.string().email(),
});

export type CreateRemitenteInput = z.infer<typeof createRemitenteSchema>;

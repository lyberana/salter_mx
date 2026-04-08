import { pgTable, uuid, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { remitentes, consignatarios } from "./remitentes";
import { users } from "./users";

export const guias = pgTable("guias", {
  id:              uuid("id").primaryKey().defaultRandom(),
  folio:           text("folio").notNull().unique(),
  estado:          text("estado", {
                     enum: ["creada", "en_ruta", "completada", "cancelada"]
                   }).notNull().default("creada"),
  remitenteId:     uuid("remitente_id").notNull().references(() => remitentes.id),
  consignatarioId: uuid("consignatario_id").notNull().references(() => consignatarios.id),
  pesoKg:          numeric("peso_kg", { precision: 10, scale: 3 }).notNull().default("0"),
  piezas:          integer("piezas").notNull().default(1),
  tipoContenido:   text("tipo_contenido"),
  numeroCuenta:    text("numero_cuenta"),
  recolectadoPor:  text("recolectado_por"),
  recibidoPor:     text("recibido_por"),
  comentarios:     text("comentarios"),
  createdBy:       uuid("created_by").notNull().references(() => users.id),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

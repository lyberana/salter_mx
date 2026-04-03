import { pgTable, uuid, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { remitentes, consignatarios } from "./remitentes";
import { users } from "./users";

export const envios = pgTable("envios", {
  id:              uuid("id").primaryKey().defaultRandom(),
  folio:           text("folio").notNull().unique(),
  estado:          text("estado", {
                     enum: ["pendiente","recolectado","en_transito","en_reparto","entregado","no_entregado","cancelado"]
                   }).notNull().default("pendiente"),
  pesoKg:          numeric("peso_kg", { precision: 10, scale: 3 }).notNull(),
  largoCm:         numeric("largo_cm", { precision: 8, scale: 2 }),
  anchoCm:         numeric("ancho_cm", { precision: 8, scale: 2 }),
  altoCm:          numeric("alto_cm", { precision: 8, scale: 2 }),
  tipoContenido:   text("tipo_contenido").notNull(),
  valorDeclarado:  numeric("valor_declarado", { precision: 12, scale: 2 }).notNull().default("0"),
  piezas:          integer("piezas").notNull().default(1),
  embalaje:        text("embalaje"),
  ruta:            text("ruta"),
  numeroCuenta:    text("numero_cuenta"),
  recolectadoPor:  text("recolectado_por"),
  fechaRecoleccion: timestamp("fecha_recoleccion", { withTimezone: true }),
  recibidoPor:     text("recibido_por"),
  fechaRecepcion:  timestamp("fecha_recepcion", { withTimezone: true }),
  guiaExterna:     text("guia_externa"),
  codigoRastreo:   text("codigo_rastreo"),
  facturado:       boolean("facturado").notNull().default(false),
  comentarios:     text("comentarios"),
  remitenteId:     uuid("remitente_id").notNull().references(() => remitentes.id),
  consignatarioId: uuid("consignatario_id").notNull().references(() => consignatarios.id),
  ordenId:         uuid("orden_id"),
  createdBy:       uuid("created_by").notNull().references(() => users.id),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const envioEstadoHistorial = pgTable("envio_estado_historial", {
  id:             uuid("id").primaryKey().defaultRandom(),
  envioId:        uuid("envio_id").notNull().references(() => envios.id),
  estadoAnterior: text("estado_anterior"),
  estadoNuevo:    text("estado_nuevo").notNull(),
  changedBy:      uuid("changed_by").notNull().references(() => users.id),
  lat:            numeric("lat", { precision: 10, scale: 7 }),
  lng:            numeric("lng", { precision: 10, scale: 7 }),
  notas:          text("notas"),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const envioImagenes = pgTable("envio_imagenes", {
  id:        uuid("id").primaryKey().defaultRandom(),
  envioId:   uuid("envio_id").notNull().references(() => envios.id),
  url:       text("url").notNull(),
  filename:  text("filename").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

import { pgTable, uuid, text, jsonb, integer, timestamp } from "drizzle-orm/pg-core";

export const auditLog = pgTable("audit_log", {
  id:            uuid("id").primaryKey().defaultRandom(),
  correlationId: text("correlation_id").notNull(),
  nivel:         text("nivel", { enum: ["info","warn","error","critical"] }).notNull(),
  evento:        text("evento").notNull(),
  userId:        uuid("user_id"),
  entidad:       text("entidad"),
  entidadId:     text("entidad_id"),
  payload:       jsonb("payload"),
  errorMessage:  text("error_message"),
  stackTrace:    text("stack_trace"),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const idempotencyKeys = pgTable("idempotency_keys", {
  key:            text("key").primaryKey(),
  responseStatus: integer("response_status").notNull(),
  responseBody:   jsonb("response_body").notNull(),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const importaciones = pgTable("importaciones", {
  id:               uuid("id").primaryKey().defaultRandom(),
  userId:           uuid("user_id").notNull(),
  nombreArchivo:    text("nombre_archivo").notNull(),
  entidad:          text("entidad", { enum: ["remitentes","consignatarios","envios"] }).notNull(),
  estado:           text("estado", { enum: ["pendiente","procesando","completado","fallido"] }).notNull().default("pendiente"),
  totalRegistros:   integer("total_registros"),
  registrosValidos: integer("registros_validos"),
  registrosError:   integer("registros_error"),
  reporteUrl:       text("reporte_url"),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

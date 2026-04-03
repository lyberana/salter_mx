import { pgTable, uuid, text, numeric, integer, boolean, date, timestamp, char } from "drizzle-orm/pg-core";

export const vehiculos = pgTable("vehiculos", {
  id:              uuid("id").primaryKey().defaultRandom(),
  placa:           text("placa").notNull().unique(),
  numeroEconomico: text("numero_economico").notNull().unique(),
  tipo:            text("tipo", { enum: ["camioneta","camion_3_5t","camion_10t","trailer"] }).notNull(),
  capacidadKg:     numeric("capacidad_kg", { precision: 10, scale: 2 }).notNull(),
  capacidadM3:     numeric("capacidad_m3", { precision: 8, scale: 3 }).notNull(),
  anioModelo:      integer("anio_modelo").notNull(),
  estado:          text("estado", { enum: ["disponible","en_ruta","en_mantenimiento","inactivo"] }).notNull().default("disponible"),
  configVehicular: text("config_vehicular"),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const operadores = pgTable("operadores", {
  id:            uuid("id").primaryKey().defaultRandom(),
  nombre:        text("nombre").notNull(),
  curp:          char("curp", { length: 18 }).notNull().unique(),
  licenciaNum:   text("licencia_num").notNull(),
  licenciaVence: date("licencia_vence").notNull(),
  telefono:      text("telefono").notNull(),
  rfc:           text("rfc"),
  activo:        boolean("activo").notNull().default(true),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:     timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

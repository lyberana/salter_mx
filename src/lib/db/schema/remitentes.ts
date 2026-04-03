import { pgTable, uuid, text, char, timestamp } from "drizzle-orm/pg-core";

const direccionColumns = {
  calle:     text("calle").notNull(),
  numExt:    text("num_ext").notNull(),
  numInt:    text("num_int"),
  colonia:   text("colonia").notNull(),
  municipio: text("municipio").notNull(),
  estado:    text("estado").notNull(),
  cp:        char("cp", { length: 5 }).notNull(),
  pais:      text("pais").notNull().default("MEX"),
};

export const remitentes = pgTable("remitentes", {
  id:        uuid("id").primaryKey().defaultRandom(),
  nombre:    text("nombre").notNull(),
  rfc:       text("rfc").notNull(),
  ...direccionColumns,
  telefono:  text("telefono").notNull(),
  email:     text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const consignatarios = pgTable("consignatarios", {
  id:        uuid("id").primaryKey().defaultRandom(),
  nombre:    text("nombre").notNull(),
  rfc:       text("rfc").notNull(),
  ...direccionColumns,
  telefono:  text("telefono").notNull(),
  email:     text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

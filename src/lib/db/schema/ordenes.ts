import { pgTable, uuid, text, numeric, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { vehiculos, operadores } from "./flota";
import { users } from "./users";

export const ordenes = pgTable("ordenes", {
  id:                       uuid("id").primaryKey().defaultRandom(),
  numeroOrden:              text("numero_orden").notNull().unique(),
  estado:                   text("estado", { enum: ["borrador","confirmada","en_ruta","completada","cancelada"] }).notNull().default("borrador"),
  fechaEntregaComprometida: date("fecha_entrega_comprometida"),
  vehiculoId:               uuid("vehiculo_id").references(() => vehiculos.id),
  operadorId:               uuid("operador_id").references(() => operadores.id),
  pesoTotalKg:              numeric("peso_total_kg", { precision: 10, scale: 3 }).notNull().default("0"),
  distanciaKm:              numeric("distancia_km", { precision: 10, scale: 2 }),
  tiempoEstimadoMin:        integer("tiempo_estimado_min"),
  createdBy:                uuid("created_by").notNull().references(() => users.id),
  createdAt:                timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:                timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordenParadas = pgTable("orden_paradas", {
  id:         uuid("id").primaryKey().defaultRandom(),
  ordenId:    uuid("orden_id").notNull().references(() => ordenes.id),
  envioId:    uuid("envio_id").notNull(),
  secuencia:  integer("secuencia").notNull(),
  lat:        numeric("lat", { precision: 10, scale: 7 }),
  lng:        numeric("lng", { precision: 10, scale: 7 }),
  completada: boolean("completada").notNull().default(false),
  createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

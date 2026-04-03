import { pgTable, uuid, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id:             uuid("id").primaryKey().defaultRandom(),
  email:          text("email").notNull().unique(),
  passwordHash:   text("password_hash").notNull(),
  nombre:         text("nombre").notNull(),
  rol:            text("rol", { enum: ["administrador","coordinador","operador","cliente"] }).notNull(),
  activo:         boolean("activo").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil:    timestamp("locked_until", { withTimezone: true }),
  updatedBy:      uuid("updated_by"),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id:        uuid("id").primaryKey().defaultRandom(),
  keyHash:   text("key_hash").notNull().unique(),
  nombre:    text("nombre").notNull(),
  userId:    uuid("user_id").notNull().references(() => users.id),
  activo:    boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

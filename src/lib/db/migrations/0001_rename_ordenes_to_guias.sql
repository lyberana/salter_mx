-- Migration: Rename ordenes → guias, restructure columns, create system_config, drop orden_paradas

-- 1. Drop orden_paradas table (depends on ordenes, must go first)
DROP TABLE IF EXISTS "orden_paradas";
--> statement-breakpoint

-- 2. Drop foreign key constraints on ordenes before renaming
ALTER TABLE "ordenes" DROP CONSTRAINT IF EXISTS "ordenes_vehiculo_id_vehiculos_id_fk";
--> statement-breakpoint
ALTER TABLE "ordenes" DROP CONSTRAINT IF EXISTS "ordenes_operador_id_operadores_id_fk";
--> statement-breakpoint

-- 3. Rename table ordenes → guias
ALTER TABLE "ordenes" RENAME TO "guias";
--> statement-breakpoint

-- 4. Rename column numero_orden → folio
ALTER TABLE "guias" RENAME COLUMN "numero_orden" TO "folio";
--> statement-breakpoint

-- 5. Rename unique constraint
ALTER TABLE "guias" RENAME CONSTRAINT "ordenes_numero_orden_unique" TO "guias_folio_unique";
--> statement-breakpoint

-- 6. Rename created_by foreign key constraint
ALTER TABLE "guias" RENAME CONSTRAINT "ordenes_created_by_users_id_fk" TO "guias_created_by_users_id_fk";
--> statement-breakpoint

-- 7. Drop columns no longer needed
ALTER TABLE "guias" DROP COLUMN IF EXISTS "distancia_km";
--> statement-breakpoint
ALTER TABLE "guias" DROP COLUMN IF EXISTS "tiempo_estimado_min";
--> statement-breakpoint
ALTER TABLE "guias" DROP COLUMN IF EXISTS "fecha_entrega_comprometida";
--> statement-breakpoint
ALTER TABLE "guias" DROP COLUMN IF EXISTS "vehiculo_id";
--> statement-breakpoint
ALTER TABLE "guias" DROP COLUMN IF EXISTS "operador_id";
--> statement-breakpoint
ALTER TABLE "guias" DROP COLUMN IF EXISTS "peso_total_kg";
--> statement-breakpoint

-- 8. Update estado default from 'borrador' to 'creada'
ALTER TABLE "guias" ALTER COLUMN "estado" SET DEFAULT 'creada';
--> statement-breakpoint

-- 9. Add new columns
ALTER TABLE "guias" ADD COLUMN "remitente_id" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
--> statement-breakpoint
ALTER TABLE "guias" ADD COLUMN "consignatario_id" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
--> statement-breakpoint
ALTER TABLE "guias" ADD COLUMN "peso_kg" numeric(10, 3) NOT NULL DEFAULT '0';
--> statement-breakpoint
ALTER TABLE "guias" ADD COLUMN "piezas" integer NOT NULL DEFAULT 1;
--> statement-breakpoint
ALTER TABLE "guias" ADD COLUMN "tipo_contenido" text;
--> statement-breakpoint
ALTER TABLE "guias" ADD COLUMN "numero_cuenta" text;
--> statement-breakpoint
ALTER TABLE "guias" ADD COLUMN "recolectado_por" text;
--> statement-breakpoint
ALTER TABLE "guias" ADD COLUMN "recibido_por" text;
--> statement-breakpoint
ALTER TABLE "guias" ADD COLUMN "comentarios" text;
--> statement-breakpoint

-- 10. Add foreign key constraints for new columns
ALTER TABLE "guias" ADD CONSTRAINT "guias_remitente_id_remitentes_id_fk" FOREIGN KEY ("remitente_id") REFERENCES "public"."remitentes"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "guias" ADD CONSTRAINT "guias_consignatario_id_consignatarios_id_fk" FOREIGN KEY ("consignatario_id") REFERENCES "public"."consignatarios"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- 11. Remove the temporary defaults for FK columns (they should be required going forward)
ALTER TABLE "guias" ALTER COLUMN "remitente_id" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "guias" ALTER COLUMN "consignatario_id" DROP DEFAULT;
--> statement-breakpoint

-- 12. Create system_config table
CREATE TABLE "system_config" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- 13. Seed system_config with initial values
INSERT INTO "system_config" ("key", "value") VALUES
	('folio_prefix', 'SA'),
	('folio_counter', '0'),
	('default_copies', '3');

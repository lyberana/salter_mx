CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key_hash" text NOT NULL,
	"nombre" text NOT NULL,
	"user_id" uuid NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"nombre" text NOT NULL,
	"rol" text NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "consignatarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"rfc" text NOT NULL,
	"calle" text NOT NULL,
	"num_ext" text NOT NULL,
	"num_int" text,
	"colonia" text NOT NULL,
	"municipio" text NOT NULL,
	"estado" text NOT NULL,
	"cp" char(5) NOT NULL,
	"pais" text DEFAULT 'MEX' NOT NULL,
	"telefono" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remitentes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"rfc" text NOT NULL,
	"calle" text NOT NULL,
	"num_ext" text NOT NULL,
	"num_int" text,
	"colonia" text NOT NULL,
	"municipio" text NOT NULL,
	"estado" text NOT NULL,
	"cp" char(5) NOT NULL,
	"pais" text DEFAULT 'MEX' NOT NULL,
	"telefono" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "envio_estado_historial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"envio_id" uuid NOT NULL,
	"estado_anterior" text,
	"estado_nuevo" text NOT NULL,
	"changed_by" uuid NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "envio_imagenes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"envio_id" uuid NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "envios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"folio" text NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"peso_kg" numeric(10, 3) NOT NULL,
	"largo_cm" numeric(8, 2),
	"ancho_cm" numeric(8, 2),
	"alto_cm" numeric(8, 2),
	"tipo_contenido" text NOT NULL,
	"valor_declarado" numeric(12, 2) DEFAULT '0' NOT NULL,
	"comentarios" text,
	"remitente_id" uuid NOT NULL,
	"consignatario_id" uuid NOT NULL,
	"orden_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "envios_folio_unique" UNIQUE("folio")
);
--> statement-breakpoint
CREATE TABLE "operadores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"curp" char(18) NOT NULL,
	"licencia_num" text NOT NULL,
	"licencia_vence" date NOT NULL,
	"telefono" text NOT NULL,
	"rfc" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "operadores_curp_unique" UNIQUE("curp")
);
--> statement-breakpoint
CREATE TABLE "vehiculos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"placa" text NOT NULL,
	"numero_economico" text NOT NULL,
	"tipo" text NOT NULL,
	"capacidad_kg" numeric(10, 2) NOT NULL,
	"capacidad_m3" numeric(8, 3) NOT NULL,
	"anio_modelo" integer NOT NULL,
	"estado" text DEFAULT 'disponible' NOT NULL,
	"config_vehicular" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehiculos_placa_unique" UNIQUE("placa"),
	CONSTRAINT "vehiculos_numero_economico_unique" UNIQUE("numero_economico")
);
--> statement-breakpoint
CREATE TABLE "orden_paradas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orden_id" uuid NOT NULL,
	"envio_id" uuid NOT NULL,
	"secuencia" integer NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"completada" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ordenes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero_orden" text NOT NULL,
	"estado" text DEFAULT 'borrador' NOT NULL,
	"fecha_entrega_comprometida" date,
	"vehiculo_id" uuid,
	"operador_id" uuid,
	"peso_total_kg" numeric(10, 3) DEFAULT '0' NOT NULL,
	"distancia_km" numeric(10, 2),
	"tiempo_estimado_min" integer,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ordenes_numero_orden_unique" UNIQUE("numero_orden")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"correlation_id" text NOT NULL,
	"nivel" text NOT NULL,
	"evento" text NOT NULL,
	"user_id" uuid,
	"entidad" text,
	"entidad_id" text,
	"payload" jsonb,
	"error_message" text,
	"stack_trace" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"key" text PRIMARY KEY NOT NULL,
	"response_status" integer NOT NULL,
	"response_body" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "importaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nombre_archivo" text NOT NULL,
	"entidad" text NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"total_registros" integer,
	"registros_validos" integer,
	"registros_error" integer,
	"reporte_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "envio_estado_historial" ADD CONSTRAINT "envio_estado_historial_envio_id_envios_id_fk" FOREIGN KEY ("envio_id") REFERENCES "public"."envios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "envio_estado_historial" ADD CONSTRAINT "envio_estado_historial_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "envio_imagenes" ADD CONSTRAINT "envio_imagenes_envio_id_envios_id_fk" FOREIGN KEY ("envio_id") REFERENCES "public"."envios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "envios" ADD CONSTRAINT "envios_remitente_id_remitentes_id_fk" FOREIGN KEY ("remitente_id") REFERENCES "public"."remitentes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "envios" ADD CONSTRAINT "envios_consignatario_id_consignatarios_id_fk" FOREIGN KEY ("consignatario_id") REFERENCES "public"."consignatarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "envios" ADD CONSTRAINT "envios_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orden_paradas" ADD CONSTRAINT "orden_paradas_orden_id_ordenes_id_fk" FOREIGN KEY ("orden_id") REFERENCES "public"."ordenes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_vehiculo_id_vehiculos_id_fk" FOREIGN KEY ("vehiculo_id") REFERENCES "public"."vehiculos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_operador_id_operadores_id_fk" FOREIGN KEY ("operador_id") REFERENCES "public"."operadores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
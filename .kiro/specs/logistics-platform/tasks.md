# Implementation Plan: Logistics Platform (salter-mx)

## Overview

Implementación incremental en tres releases siguiendo la priorización MoSCoW. Cada release comienza con infraestructura/fundación antes de las tareas de negocio. El lenguaje de implementación es TypeScript en todo el proyecto (Next.js 15 App Router).

---

## Release 1 — Must Have (Req 1, 2, 3, 4, 11, 14, 15)

### R1 Foundation

- [x] 1. Configurar infraestructura base del proyecto
  - Instalar dependencias: `drizzle-orm`, `drizzle-kit`, `drizzle-orm/neon-http`, `next-auth@beta`, `bcryptjs`, `@types/bcryptjs`, `zod`, `pino`, `inngest`, `uuid`, `@types/uuid`
  - Crear `docker-compose.yml` con servicios `app`, `postgres` (puerto 5432) y `postgres_test` (puerto 5433)
  - Crear `Dockerfile` multi-stage para Next.js 15
  - Crear `drizzle.config.ts` apuntando a `src/lib/db/schema/index.ts` y output `src/lib/db/migrations/`
  - Crear `src/lib/db/index.ts` con cliente Drizzle + Neon (`drizzle(neon(DATABASE_URL), { schema })`)
  - Crear `.env.local.example` con todas las variables requeridas
  - _Requirements: Req 11 (stack), Req 13.8_

- [x] 2. Definir schema Drizzle — tablas core R1
  - Crear `src/lib/db/schema/users.ts`: tabla `users` y `api_keys`
  - Crear `src/lib/db/schema/remitentes.ts`: tablas `remitentes` y `consignatarios` con columnas de dirección compartidas
  - Crear `src/lib/db/schema/envios.ts`: tablas `envios`, `envio_estado_historial`, `envio_imagenes`
  - Crear `src/lib/db/schema/flota.ts`: tablas `vehiculos` y `operadores`
  - Crear `src/lib/db/schema/ordenes.ts`: tablas `ordenes` y `orden_paradas`
  - Crear `src/lib/db/schema/audit.ts`: tablas `audit_log`, `idempotency_keys`, `importaciones`
  - Crear `src/lib/db/schema/index.ts` re-exportando todos los schemas
  - Ejecutar `npx drizzle-kit generate` para generar migraciones SQL iniciales
  - _Requirements: Req 1.4, 2.1, 3.4, 4.1, 4.3, 11, 14, 15_

- [x] 3. Configurar Pino logger y middleware de correlationId
  - Crear `src/lib/logger.ts` con instancia Pino (nivel configurable por `LOG_LEVEL`, base `{ service: "salter-mx" }`)
  - Crear `src/lib/context/correlation.ts` usando `AsyncLocalStorage` para propagar `correlationId` (UUID v4) por request
  - Crear `src/middleware.ts` de Next.js que asigna `correlationId` a cada request entrante y lo inyecta en headers y contexto
  - _Requirements: Req 14.2, 14.8_

- [x] 4. Configurar Auth.js v5 (autenticación base)
  - Instalar `next-auth@beta` y configurar `src/auth.ts` con credentials provider (email + bcrypt, cost factor 12)
  - Crear `src/app/api/auth/[...nextauth]/route.ts`
  - Implementar JWT session con expiración de 8 horas; incluir `rol` y `userId` en el JWT payload
  - Crear `src/lib/middleware/auth.ts` con funciones `requireSession`, `requireApiKey`, `requireRole`
  - Crear páginas de login/logout en `src/app/(auth)/`
  - _Requirements: Req 11.1, 11.2, 11.3, 11.5_

- [x] 5. Configurar cliente Inngest
  - Instalar `inngest`
  - Crear `src/lib/inngest/client.ts` con instancia `Inngest`
  - Crear `src/app/api/inngest/route.ts` como endpoint handler de Inngest para Next.js
  - Crear `src/lib/inngest/functions/index.ts` como barrel de funciones (vacío por ahora)
  - _Requirements: Req 14.4, 15.5_

- [x] 6. Implementar middleware de idempotency keys
  - Crear `src/lib/middleware/idempotency.ts` que lee el header `X-Idempotency-Key`
  - Si la key existe en `idempotency_keys` (dentro de 24h), retornar el `response_status` y `response_body` almacenados sin ejecutar la operación
  - Si no existe, ejecutar la operación y persistir el resultado en `idempotency_keys`
  - _Requirements: Req 14.8, 15.5 (Property 50)_

  - [ ]* 6.1 Escribir property test para idempotencia (Property 50)
    - **Property 50: Idempotencia de operaciones críticas**
    - **Validates: Requirements 14.8, 15.5**

### R1 — Req 11: Autenticación y Control de Acceso

- [x] 7. Implementar lógica de autenticación y RBAC
  - Crear `src/lib/services/auth.ts` con funciones: `authenticateUser`, `lockAccount`, `checkAccountLock`, `hashPassword`, `verifyPassword`
  - Implementar bloqueo de cuenta tras 5 fallos consecutivos por 15 minutos (campos `failed_attempts`, `locked_until` en `users`)
  - Implementar RBAC: middleware `requireRole` que retorna HTTP 403 y registra en `audit_log` los intentos no autorizados
  - Crear `src/lib/utils/auth.ts` con helpers de validación de roles
  - _Requirements: Req 11.1, 11.3, 11.4, 11.6_

  - [ ]* 7.1 Escribir property test para hash de contraseñas (Property 39)
    - **Property 39: Hash seguro de contraseñas**
    - **Validates: Requirements 11.3**

  - [ ]* 7.2 Escribir property test para bloqueo de cuenta (Property 40)
    - **Property 40: Bloqueo de cuenta tras 5 fallos consecutivos**
    - **Validates: Requirements 11.4**

  - [ ]* 7.3 Escribir property test para RBAC (Property 38)
    - **Property 38: Control de acceso por rol**
    - **Validates: Requirements 11.1, 11.6**

### R1 — Req 2: Gestión de Remitentes y Consignatarios

- [x] 8. Implementar utilidades de validación RFC y CP
  - Crear `src/lib/utils/rfc.ts` con función `validateRfc(rfc: string): boolean` (patrón SAT: 12 chars persona moral, 13 persona física)
  - Crear `src/lib/utils/cp.ts` con función `validateCp(cp: string): boolean` (exactamente 5 dígitos numéricos)
  - _Requirements: Req 2.2, 2.3_

  - [ ]* 8.1 Escribir property test para validación RFC (Property 7)
    - **Property 7: Validación de RFC**
    - **Validates: Requirements 2.2**

  - [ ]* 8.2 Escribir property test para validación CP (Property 8)
    - **Property 8: Validación de CP**
    - **Validates: Requirements 2.3**

- [x] 9. Implementar repositorio y servicio de remitentes/consignatarios
  - Crear `src/lib/repositories/remitentes.ts` con funciones CRUD y búsqueda por nombre/RFC/CP
  - Crear `src/lib/services/remitentes.ts` con lógica: validar RFC, validar CP, proteger eliminación si hay envíos activos
  - Crear schemas Zod en `src/lib/schemas/remitentes.ts` para validación de request bodies
  - _Requirements: Req 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 9.1 Escribir property test para protección de entidades con dependencias (Property 9)
    - **Property 9: Protección de entidades con dependencias activas**
    - **Validates: Requirements 2.5**

- [x] 10. Crear API routes para remitentes y consignatarios
  - Crear `src/app/api/v1/remitentes/route.ts` (GET búsqueda, POST crear)
  - Crear `src/app/api/v1/consignatarios/route.ts` (GET búsqueda, POST crear)
  - Aplicar middleware de autenticación y correlationId
  - Retornar respuestas con envelope `{ data, meta?, errors? }`
  - _Requirements: Req 2.1, 2.4, 9.1, 9.3_

  - [ ]* 10.1 Escribir tests de integración para API de remitentes/consignatarios
    - Verificar contratos HTTP, status codes, estructura envelope
    - _Requirements: Req 2.1, 2.4, 13.4_

### R1 — Req 1: Gestión de Envíos

- [x] 11. Implementar repositorio y servicio de envíos
  - Crear `src/lib/repositories/envios.ts` con funciones: `createEnvio`, `getEnvioById`, `getEnvioByFolio`, `listEnvios` (paginado, máx 50), `updateEstado`, `addImagen`
  - Crear `src/lib/services/envios.ts` con lógica: rechazar folio duplicado (`FOLIO_DUPLICADO`), validar límite de 5 imágenes (JPG/PNG, máx 5 MB), registrar transición de estado en `envio_estado_historial`, registrar en `audit_log`
  - Crear schemas Zod en `src/lib/schemas/envios.ts`
  - _Requirements: Req 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 11.1 Escribir property test para estado inicial de envío (Property 2)
    - **Property 2: Estado inicial correcto al crear entidad**
    - **Validates: Requirements 1.2**

  - [ ]* 11.2 Escribir property test para historial de transición de estado (Property 3)
    - **Property 3: Historial de transición de estado**
    - **Validates: Requirements 1.3**

  - [ ]* 11.3 Escribir property test para rechazo de folio duplicado (Property 4)
    - **Property 4: Rechazo de folio duplicado**
    - **Validates: Requirements 1.5**

  - [ ]* 11.4 Escribir property test para límite de imágenes (Property 5)
    - **Property 5: Límite de imágenes por envío**
    - **Validates: Requirements 1.6**

  - [ ]* 11.5 Escribir property test para paginación (Property 6)
    - **Property 6: Paginación no excede límite**
    - **Validates: Requirements 1.7**

- [x] 12. Crear API routes para envíos
  - Crear `src/app/api/v1/envios/route.ts` (GET lista paginada, POST crear)
  - Crear `src/app/api/v1/envios/[id]/route.ts` (GET por ID)
  - Crear `src/app/api/v1/envios/[id]/estado/route.ts` (PATCH cambio de estado, con idempotency key)
  - Aplicar middleware de autenticación, correlationId, e idempotency
  - _Requirements: Req 1.1, 1.7, 9.1, 9.3_

  - [ ]* 12.1 Escribir tests de integración para API de envíos
    - Verificar contratos HTTP, paginación, cambio de estado, folio duplicado
    - _Requirements: Req 1.1, 1.5, 1.7, 13.4_

- [x] 13. Crear páginas UI para gestión de envíos
  - Crear `src/app/(dashboard)/envios/page.tsx` con tabla paginada de envíos usando shadcn/ui
  - Crear `src/app/(dashboard)/envios/nuevo/page.tsx` con formulario de registro
  - Crear `src/app/(dashboard)/envios/[id]/page.tsx` con detalle y cambio de estado
  - _Requirements: Req 1.1, 1.2, 1.7_

### R1 — Req 4: Gestión de Flota

- [x] 14. Implementar repositorio y servicio de flota
  - Crear `src/lib/repositories/flota.ts` con funciones CRUD para `vehiculos` y `operadores`
  - Crear `src/lib/services/flota.ts` con lógica: validar disponibilidad y capacidad al asignar vehículo, cambiar estado a `en_ruta` al confirmar orden, detectar licencias próximas a vencer (≤ 30 días)
  - Crear schemas Zod en `src/lib/schemas/flota.ts`
  - _Requirements: Req 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 14.1 Escribir property test para validación de capacidad al asignar vehículo (Property 15)
    - **Property 15: Validación de capacidad al asignar vehículo**
    - **Validates: Requirements 4.4**

  - [ ]* 14.2 Escribir property test para alerta de licencia próxima a vencer (Property 16)
    - **Property 16: Alerta de licencia próxima a vencer**
    - **Validates: Requirements 4.5**

  - [ ]* 14.3 Escribir property test para cambio de estado de vehículo al confirmar orden (Property 17)
    - **Property 17: Cambio de estado de vehículo al asignar a orden confirmada**
    - **Validates: Requirements 4.6**

- [x] 15. Crear API routes para flota
  - Crear `src/app/api/v1/vehiculos/route.ts` (GET lista, POST registrar)
  - Crear `src/app/api/v1/operadores/route.ts` (GET lista, POST registrar)
  - _Requirements: Req 4.1, 4.3, 9.1, 9.3_

  - [ ]* 15.1 Escribir tests de integración para API de flota
    - Verificar contratos HTTP, validación de capacidad, estado de vehículo
    - _Requirements: Req 4.4, 13.4_

- [x] 16. Crear páginas UI para gestión de flota
  - Crear `src/app/(dashboard)/flota/page.tsx` con tabs para vehículos y operadores
  - Crear formularios de registro de vehículo y operador con shadcn/ui
  - Mostrar alerta de licencias próximas a vencer en la página de flota
  - _Requirements: Req 4.1, 4.3, 4.5_

### R1 — Req 3: Gestión de Órdenes de Transporte

- [x] 17. Implementar utilidades de formato de número de orden y cálculo de peso
  - Crear `src/lib/utils/orden.ts` con funciones: `generateNumeroOrden(fecha: Date, secuencial: number): string` (formato `ORD-{YYYYMM}-{00000}`), `calcularPesoTotal(envios: Envio[]): number`
  - _Requirements: Req 3.2, 3.3_

  - [ ]* 17.1 Escribir property test para formato de número de orden (Property 11)
    - **Property 11: Formato de número de orden**
    - **Validates: Requirements 3.2**

  - [ ]* 17.2 Escribir property test para peso total de orden (Property 12)
    - **Property 12: Peso total de orden es suma de pesos de envíos**
    - **Validates: Requirements 3.3**

- [x] 18. Implementar repositorio y servicio de órdenes
  - Crear `src/lib/repositories/ordenes.ts` con funciones CRUD y consulta de envíos asociados
  - Crear `src/lib/services/ordenes.ts` con lógica: validar que envíos estén en estado `pendiente`, rechazar envío ya en orden activa (`ENVIO_EN_ORDEN_ACTIVA`), calcular peso total, cascada de estado `completada` → todos los envíos a `entregado`, asignar vehículo (validar disponibilidad y capacidad), cambiar vehículo a `en_ruta`
  - Crear schemas Zod en `src/lib/schemas/ordenes.ts`
  - Registrar eventos en `audit_log`
  - _Requirements: Req 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 18.1 Escribir property test para creación de orden solo con envíos pendientes (Property 10)
    - **Property 10: Creación de orden solo con envíos en estado pendiente**
    - **Validates: Requirements 3.1**

  - [ ]* 18.2 Escribir property test para cascada de estado al completar orden (Property 13)
    - **Property 13: Cascada de estado al completar orden**
    - **Validates: Requirements 3.6**

  - [ ]* 18.3 Escribir property test para rechazo de envío ya asignado (Property 14)
    - **Property 14: Rechazo de envío ya asignado a orden activa**
    - **Validates: Requirements 3.7**

- [x] 19. Crear API routes para órdenes
  - Crear `src/app/api/v1/ordenes/route.ts` (GET lista, POST crear con idempotency key)
  - Crear `src/app/api/v1/ordenes/[id]/estado/route.ts` (PATCH cambio de estado con idempotency key)
  - _Requirements: Req 3.1, 3.5, 9.1, 9.3_

  - [ ]* 19.1 Escribir tests de integración para API de órdenes
    - Verificar contratos HTTP, creación, cambio de estado, cascada a envíos
    - _Requirements: Req 3.1, 3.6, 3.7, 13.4_

- [x] 20. Crear páginas UI para gestión de órdenes
  - Crear `src/app/(dashboard)/ordenes/page.tsx` con lista de órdenes
  - Crear `src/app/(dashboard)/ordenes/nueva/page.tsx` con formulario de creación (selección de envíos, vehículo, operador)
  - Crear `src/app/(dashboard)/ordenes/[id]/page.tsx` con detalle y cambio de estado
  - _Requirements: Req 3.1, 3.4, 3.5_

- [x] 21. Checkpoint R1 — Entidades core
  - Asegurar que todos los tests unitarios y de integración de R1 core pasen. Verificar que `npm test` retorna exit code 0. Consultar al usuario si hay dudas antes de continuar.

### R1 — Req 14: Audit Log y Monitoreo

- [x] 22. Implementar servicio de audit log
  - Crear `src/lib/services/auditLog.ts` con función `logEvent({ correlationId, nivel, evento, userId?, entidad?, entidadId?, payload?, errorMessage?, stackTrace? })`
  - Integrar `logEvent` en todos los servicios de R1: envíos, órdenes, flota, remitentes, consignatarios, auth
  - Implementar throttling de alertas críticas: si el mismo error crítico se repite > 5 veces en 10 minutos, encolar un solo job `alerta/throttled` (no uno por evento)
  - _Requirements: Req 14.1, 14.2, 14.3, 14.6, 14.7, 14.8_

  - [ ]* 22.1 Escribir property test para registro de eventos en audit log (Property 46)
    - **Property 46: Registro de eventos en audit log**
    - **Validates: Requirements 14.1, 14.8**

- [x] 23. Implementar Inngest jobs para alertas críticas
  - Crear `src/lib/inngest/functions/alertas.ts` con jobs `alerta/critical` (email inmediato al admin) y `alerta/throttled` (agrupación de errores repetidos)
  - Registrar los jobs en el barrel `src/lib/inngest/functions/index.ts`
  - _Requirements: Req 14.4, 14.7_

  - [ ]* 23.1 Escribir property test para notificación de error crítico (Property 47)
    - **Property 47: Notificación de error crítico al administrador**
    - **Validates: Requirements 14.4, 14.7**

- [x] 24. Crear API route y UI para consulta de audit log
  - Crear `src/app/api/v1/audit-log/route.ts` (GET con filtros: nivel, fecha, tipo de evento, usuario; paginado; solo rol `administrador`)
  - Crear `src/app/(dashboard)/audit-log/page.tsx` con tabla filtrable usando shadcn/ui
  - _Requirements: Req 14.5_

### R1 — Req 15: Importación Masiva de Datos

- [x] 25. Implementar parser y validador de archivos CSV/XLSX
  - Instalar `xlsx` (o `exceljs`) para parsing de XLSX
  - Crear `src/lib/services/importacion/parser.ts` con función `parseFile(buffer, entidad): ParsedRow[]` para CSV y XLSX
  - Crear `src/lib/services/importacion/validator.ts` con función `validateRows(rows, entidad): ValidationReport` que valida RFC, CP, campos requeridos, y duplicados internos al archivo
  - Crear plantillas CSV descargables en `public/templates/` para remitentes, consignatarios, y envíos
  - _Requirements: Req 15.1, 15.2, 15.7_

- [x] 26. Implementar job Inngest para importación en background
  - Crear `src/lib/inngest/functions/importacion.ts` con job `importacion/procesar` que: valida todos los registros, omite duplicados (mismo RFC + nombre), persiste solo registros válidos, actualiza estado en tabla `importaciones`, envía email al admin al completar
  - Registrar el job en el barrel de funciones
  - _Requirements: Req 15.4, 15.5, 15.6, 15.8_

  - [ ]* 26.1 Escribir property test para dry-run no persiste datos (Property 48)
    - **Property 48: Dry-run no persiste datos**
    - **Validates: Requirements 15.3**

  - [ ]* 26.2 Escribir property test para importación omite duplicados (Property 49)
    - **Property 49: Importación omite duplicados**
    - **Validates: Requirements 15.8**

- [x] 27. Crear API routes y UI para importación masiva
  - Crear `src/app/api/v1/importacion/route.ts` (POST cargar archivo, soporta dry-run via query param)
  - Crear `src/app/api/v1/importacion/[id]/route.ts` (GET estado del job)
  - Crear `src/app/api/v1/importacion/plantilla/[entidad]/route.ts` (GET descargar plantilla CSV)
  - Crear `src/app/(dashboard)/importacion/page.tsx` con uploader, modo dry-run, y visualización del reporte de validación
  - _Requirements: Req 15.1, 15.2, 15.3, 15.4, 15.5, 15.7_

- [x] 28. Checkpoint R1 — Release 1 completo
  - Verificar que todos los tests de R1 pasan con `npm test`. Confirmar que `docker compose up` levanta el entorno completo sin configuración manual. Consultar al usuario antes de iniciar R2.

---

## Release 2 — Should Have (Req 5, 8, 9, 10, 12, 13)

### R2 Foundation

- [ ] 29. Instalar dependencias de R2
  - Instalar `resend`, `@react-email/components`, `react-email`, `maplibre-gl`, `@types/maplibre-gl`
  - Instalar `xmlbuilder2` para generación de XML CFDI
  - Instalar `swagger-ui-react` o `@scalar/nextjs-api-reference` para documentación OpenAPI
  - Crear `src/lib/db/schema/tracking.ts`: tabla `ubicaciones_gps`
  - Crear `src/lib/db/schema/cfdi.ts`: tabla `cfdis`
  - Crear `src/lib/db/schema/webhooks.ts`: tabla `webhook_endpoints` y `webhook_deliveries`
  - Crear `src/lib/db/schema/notificaciones.ts`: tabla `notificaciones`
  - Actualizar `src/lib/db/schema/index.ts` con los nuevos schemas
  - Ejecutar `npx drizzle-kit generate` para nuevas migraciones
  - _Requirements: Req 5, 8, 9, 12_

### R2 — Req 5: Rastreo en Tiempo Real

- [ ] 30. Implementar repositorio y servicio de tracking GPS
  - Crear `src/lib/repositories/tracking.ts` con funciones: `saveUbicacion`, `getUltimaUbicacion`, `getHistorialUbicaciones` (retención 90 días), `getVehiculosSinSenal` (> 60 min sin actualización)
  - Crear `src/lib/services/tracking.ts` con lógica de idempotencia por `clientEventId`, procesamiento de batch offline, y detección de vehículos sin señal
  - _Requirements: Req 5.2, 5.3, 5.6_

  - [ ]* 30.1 Escribir property test para persistencia de coordenadas GPS (Property 18)
    - **Property 18: Persistencia de coordenadas GPS**
    - **Validates: Requirements 5.2**

  - [ ]* 30.2 Escribir property test para GPS en evento de entrega (Property 19)
    - **Property 19: Coordenadas GPS en evento de entrega**
    - **Validates: Requirements 5.4**

  - [ ]* 30.3 Escribir property test para alerta de vehículo sin señal (Property 20)
    - **Property 20: Alerta de vehículo sin señal**
    - **Validates: Requirements 5.6**

- [ ] 31. Crear API routes de tracking
  - Crear `src/app/api/v1/tracking/ubicacion/route.ts` (POST reportar ubicación GPS con idempotency key)
  - Crear `src/app/api/v1/tracking/sync/route.ts` (POST sync offline batch con idempotency key)
  - Crear `src/app/api/v1/tracking/stream/route.ts` (GET SSE stream de ubicaciones para el mapa del dashboard)
  - Crear `src/app/api/v1/envios/[folio]/tracking/route.ts` (GET rastreo público sin auth)
  - Crear `src/app/tracking/[folio]/page.tsx` como página pública de rastreo
  - _Requirements: Req 5.1, 5.2, 5.3, 5.4_

- [ ] 32. Integrar mapa MapLibre GL JS en el dashboard
  - Crear componente `src/components/mapa/MapaFlota.tsx` que consume el SSE stream y muestra posición de vehículos `en_ruta`
  - Mostrar alertas de vehículos sin señal (> 60 min) en el mapa
  - _Requirements: Req 5.5, 5.6_

### R2 — Req 8: Cumplimiento Fiscal SAT/CFDI con Carta Porte

- [ ] 33. Implementar builder de XML CFDI Carta Porte 3.1
  - Crear `src/lib/cfdi/builder.ts` con función pura `buildCartaPorteXml(data: CartaPorteData): string` usando `xmlbuilder2`
  - Crear `src/lib/cfdi/parser.ts` con función `parseCartaPorteXml(xml: string): CartaPorteData`
  - Crear `src/types/cfdi.ts` con interfaces `CartaPorteData`, `MercanciaData`, `TransportistaData`
  - _Requirements: Req 8.1, 8.2_

  - [ ]* 33.1 Escribir property test para XML CFDI válido y completo (Property 26)
    - **Property 26: XML CFDI válido y completo**
    - **Validates: Requirements 8.1, 8.2**

  - [ ]* 33.2 Escribir property test para round-trip de serialización XML CFDI (Property 27)
    - **Property 27: Round-trip de serialización XML CFDI**
    - **Validates: Requirements 8.1, 13.12**

- [ ] 34. Implementar adaptador PAC y servicio CFDI
  - Crear interfaz `PacAdapter` en `src/lib/cfdi/pac-adapter.ts` con métodos `timbrar` y `cancelar`
  - Crear `src/lib/cfdi/pac/finkok.ts` como implementación concreta de `PacAdapter`
  - Crear `src/lib/services/cfdi.ts` con flujo completo: build XML → timbrar → persistir en DB → subir a storage → generar PDF
  - Implementar manejo de fallo de timbrado: almacenar XML sin timbrar, registrar error del PAC, estado `error`
  - Implementar validación de RFC contra lista SAT (LCO/LRFC) antes de incluir en CFDI
  - _Requirements: Req 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 34.1 Escribir property test para persistencia de CFDI timbrado (Property 28)
    - **Property 28: Persistencia de CFDI timbrado**
    - **Validates: Requirements 8.4**

  - [ ]* 34.2 Escribir property test para manejo de fallo de timbrado (Property 29)
    - **Property 29: Manejo de fallo de timbrado**
    - **Validates: Requirements 8.5**

  - [ ]* 34.3 Escribir property test para validación de RFC contra lista SAT (Property 30)
    - **Property 30: Validación de RFC contra lista SAT**
    - **Validates: Requirements 8.7**

- [ ] 35. Crear API routes para CFDI
  - Crear `src/app/api/v1/cfdi/generar/route.ts` (POST generar CFDI con idempotency key)
  - Crear `src/app/api/v1/cfdi/[uuid]/cancelar/route.ts` (POST cancelar CFDI)
  - _Requirements: Req 8.3, 8.6, 9.1_

  - [ ]* 35.1 Escribir tests de integración para API de CFDI
    - Verificar generación, timbrado, cancelación, y manejo de errores del PAC
    - _Requirements: Req 8.3, 8.5, 13.4_

### R2 — Req 9: API REST para Integraciones Externas

- [ ] 36. Implementar autenticación por API Key y rate limiting
  - Crear `src/lib/services/apiKeys.ts` con funciones: `createApiKey`, `validateApiKey`, `revokeApiKey`
  - Implementar rate limiting con sliding window counter en tabla `rate_limit_counters` (PostgreSQL): 1000 req/hora por API Key, retornar HTTP 429 con header `Retry-After`
  - _Requirements: Req 9.2, 9.4_

  - [ ]* 36.1 Escribir property test para autenticación requerida en endpoints API (Property 31)
    - **Property 31: Autenticación requerida en endpoints API**
    - **Validates: Requirements 9.2**

  - [ ]* 36.2 Escribir property test para rate limiting por API Key (Property 33)
    - **Property 33: Rate limiting por API Key**
    - **Validates: Requirements 9.4**

- [ ] 37. Implementar servicio de webhooks con retry exponencial
  - Crear `src/lib/services/webhooks.ts` con funciones: `registerWebhookEndpoint`, `enqueueWebhook`
  - Crear `src/lib/inngest/functions/webhooks.ts` con job `webhook/deliver` que reintenta hasta 3 veces con espera exponencial (1, 5, 15 min)
  - _Requirements: Req 9.6, 9.7_

  - [ ]* 37.1 Escribir property test para entrega de webhooks y retry (Property 34)
    - **Property 34: Entrega de webhooks y retry con espera exponencial**
    - **Validates: Requirements 9.6, 9.7**

- [ ] 38. Publicar documentación OpenAPI 3.0
  - Crear `src/lib/openapi/spec.ts` con la especificación OpenAPI 3.0 de todos los endpoints `/api/v1/`
  - Crear `src/app/api/docs/route.ts` que sirve la spec JSON
  - Integrar UI de documentación (Scalar o Swagger UI) en `/api/docs`
  - _Requirements: Req 9.5_

  - [ ]* 38.1 Escribir property test para estructura envelope en respuestas API (Property 32)
    - **Property 32: Estructura envelope en respuestas API**
    - **Validates: Requirements 9.3**

### R2 — Req 10: Dashboard y Reportes

- [ ] 39. Implementar servicio de reportes y métricas
  - Crear `src/lib/services/reportes.ts` con funciones: `getMetricasDashboard` (envíos por estado, vehículos activos, órdenes del día, tasa de entregas), `calcularTiempoPromedioEntrega`, `getRankingConsignatarios` (top 10), `generarReporteEnvios` (filtros: fechas, estado, transportista, remitente, consignatario)
  - Crear `src/lib/utils/reportes.ts` con funciones puras de cálculo
  - _Requirements: Req 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 39.1 Escribir property test para filtrado correcto en reportes (Property 35)
    - **Property 35: Filtrado correcto en reportes**
    - **Validates: Requirements 10.2**

  - [ ]* 39.2 Escribir property test para cálculo de tiempo promedio de entrega (Property 36)
    - **Property 36: Cálculo correcto de tiempo promedio de entrega**
    - **Validates: Requirements 10.3**

  - [ ]* 39.3 Escribir property test para ranking de consignatarios (Property 37)
    - **Property 37: Ranking de consignatarios ordenado correctamente**
    - **Validates: Requirements 10.4**

- [ ] 40. Crear páginas de dashboard y reportes
  - Crear `src/app/(dashboard)/page.tsx` con métricas en tiempo real (total envíos por estado, vehículos activos, órdenes del día, tasa de entregas)
  - Crear `src/app/(dashboard)/reportes/page.tsx` con filtros y exportación CSV/PDF
  - Integrar `MapaFlota` en el dashboard (de tarea 32)
  - _Requirements: Req 10.1, 10.2, 10.5_

### R2 — Req 12: Notificaciones

- [ ] 41. Implementar templates de email con React Email
  - Crear `src/lib/notifications/emails/CambioEstadoEmail.tsx` como componente React Email
  - Crear `src/lib/notifications/emails/AlertaCriticaEmail.tsx` para alertas al admin
  - Crear `src/lib/notifications/emails/ImportacionCompletaEmail.tsx`
  - Crear `src/lib/notifications/email-adapter.ts` con interfaz `EmailAdapter` e implementación Resend
  - _Requirements: Req 12.1, 12.2, 14.4, 15.5_

- [ ] 42. Implementar servicio de notificaciones y jobs Inngest
  - Crear `src/lib/services/notificaciones.ts` con lógica: verificar configuración de eventos habilitados, encolar exactamente una notificación por evento, registrar en tabla `notificaciones`
  - Crear `src/lib/inngest/functions/notificaciones.ts` con jobs: `notificacion/send-email` (Resend, retry 2 veces con 5 min de intervalo), `notificacion/send-sms` (SMS condicional a `en_reparto` o `entregado`)
  - Integrar `enqueueNotificacion` en el servicio de envíos (cambio de estado)
  - _Requirements: Req 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 42.1 Escribir property test para notificación email al cambiar estado (Property 41)
    - **Property 41: Notificación email al cambiar estado de envío**
    - **Validates: Requirements 12.1, 12.2**

  - [ ]* 42.2 Escribir property test para persistencia de registro de notificaciones (Property 42)
    - **Property 42: Persistencia de registro de notificaciones**
    - **Validates: Requirements 12.3**

  - [ ]* 42.3 Escribir property test para retry de notificaciones fallidas (Property 43)
    - **Property 43: Retry de notificaciones fallidas**
    - **Validates: Requirements 12.4**

  - [ ]* 42.4 Escribir property test para SMS condicional (Property 44)
    - **Property 44: SMS condicional al cambiar a en_reparto o entregado**
    - **Validates: Requirements 12.5**

### R2 — Req 13: Testeabilidad y Aseguramiento de Calidad

- [ ] 43. Configurar suite de tests completa
  - Crear `vitest.config.ts` con configuración de cobertura (provider `v8`, include `src/lib/**/*.ts`, thresholds: lines 80%, functions 80%, branches 75%)
  - Crear `vitest.integration.config.ts` para tests de integración con Testcontainers PostgreSQL
  - Crear `playwright.config.ts` para tests E2E
  - Agregar scripts en `package.json`: `test`, `test:unit`, `test:integration`, `test:e2e`, `test:coverage`
  - _Requirements: Req 13.1, 13.3, 13.5, 13.6, 13.10, 13.11_

- [ ] 44. Implementar tests de integración para todas las API routes
  - Crear `src/app/api/v1/envios.integration.test.ts`
  - Crear `src/app/api/v1/ordenes.integration.test.ts`
  - Crear `src/app/api/v1/vehiculos.integration.test.ts`
  - Crear `src/app/api/v1/operadores.integration.test.ts`
  - Crear `src/app/api/v1/remitentes.integration.test.ts`
  - Crear `src/app/api/v1/consignatarios.integration.test.ts`
  - Cada suite: levanta PostgreSQL de test, ejecuta migraciones, resetea schema antes de cada `describe`
  - _Requirements: Req 13.4, 13.5, 13.6, 13.9_

- [ ] 45. Implementar tests E2E con Playwright
  - Crear `e2e/registro-envio.spec.ts`: flujo completo de registro de envío
  - Crear `e2e/cambio-estado.spec.ts`: cambio de estado con historial
  - Crear `e2e/generacion-orden.spec.ts`: crear orden, asignar vehículo
  - Crear `e2e/rastreo-publico.spec.ts`: consulta pública de rastreo por folio
  - Crear `docker-compose.test.yml` para entorno E2E completo
  - _Requirements: Req 13.7, 13.8_

- [ ] 46. Implementar property test para round-trip de respuestas de carriers (Property 45)
  - Crear `src/lib/carriers/carriers.test.ts`
  - **Property 45: Round-trip de respuestas de carriers**
  - **Validates: Requirements 13.12**

- [ ] 47. Implementar property test para round-trip de creación y lectura de entidades (Property 1)
  - Crear tests en `src/lib/repositories/*.test.ts`
  - **Property 1: Round-trip de creación y lectura de entidades**
  - **Validates: Requirements 1.4, 2.1, 3.4, 4.1, 4.3**

- [ ] 48. Checkpoint R2 — Release 2 completo
  - Verificar que `npm test` pasa con cobertura ≥ 80% en `src/lib/`. Verificar que los tests E2E pasan con `docker compose -f docker-compose.test.yml up`. Consultar al usuario antes de iniciar R3.

---

## Release 3 — Could Have (Req 6, 7)

### R3 — Req 6: Optimización de Rutas

- [ ] 49. Implementar servicio de geocodificación
  - Crear interfaz `GeocodingAdapter` en `src/lib/geocoding/adapter.ts`
  - Crear implementación `GoogleMapsAdapter` con fallback a `NominatimAdapter` si Google Maps falla
  - Crear `src/lib/services/geocodificacion.ts` con función `geocodificarDireccion(direccion: Direccion): Promise<Coordenadas>` que retorna error descriptivo con la dirección problemática si falla
  - _Requirements: Req 6.2, 6.5_

  - [ ]* 49.1 Escribir property test para error descriptivo cuando geocodificación falla (Property 23)
    - **Property 23: Error descriptivo cuando geocodificación falla**
    - **Validates: Requirements 6.5**

- [ ] 50. Implementar optimizador de rutas
  - Crear `src/lib/services/rutas.ts` con función `sugerirRuta(paradas: Parada[]): Parada[]` que calcula el orden óptimo de paradas minimizando distancia total (nearest neighbor o similar)
  - La función debe retornar una permutación válida de las paradas de entrada (sin duplicados ni omisiones)
  - Almacenar ruta confirmada en `orden_paradas` con secuencia, distancia estimada, y tiempo estimado
  - _Requirements: Req 6.1, 6.3, 6.4_

  - [ ]* 50.1 Escribir property test para ruta sugerida es permutación válida (Property 21)
    - **Property 21: Ruta sugerida es permutación válida de paradas**
    - **Validates: Requirements 6.1**

  - [ ]* 50.2 Escribir property test para persistencia de ruta confirmada (Property 22)
    - **Property 22: Persistencia de ruta confirmada**
    - **Validates: Requirements 6.4**

- [ ] 51. Integrar optimización de rutas en el flujo de órdenes
  - Al confirmar una orden con múltiples destinos, llamar a `sugerirRuta` y mostrar la ruta sugerida al coordinador
  - Crear UI en `src/app/(dashboard)/ordenes/[id]/ruta/page.tsx` para aceptar, modificar, o rechazar la ruta sugerida
  - _Requirements: Req 6.1, 6.3_

### R3 — Req 7: Integración con Transportistas Locales

- [ ] 52. Implementar capa de abstracción de carriers
  - Crear interfaz `CarrierAdapter` en `src/lib/carriers/adapter.ts` con métodos `getCotizacion`, `generarGuia`, `rastrearGuia`
  - Crear `src/lib/carriers/registry.ts` con `carrierRegistry` (Map de carriers disponibles)
  - Implementar timeout de 10 segundos en todas las llamadas a APIs externas de carriers
  - _Requirements: Req 7.1, 7.5_

  - [ ]* 52.1 Escribir property test para timeout de carrier externo (Property 25)
    - **Property 25: Timeout de carrier externo retorna error sin bloquear**
    - **Validates: Requirements 7.5**

- [ ] 53. Implementar adaptadores de carriers mexicanos
  - Crear `src/lib/carriers/estafeta.ts` implementando `CarrierAdapter`
  - Crear `src/lib/carriers/dhl-mx.ts` implementando `CarrierAdapter`
  - Crear `src/lib/carriers/fedex-mx.ts` implementando `CarrierAdapter`
  - Crear `src/lib/carriers/jt-express.ts` implementando `CarrierAdapter`
  - Almacenar guía generada (número, carrier, costo, fecha) asociada al envío
  - _Requirements: Req 7.2, 7.3, 7.4_

  - [ ]* 53.1 Escribir property test para persistencia de guía externa (Property 24)
    - **Property 24: Persistencia de guía externa**
    - **Validates: Requirements 7.3**

  - [ ]* 53.2 Escribir property test para round-trip de respuestas de carriers (Property 45)
    - **Property 45: Round-trip de respuestas de carriers**
    - **Validates: Requirements 13.12**

- [ ] 54. Crear API routes y UI para carriers
  - Crear `src/app/api/v1/carriers/cotizacion/route.ts` (POST cotizar envío)
  - Crear `src/app/api/v1/carriers/guia/route.ts` (POST generar guía)
  - Integrar cotización y generación de guía en el detalle de envío
  - _Requirements: Req 7.2, 7.3, 7.4_

- [ ] 55. Checkpoint R3 — Release 3 completo
  - Verificar que `npm test` pasa con cobertura ≥ 80%. Confirmar que todos los flujos E2E siguen pasando. Consultar al usuario si hay dudas.

---

## Notes

- Tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints garantizan validación incremental entre releases
- Los property tests usan `fast-check` con mínimo 100 iteraciones por propiedad
- Los tests de integración usan Testcontainers PostgreSQL (puerto 5433) para aislamiento
- El comando `npm test` debe ejecutar unitarios + integración en orden determinista y retornar exit code ≠ 0 ante cualquier fallo

# Implementation Plan: Sistema de Guías

## Overview

Migrar el módulo de "Órdenes" a "Guías" con nuevo esquema de base de datos, API REST, servicio con folio atómico, formulario con creación inline de remitente/consignatario, vista previa de impresión con QR, y botón flotante de acción rápida para coordinadores. Se reutiliza la infraestructura existente (Drizzle ORM, Auth.js, shadcn/ui).

## Tasks

- [x] 1. Database migration and schema updates
  - [x] 1.1 Create SQL migration file to rename `ordenes` → `guias`, restructure columns, create `system_config` table, and drop `orden_paradas`
    - Rename table `ordenes` to `guias`
    - Rename column `numero_orden` to `folio`
    - Drop columns: `distancia_km`, `tiempo_estimado_min`, `fecha_entrega_comprometida`, `vehiculo_id`, `operador_id`, `peso_total_kg`
    - Add columns: `remitente_id` (UUID FK), `consignatario_id` (UUID FK), `peso_kg` (numeric), `piezas` (integer), `tipo_contenido` (text), `numero_cuenta` (text), `recolectado_por` (text), `recibido_por` (text), `comentarios` (text)
    - Update `estado` enum values to `creada`, `en_ruta`, `completada`, `cancelada` with default `creada`
    - Create `system_config` table with seed data (`folio_prefix`=`SA`, `folio_counter`=`0`, `default_copies`=`3`)
    - Drop `orden_paradas` table
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.5, 10.4, 11.3_

  - [x] 1.2 Create Drizzle schema `src/lib/db/schema/guias.ts` replacing `ordenes.ts`
    - Define `guias` table with new columns and estado enum `["creada", "en_ruta", "completada", "cancelada"]`
    - Add foreign key references to `remitentes`, `consignatarios`, and `users`
    - _Requirements: 1.1, 11.3_

  - [x] 1.3 Create Drizzle schema `src/lib/db/schema/systemConfig.ts`
    - Define `system_config` table with `key` (PK), `value`, `updatedAt`
    - _Requirements: 6.5, 10.4_

  - [x] 1.4 Update `src/lib/db/schema/index.ts` to export `guias` and `systemConfig` instead of `ordenes`
    - Remove `export * from "./ordenes"`
    - Add `export * from "./guias"` and `export * from "./systemConfig"`
    - _Requirements: 1.1_

- [x] 2. Zod validation schemas
  - [x] 2.1 Create `src/lib/schemas/guias.ts` with `createGuiaSchema`, `cambiarEstadoGuiaSchema`, and `updateSystemConfigSchema`
    - `createGuiaSchema`: remitenteId (uuid), consignatarioId (uuid), pesoKg (positive number), piezas (int ≥ 1), tipoContenido (optional), numeroCuenta (optional), recolectadoPor (optional), comentarios (optional)
    - `cambiarEstadoGuiaSchema`: estado enum `["en_ruta", "completada", "cancelada"]`
    - `updateSystemConfigSchema`: folio_prefix (string 1-10, optional), default_copies (int 1-10, optional)
    - _Requirements: 6.1, 10.5, 11.1_


- [x] 3. Repository layer
  - [x] 3.1 Create `src/lib/repositories/systemConfig.ts`
    - Implement `getConfigValue(key)`: SELECT value from system_config by key
    - Implement `setConfigValue(key, value)`: UPDATE value in system_config by key
    - Implement `incrementAndGetCounter(key)`: Atomic `UPDATE ... SET value = (value::int + 1)::text ... RETURNING value` for folio_counter
    - _Requirements: 6.1, 6.3, 6.5, 6.6_

  - [x] 3.2 Create `src/lib/repositories/guias.ts` replacing `ordenes.ts`
    - Implement `createGuia(data)`: INSERT into guias with returning
    - Implement `getGuiaById(id)`: SELECT guia with joined remitente and consignatario data
    - Implement `listGuias(filters?)`: SELECT guias ordered by createdAt desc, with optional estado filter and pagination
    - Implement `updateGuiaEstado(id, estado)`: UPDATE estado with updatedAt
    - _Requirements: 1.3, 11.1_

- [x] 4. Service layer
  - [x] 4.1 Create `src/lib/services/systemConfig.ts`
    - Implement `getConfig()`: Returns folio_prefix and default_copies from system_config
    - Implement `updateConfig(input)`: Updates folio_prefix and/or default_copies, validates with Zod schema
    - Implement `getNextFolio()`: Atomic folio generation — get prefix, increment counter, format as `{prefix}-{NNNNN}`
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 10.4_

  - [x] 4.2 Create `src/lib/services/guias.ts` replacing `ordenes.ts`
    - Implement `createGuia(input)`: Validate input, generate folio via SystemConfigService, insert guia with estado "creada", log audit event
    - Implement `getGuiaById(id)`: Fetch guia with relations, return ServiceResult
    - Implement `listGuias(filters?)`: Fetch guias list, return ServiceResult
    - Implement `cambiarEstadoGuia(id, estado, changedBy)`: Validate guia exists, update estado, log audit event
    - Use existing `ServiceResult<T>` pattern from ordenes service
    - _Requirements: 2.1, 2.2, 6.1, 6.3, 11.1_

  - [ ]* 4.3 Write property tests for folio generation (Properties 2, 3)
    - **Property 2: Folio format is always valid** — For any valid prefix (1-10 chars) and positive integer counter, the generated folio matches `{prefix}-{NNNNN}` with exactly 5 zero-padded digits
    - **Property 3: Folio generation produces unique, sequential values** — For any sequence of N calls (N ≥ 2), all folios are distinct and numeric portions form a strictly increasing sequence
    - **Validates: Requirements 6.1, 6.3, 6.6**

  - [ ]* 4.4 Write property test for role restriction (Property 1)
    - **Property 1: Non-coordinador roles are rejected** — For any user role not "coordinador", attempting to create a guía returns 403 with "NO_AUTORIZADO"
    - **Validates: Requirements 2.2**

  - [ ]* 4.5 Write property test for initial estado (Property 7)
    - **Property 7: Created guía always has estado "creada"** — For any valid CreateGuiaInput, the resulting guía has `estado === "creada"`
    - **Validates: Requirements 11.1**

  - [ ]* 4.6 Write property test for copies validation (Property 6)
    - **Property 6: Copies validation accepts only integers 1-10** — For any integer, validation accepts iff value is between 1 and 10 inclusive
    - **Validates: Requirements 10.5**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 6. API routes
  - [x] 6.1 Create `src/app/api/v1/guias/route.ts` with GET and POST handlers
    - GET: `requireSession`, list guias with optional query params (page, limit, estado)
    - POST: `requireRole(["coordinador"])`, validate body with `createGuiaSchema`, call `guiasService.createGuia`, return 201
    - Follow existing error response format `{ data, errors }` from ordenes route
    - _Requirements: 1.3, 2.1, 2.2, 6.1, 11.1_

  - [x] 6.2 Create `src/app/api/v1/guias/[id]/route.ts` with GET handler
    - GET: `requireSession`, fetch guia by id with remitente and consignatario relations
    - _Requirements: 1.3_

  - [x] 6.3 Create `src/app/api/v1/guias/[id]/estado/route.ts` with PATCH handler
    - PATCH: `requireRole(["coordinador"])`, validate body with `cambiarEstadoGuiaSchema`, call `guiasService.cambiarEstadoGuia`
    - _Requirements: 1.3_

  - [x] 6.4 Create `src/app/api/v1/system-config/route.ts` with GET and PATCH handlers
    - GET: `requireRole(["administrador"])`, return system config values
    - PATCH: `requireRole(["administrador"])`, validate with `updateSystemConfigSchema`, update config
    - _Requirements: 6.4, 6.5, 10.3, 10.4_

- [x] 7. UI Components - QuickActionButton and GuiaFormDialog
  - [x] 7.1 Install dependencies: `qrcode` and `@types/qrcode`
    - Run `npm install qrcode @types/qrcode`
    - _Requirements: 9.1_

  - [x] 7.2 Create `src/components/quick-action-button.tsx`
    - Fixed position button (bottom-right) with `+` icon
    - Only render when `session.user.role === "coordinador"`
    - Accept optional `defaultRemitenteId` prop
    - On click, open GuiaFormDialog
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 7.3 Create `src/components/inline-create-dialog.tsx`
    - Reusable sub-dialog for creating remitente or consignatario inline
    - Fields: nombre, rfc, calle, numExt, numInt, colonia, municipio, estado, cp, telefono, email
    - On success: close dialog, return new entity id for auto-selection
    - On validation error: show errors, keep form open
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 5.2, 5.3, 5.4, 5.5_

  - [x] 7.4 Create `src/components/guia-form-dialog.tsx`
    - Dialog modal with guía creation form using shadcn/ui Dialog
    - Fields: remitente (SearchableSelect with inline create), consignatario (SearchableSelect with inline create), pesoKg, piezas, tipoContenido, numeroCuenta, comentarios
    - Folio shown as read-only badge (generated on save)
    - "Guardar" and "Guardar e Imprimir" buttons
    - Accept `defaultRemitenteId` prop for pre-fill
    - On success: close dialog, optionally open print preview
    - _Requirements: 2.1, 4.1, 4.4, 5.1, 5.4, 6.2, 7.1, 7.2, 7.3_

- [x] 8. UI Components - Print Preview and Layout
  - [x] 8.1 Create `src/components/guia-print-layout.tsx`
    - Pure layout component for SALTER "Mensajería y Paquetería" format
    - Sections: logo, origen, No. De Cuenta, Peso, Piezas, Folio, QR code, Remitente data, Consignatario data, Fecha, Recolectado por, Recibido
    - Accept guía data with relations as props
    - Generate QR code client-side using `qrcode` library with folio as content
    - _Requirements: 8.2, 8.3, 9.1, 9.2, 9.3_

  - [x] 8.2 Create `src/components/guia-print-preview.tsx`
    - Print preview wrapper with copies selector (pre-filled from system_config `default_copies`)
    - Validate copies: positive integer between 1 and 10
    - "Imprimir" button that invokes `window.print()` with `@media print` CSS
    - Render N copies of GuiaPrintLayout based on copies count
    - _Requirements: 8.1, 10.1, 10.2, 10.5_

  - [ ]* 8.3 Write property test for print layout fields (Property 4)
    - **Property 4: Print layout contains all required fields** — For any valid guía with remitente and consignatario, the rendered layout contains folio, peso, piezas, remitente fields, consignatario fields, and fecha
    - **Validates: Requirements 8.2**

  - [ ]* 8.4 Write property test for QR round-trip (Property 5)
    - **Property 5: QR code round-trip preserves folio** — For any valid folio string, encoding as QR and decoding returns the original folio
    - **Validates: Requirements 9.1, 9.2**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 10. Guías pages and navigation updates
  - [x] 10.1 Create `src/app/(dashboard)/guias/page.tsx` — Guías list page
    - Replace ordenes list page with guías list
    - Display table with columns: Folio, Estado (badge), Peso (kg), Piezas, Fecha
    - Estado badges for `creada`, `en_ruta`, `completada`, `cancelada`
    - Link each row to `/guias/[id]`
    - Add "Nueva Guía" button that opens GuiaFormDialog (visible only for coordinadores)
    - Fetch data from `/api/v1/guias`
    - _Requirements: 1.1, 1.2, 11.2_

  - [x] 10.2 Create `src/app/(dashboard)/guias/[id]/page.tsx` — Guía detail page
    - Display guía details with remitente and consignatario expanded data
    - Show estado badge and folio prominently
    - Include "Imprimir" button that opens GuiaPrintPreview
    - Include estado change actions for coordinadores (en_ruta, completada, cancelada)
    - Fetch data from `/api/v1/guias/[id]`
    - _Requirements: 1.2, 8.1, 11.2_

  - [x] 10.3 Update `src/components/sidebar.tsx` — Replace "Órdenes" nav item with "Guías"
    - Change href from `/ordenes` to `/guias`
    - Change label from "Órdenes" to "Guías"
    - Change key from `ordenes` to `guias`
    - _Requirements: 1.1_

  - [x] 10.4 Update `src/app/(dashboard)/layout.tsx` — Add QuickActionButton
    - Import and render QuickActionButton component
    - Pass session role for conditional rendering
    - _Requirements: 3.1_

- [x] 11. Cleanup old ordenes files
  - [x] 11.1 Remove old ordenes files that are no longer needed
    - Delete `src/lib/db/schema/ordenes.ts`
    - Delete `src/lib/repositories/ordenes.ts`
    - Delete `src/lib/services/ordenes.ts`
    - Delete `src/lib/schemas/ordenes.ts`
    - Delete `src/app/api/v1/ordenes/` directory (route.ts, [id]/estado/route.ts)
    - Delete `src/app/(dashboard)/ordenes/` directory (page.tsx, nueva/page.tsx, [id]/page.tsx)
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses TypeScript throughout (Next.js 15 App Router + Drizzle ORM)

---
version: 1.2.0
date: 2026-04-03
changelog:
  - "v1.2.0 (2026-04-03): Updated Req 1 with real guías fields, user management UI, searchable remitente/consignatario"
  - "v1.1.0 (2026-04-03): Added stack technology decisions, Drizzle ORM, modern tech stack, MoSCoW prioritization"
  - "v1.0.0 (initial): First draft shared with client — 13 requirements covering core logistics platform"
---

# Requirements Document

> **Version:** 1.2.0 | **Date:** 2026-04-03
>
> **Changelog:**
> - `v1.2.0` (2026-04-03): Updated Req 1 with fields from real guías analysis (piezas, embalaje, ruta, numeroCuenta, guiaExterna, codigoRastreo, facturado, recolectadoPor, recibidoPor, fechas), added searchable remitente/consignatario selection, added user management UI with nickname-based email and auto-generated passwords
> - `v1.1.0` (2026-04-03): Modern tech stack (MapLibre, Inngest, Resend, Zod, Pino, Drizzle ORM), offline resilience, idempotency keys, Req 14 (Audit Log), Req 15 (Importación Masiva), MoSCoW prioritization
> - `v1.0.0` (initial): First draft shared with client — 13 requirements covering core logistics platform

## Introduction

Plataforma logística integral para operaciones de cadena de suministro en México. La plataforma expande la funcionalidad básica de registro de envíos existente hacia un sistema operativo logístico completo, similar a Fleetbase, adaptado al mercado mexicano. Incluye gestión de flota, gestión de órdenes, optimización de rutas, rastreo en tiempo real, cumplimiento fiscal SAT/CFDI, y soporte para transportistas locales.

### Stack Tecnológico

- **Framework**: Next.js 15 con App Router. El frontend y el backend coexisten en el mismo proyecto; las rutas de API se exponen bajo `/api/`.
- **Lenguaje**: TypeScript en todo el proyecto (frontend, API routes, utilidades, y tests).
- **Base de datos**: PostgreSQL gestionada a través de Neon (serverless Postgres). Sin dependencia de servicios propietarios adicionales.
- **Contenedores**: Docker + Docker Compose para desarrollo local y despliegue. La Plataforma debe poder levantarse completamente con `docker compose up` sin configuración manual adicional.
- **Estructura**: Monorepo único, unidad de despliegue única. Sin microservicios ni repositorios separados.

### Principios de Diseño

Este proyecto es mantenido por un desarrollador individual con perfil de ingeniería de software y QA. Los tres pilares no negociables son:

1. **Mantenibilidad**: El código debe ser legible, predecible, y fácil de modificar sin efectos secundarios inesperados. Se prefiere claridad sobre cleverness.
2. **Portabilidad**: Sin vendor lock-in. La Plataforma debe poder migrar de proveedor de base de datos, hosting, o servicios de terceros con cambios mínimos y localizados.
3. **Testeabilidad**: Cada capa del sistema debe ser testeable de forma aislada. La cobertura de tests es un requisito funcional, no opcional.

## Release Planning (MoSCoW)

### Must Have — Release 1 (MVP)
Core platform functionality required for launch. The platform cannot go live without these.

| # | Requirement |
|---|-------------|
| 1 | Gestión de Envíos |
| 2 | Gestión de Remitentes y Consignatarios |
| 3 | Gestión de Órdenes de Transporte |
| 4 | Gestión de Flota |
| 11 | Autenticación y Control de Acceso |
| 14 | Audit Log y Monitoreo de Plataforma |
| 15 | Importación Masiva de Datos |

### Should Have — Release 2
Important features that add significant value. Platform launches without them but they should follow shortly after.

| # | Requirement |
|---|-------------|
| 5 | Rastreo en Tiempo Real |
| 8 | Cumplimiento Fiscal SAT/CFDI con Carta Porte |
| 9 | API REST para Integraciones Externas |
| 10 | Dashboard y Reportes |
| 12 | Notificaciones |
| 13 | Testeabilidad y Aseguramiento de Calidad |

### Could Have — Release 3
Valuable enhancements. Prioritized based on client feedback after Release 1.

| # | Requirement |
|---|-------------|
| 6 | Optimización de Rutas |
| 7 | Integración con Transportistas Locales |

## Glossary

- **Plataforma**: El sistema de gestión logística (salter-mx) construido en Next.js 15.
- **Envío**: Un paquete o carga registrada para transporte, identificada por un folio único.
- **Orden**: Solicitud de transporte que agrupa uno o más envíos con origen, destino, y condiciones de entrega.
- **Remitente**: Persona o empresa que origina el envío.
- **Consignatario**: Persona o empresa que recibe el envío.
- **Operador**: Conductor o responsable del vehículo asignado a una ruta.
- **Vehículo**: Unidad de transporte registrada en la flota.
- **Ruta**: Trayecto planificado con paradas ordenadas asignado a un vehículo y operador.
- **Rastreo**: Seguimiento de la posición y estado de un envío u orden en tiempo real.
- **CFDI**: Comprobante Fiscal Digital por Internet, factura electrónica requerida por el SAT de México.
- **SAT**: Servicio de Administración Tributaria, autoridad fiscal de México.
- **Carta_Porte**: Complemento del CFDI requerido para el transporte de mercancías en México.
- **RFC**: Registro Federal de Contribuyentes, identificador fiscal mexicano.
- **Transportista**: Empresa o persona física que presta el servicio de transporte (ej. Estafeta, DHL México, FedEx México, J&T Express).
- **API**: Interfaz de programación de aplicaciones expuesta por la Plataforma bajo `/api/` mediante Next.js API Routes.
- **Webhook**: Notificación HTTP enviada por la Plataforma a sistemas externos ante eventos específicos.
- **Dashboard**: Panel de control principal con métricas y accesos rápidos.
- **Geocodificación**: Proceso de convertir una dirección textual en coordenadas geográficas.
- **CP**: Código Postal mexicano de 5 dígitos.
- **App_Router**: Sistema de enrutamiento de Next.js 15 basado en el directorio `app/`, utilizado tanto para páginas como para API routes.
- **Neon**: Proveedor de PostgreSQL serverless utilizado como base de datos. La Plataforma accede a Neon mediante `@neondatabase/serverless` como driver HTTP y `drizzle-orm/neon-http` como adaptador Drizzle. El cliente se inicializa en `src/lib/db/index.ts` con `drizzle(neon(DATABASE_URL), { schema })`.
- **Docker_Compose**: Herramienta de orquestación de contenedores utilizada para levantar el entorno completo de desarrollo y producción.

---

## Requirements

### Requirement 1: Gestión de Envíos

**Prioridad: Must Have**

**User Story:** Como operador logístico, quiero registrar y gestionar envíos con toda la información necesaria, para que pueda dar seguimiento completo al ciclo de vida de cada paquete.

#### Acceptance Criteria

1. WHEN un usuario envía el formulario de registro de envío con folio, peso, remitente, consignatario y dirección de entrega válidos, THE Plataforma SHALL crear el envío en la base de datos y retornar el registro creado con su identificador único.
2. THE Plataforma SHALL asignar a cada envío un estado del ciclo de vida: `pendiente`, `recolectado`, `en_tránsito`, `en_reparto`, `entregado`, `no_entregado`, o `cancelado`.
3. WHEN el estado de un envío cambia, THE Plataforma SHALL registrar la transición con marca de tiempo y usuario responsable del cambio.
4. THE Plataforma SHALL almacenar para cada envío: folio, peso en kilogramos, dimensiones (largo, ancho, alto en cm), tipo de contenido, valor declarado en pesos mexicanos (MXN), número de piezas, tipo de embalaje (caja, sobre, paquete, bolsa, tarima, otro), ruta destino, número de cuenta del cliente, número de guía externa, código de rastreo externo, indicador de facturado, y comentarios opcionales.
5. IF el folio de un envío ya existe en la base de datos, THEN THE Plataforma SHALL rechazar el registro y retornar un mensaje de error indicando duplicado.
6. THE Plataforma SHALL permitir adjuntar hasta 5 imágenes por envío en formatos JPG o PNG con tamaño máximo de 5 MB cada una.
7. WHEN un usuario consulta la lista de envíos, THE Plataforma SHALL retornar los resultados paginados con un máximo de 50 registros por página, ordenados por fecha de creación descendente.
8. THE Plataforma SHALL registrar para cada envío: quién recolectó el paquete, fecha/hora de recolección, quién lo recibió en destino, y fecha/hora de recepción.
9. THE Plataforma SHALL permitir buscar y seleccionar remitentes y consignatarios existentes mediante un campo de búsqueda al crear un envío, en lugar de requerir identificadores manuales.

---

### Requirement 2: Gestión de Remitentes y Consignatarios

**Prioridad: Must Have**

**User Story:** Como operador logístico, quiero mantener un catálogo de remitentes y consignatarios con datos fiscales y de contacto completos, para que pueda reutilizar esta información en múltiples envíos y cumplir con los requisitos del SAT.

#### Acceptance Criteria

1. THE Plataforma SHALL almacenar para cada remitente y consignatario: nombre o razón social, RFC, dirección completa (calle, número exterior, número interior opcional, colonia, municipio, estado, CP, país), teléfono, y correo electrónico.
2. THE Plataforma SHALL validar que el RFC tenga el formato correcto: 12 caracteres para personas morales (letras y dígitos) o 13 caracteres para personas físicas, conforme al patrón del SAT.
3. THE Plataforma SHALL validar que el CP tenga exactamente 5 dígitos numéricos.
4. WHEN un usuario busca un remitente o consignatario por nombre, RFC, o CP, THE Plataforma SHALL retornar los resultados coincidentes en menos de 500 ms.
5. IF un remitente o consignatario tiene envíos activos asociados, THEN THE Plataforma SHALL impedir su eliminación y retornar un mensaje indicando los envíos dependientes.

---

### Requirement 3: Gestión de Órdenes de Transporte

**Prioridad: Must Have**

**User Story:** Como coordinador de logística, quiero crear y gestionar órdenes de transporte que agrupen múltiples envíos, para que pueda planificar rutas eficientes y dar seguimiento consolidado a las entregas.

#### Acceptance Criteria

1. THE Plataforma SHALL permitir crear una orden de transporte asociando uno o más envíos existentes en estado `pendiente`.
2. THE Plataforma SHALL asignar a cada orden un número de orden único con formato `ORD-{AÑO}{MES}-{SECUENCIAL}` (ej. `ORD-202501-00042`).
3. WHEN una orden es creada, THE Plataforma SHALL calcular el peso total sumando el peso de todos los envíos asociados.
4. THE Plataforma SHALL almacenar para cada orden: número de orden, fecha de creación, fecha de entrega comprometida, vehículo asignado, operador asignado, y estado de la orden.
5. THE Plataforma SHALL asignar a cada orden un estado: `borrador`, `confirmada`, `en_ruta`, `completada`, o `cancelada`.
6. WHEN una orden cambia a estado `completada`, THE Plataforma SHALL actualizar automáticamente el estado de todos sus envíos asociados a `entregado`.
7. IF se intenta agregar un envío que ya pertenece a otra orden activa, THEN THE Plataforma SHALL rechazar la operación y retornar un mensaje de error indicando la orden conflictiva.

---

### Requirement 4: Gestión de Flota

**Prioridad: Must Have**

**User Story:** Como administrador de flota, quiero registrar y gestionar los vehículos y operadores de la empresa, para que pueda asignarlos a rutas y mantener control sobre la capacidad disponible.

#### Acceptance Criteria

1. THE Plataforma SHALL almacenar para cada vehículo: placa (formato mexicano), número económico, tipo (camioneta, camión 3.5t, camión 10t, tráiler), capacidad de carga en kilogramos, capacidad volumétrica en m³, año del modelo, y estado operativo.
2. THE Plataforma SHALL asignar a cada vehículo un estado: `disponible`, `en_ruta`, `en_mantenimiento`, o `inactivo`.
3. THE Plataforma SHALL almacenar para cada operador: nombre completo, CURP, licencia federal de conducir con número y fecha de vencimiento, teléfono celular, y estado activo/inactivo.
4. WHEN se asigna un vehículo a una orden, THE Plataforma SHALL verificar que el vehículo esté en estado `disponible` y que la capacidad de carga sea mayor o igual al peso total de la orden.
5. IF la licencia de un operador vence en los próximos 30 días, THEN THE Plataforma SHALL mostrar una alerta en el Dashboard indicando el nombre del operador y la fecha de vencimiento.
6. WHEN un vehículo es asignado a una orden confirmada, THE Plataforma SHALL cambiar su estado a `en_ruta` automáticamente.

---

### Requirement 5: Rastreo en Tiempo Real

**Prioridad: Should Have**

**User Story:** Como cliente o coordinador logístico, quiero rastrear la ubicación y estado de mis envíos en tiempo real, para que pueda anticipar tiempos de entrega y comunicar actualizaciones a los destinatarios.

#### Acceptance Criteria

1. THE Plataforma SHALL exponer un endpoint público de rastreo que acepte el folio del envío y retorne el estado actual, historial de estados, y última ubicación registrada.
2. WHEN un operador actualiza la ubicación desde la aplicación, THE Plataforma SHALL almacenar las coordenadas GPS (latitud, longitud), marca de tiempo, y velocidad en km/h.
3. THE Plataforma SHALL retener el historial completo de ubicaciones de cada envío durante al menos 90 días.
4. WHEN el estado de un envío cambia a `entregado` o `no_entregado`, THE Plataforma SHALL registrar las coordenadas GPS del evento de entrega.
5. THE Plataforma SHALL mostrar en el Dashboard un mapa con la última posición conocida de todos los vehículos en estado `en_ruta`.
6. IF no se recibe actualización de ubicación de un vehículo en estado `en_ruta` por más de 60 minutos, THEN THE Plataforma SHALL mostrar una alerta en el Dashboard indicando el vehículo y el tiempo transcurrido sin señal.

---

### Requirement 6: Optimización de Rutas

**Prioridad: Could Have**

**User Story:** Como coordinador logístico, quiero que el sistema sugiera rutas optimizadas para las órdenes de entrega, para que pueda reducir tiempos y costos de operación.

#### Acceptance Criteria

1. WHEN una orden es confirmada con múltiples destinos, THE Plataforma SHALL calcular y sugerir un orden de paradas optimizado minimizando la distancia total recorrida.
2. THE Plataforma SHALL utilizar las coordenadas geográficas obtenidas mediante Geocodificación de las direcciones de entrega para el cálculo de rutas.
3. THE Plataforma SHALL permitir al coordinador aceptar, modificar, o rechazar la ruta sugerida antes de confirmarla.
4. THE Plataforma SHALL almacenar la ruta confirmada con el orden de paradas, distancia estimada en km, y tiempo estimado en minutos.
5. IF la Geocodificación de una dirección falla, THEN THE Plataforma SHALL notificar al coordinador indicando la dirección problemática y permitir la captura manual de coordenadas.

---

### Requirement 7: Integración con Transportistas Locales

**Prioridad: Could Have**

**User Story:** Como operador logístico, quiero integrar la plataforma con transportistas mexicanos como Estafeta, DHL México, FedEx México, y J&T Express, para que pueda generar guías, consultar tarifas, y rastrear envíos externos desde un solo sistema.

#### Acceptance Criteria

1. THE Plataforma SHALL proveer una capa de abstracción de transportistas que permita agregar nuevos transportistas sin modificar la lógica de negocio central.
2. WHEN un usuario solicita una cotización de envío, THE Plataforma SHALL consultar las tarifas del transportista seleccionado y retornar el costo en MXN con el tiempo de entrega estimado.
3. WHEN se genera una guía con un transportista externo, THE Plataforma SHALL almacenar el número de guía, transportista, costo, y fecha de generación asociados al envío.
4. THE Plataforma SHALL permitir rastrear el estado de envíos con guías externas consultando la API del transportista correspondiente y sincronizando el estado en la Plataforma.
5. IF la API de un transportista externo no responde en 10 segundos, THEN THE Plataforma SHALL retornar un error descriptivo al usuario sin bloquear otras operaciones de la Plataforma.

---

### Requirement 8: Cumplimiento Fiscal SAT/CFDI con Carta Porte

**Prioridad: Should Have**

**User Story:** Como administrador de la empresa, quiero generar CFDIs con complemento Carta Porte para los servicios de transporte, para que pueda cumplir con las obligaciones fiscales del SAT y evitar sanciones.

#### Acceptance Criteria

1. THE Plataforma SHALL generar el XML del CFDI con complemento Carta Porte 3.1 conforme al esquema publicado por el SAT para cada orden de transporte completada.
2. THE Plataforma SHALL incluir en el Carta Porte los datos del transportista (RFC, nombre, número de permiso SCT), vehículo (placa, año, configuración vehicular), operador (nombre, RFC o CURP, licencia), y mercancías transportadas con clave de producto SAT.
3. WHEN se genera un CFDI, THE Plataforma SHALL timbrar el documento a través del PAC (Proveedor Autorizado de Certificación) configurado y almacenar el UUID fiscal, sello digital, y fecha de timbrado.
4. THE Plataforma SHALL almacenar el XML timbrado y generar la representación impresa (PDF) del CFDI en formato estándar del SAT.
5. IF el timbrado del CFDI falla, THEN THE Plataforma SHALL almacenar el XML sin timbrar, registrar el error retornado por el PAC, y notificar al administrador para reintento manual.
6. THE Plataforma SHALL permitir cancelar un CFDI timbrado enviando la solicitud de cancelación al PAC con el motivo de cancelación conforme al catálogo del SAT.
7. THE Plataforma SHALL validar que todos los RFC capturados existan en el listado del SAT (LCO/LRFC) antes de incluirlos en un CFDI.

---

### Requirement 9: API REST para Integraciones Externas

**Prioridad: Should Have**

**User Story:** Como desarrollador de integraciones, quiero consumir una API REST documentada de la plataforma, para que pueda conectar sistemas externos como ERP, WMS, o tiendas en línea con la plataforma logística.

#### Acceptance Criteria

1. THE Plataforma SHALL exponer endpoints REST bajo el prefijo `/api/v1/` mediante Next.js API Routes (App_Router) para las entidades: envíos, órdenes, vehículos, operadores, remitentes, y consignatarios.
2. THE Plataforma SHALL requerir autenticación mediante API Key en el header `X-API-Key` para todos los endpoints de la API.
3. THE Plataforma SHALL retornar respuestas en formato JSON con estructura consistente: `{ data, meta, errors }`.
4. THE Plataforma SHALL implementar rate limiting de 1000 peticiones por hora por API Key y retornar HTTP 429 con el header `Retry-After` cuando se exceda el límite.
5. THE Plataforma SHALL publicar documentación OpenAPI 3.0 accesible en `/api/docs`.
6. WHEN ocurre un evento de negocio (cambio de estado de envío, entrega completada, etc.), THE Plataforma SHALL enviar un Webhook a las URLs configuradas por el cliente con el payload del evento en formato JSON.
7. IF un Webhook falla, THEN THE Plataforma SHALL reintentar la entrega hasta 3 veces con espera exponencial de 1, 5, y 15 minutos entre intentos.

---

### Requirement 10: Dashboard y Reportes

**Prioridad: Should Have**

**User Story:** Como gerente de operaciones, quiero visualizar métricas clave y generar reportes de la operación logística, para que pueda tomar decisiones informadas y monitorear el desempeño del servicio.

#### Acceptance Criteria

1. THE Dashboard SHALL mostrar en tiempo real: total de envíos por estado, número de vehículos activos, órdenes del día, y tasa de entregas exitosas del mes en curso.
2. THE Plataforma SHALL generar un reporte de envíos exportable en formato CSV y PDF, filtrable por rango de fechas, estado, transportista, remitente, y consignatario.
3. THE Plataforma SHALL calcular y mostrar el tiempo promedio de entrega en días para un rango de fechas seleccionado.
4. THE Plataforma SHALL mostrar un ranking de los 10 consignatarios con mayor volumen de envíos en el período seleccionado.
5. WHEN un reporte es generado, THE Plataforma SHALL completar la generación en menos de 30 segundos para rangos de hasta 12 meses de datos.

---

### Requirement 11: Autenticación y Control de Acceso

**Prioridad: Must Have**

**User Story:** Como administrador del sistema, quiero gestionar usuarios con roles y permisos diferenciados, para que cada persona acceda únicamente a las funciones que le corresponden.

#### Acceptance Criteria

1. THE Plataforma SHALL soportar los roles: `administrador`, `coordinador`, `operador`, y `cliente`, cada uno con permisos diferenciados sobre las entidades del sistema.
2. THE Plataforma SHALL requerir autenticación con correo electrónico y contraseña para acceder a cualquier sección del sistema.
3. THE Plataforma SHALL almacenar contraseñas usando un algoritmo de hash seguro (bcrypt con factor de costo mínimo 12).
4. WHEN un usuario falla la autenticación 5 veces consecutivas, THE Plataforma SHALL bloquear la cuenta por 15 minutos y notificar al administrador.
5. THE Plataforma SHALL emitir tokens de sesión con expiración de 8 horas y requerir re-autenticación al expirar.
6. IF un usuario con rol `operador` o `cliente` intenta acceder a una función restringida, THEN THE Plataforma SHALL retornar HTTP 403 y registrar el intento de acceso no autorizado.

---

### Requirement 12: Notificaciones

**Prioridad: Should Have**

**User Story:** Como cliente o coordinador, quiero recibir notificaciones automáticas sobre el estado de mis envíos, para que pueda estar informado sin necesidad de consultar manualmente la plataforma.

#### Acceptance Criteria

1. WHEN el estado de un envío cambia, THE Plataforma SHALL enviar una notificación por correo electrónico al consignatario con el nuevo estado, folio, y enlace de rastreo.
2. THE Plataforma SHALL permitir al administrador configurar qué eventos de estado disparan notificaciones por correo.
3. THE Plataforma SHALL registrar cada notificación enviada con marca de tiempo, destinatario, tipo de evento, y estado de entrega (enviado/fallido).
4. IF el envío de una notificación por correo falla, THEN THE Plataforma SHALL reintentar el envío hasta 2 veces con un intervalo de 5 minutos y registrar el fallo definitivo si persiste.
5. WHERE el consignatario tiene número de teléfono celular registrado, THE Plataforma SHALL enviar adicionalmente una notificación por SMS al cambiar el estado a `en_reparto` o `entregado`.

---

### Requirement 13: Testeabilidad y Aseguramiento de Calidad

**Prioridad: Should Have**

**User Story:** Como desarrollador con perfil QA, quiero que la plataforma esté diseñada y estructurada para ser completamente testeable en todas sus capas, para que pueda detectar regresiones temprano, mantener confianza en los cambios, y operar el sistema en solitario sin sacrificar calidad.

#### Acceptance Criteria

1. THE Plataforma SHALL organizar la lógica de negocio en funciones puras o módulos desacoplados de Next.js, de forma que puedan ejecutarse en tests unitarios sin levantar un servidor HTTP.
2. THE Plataforma SHALL proveer tests unitarios para toda función de transformación de datos, validación de reglas de negocio, y cálculo (ej. peso total de orden, formato de número de orden, validación de RFC).
3. WHEN se ejecuta la suite de tests unitarios, THE Plataforma SHALL completar la ejecución en menos de 30 segundos en un entorno de CI estándar.
4. THE Plataforma SHALL proveer tests de integración para cada API Route bajo `/api/`, verificando contratos de request/response, códigos HTTP, y manejo de errores.
5. THE Plataforma SHALL utilizar una base de datos PostgreSQL de test aislada (instancia separada o schema separado) para los tests de integración, de forma que no afecten datos de desarrollo o producción.
6. WHEN se ejecutan los tests de integración contra la base de datos de test, THE Plataforma SHALL restablecer el estado inicial de la base de datos antes de cada suite de tests.
7. THE Plataforma SHALL proveer tests end-to-end (E2E) que cubran los flujos críticos del usuario: registro de envío, cambio de estado, generación de orden, y consulta de rastreo público.
8. THE Plataforma SHALL poder levantar el entorno completo de tests E2E mediante Docker Compose sin dependencias externas manuales.
9. IF una migración de base de datos es aplicada, THEN THE Plataforma SHALL ejecutar los tests de integración automáticamente para verificar que el esquema actualizado no rompe los contratos existentes.
10. THE Plataforma SHALL mantener una cobertura mínima de 80% en líneas de código para los módulos de lógica de negocio, medida por la herramienta de cobertura configurada en el proyecto.
11. THE Plataforma SHALL exponer un comando único (`npm test`) que ejecute la suite completa de tests unitarios e integración en orden determinista y retorne código de salida distinto de cero ante cualquier fallo.
12. WHERE se implementa un parser o serializador (ej. generación de XML para CFDI, parsing de respuestas de transportistas), THE Plataforma SHALL incluir un test de round-trip que verifique que `parse(serialize(x))` produce un resultado equivalente a `x`.

---

### Requirement 14: Audit Log y Monitoreo de Plataforma

**Prioridad: Must Have**

**User Story:** Como administrador del sistema, quiero tener un registro completo de todas las transacciones importantes y errores de la plataforma, para que pueda auditar operaciones, diagnosticar problemas, y ser notificado ante fallos críticos sin necesidad de revisar logs manualmente.

#### Acceptance Criteria

1. THE Plataforma SHALL registrar en un audit log estructurado (JSON) todos los eventos de negocio principales: creación y cambio de estado de envíos, creación y cambio de estado de órdenes, generación y cancelación de CFDIs, autenticación de usuarios, y operaciones de API Key.
2. WHEN ocurre un error no controlado o una excepción crítica, THE Plataforma SHALL registrar el error con: timestamp, nivel de severidad, mensaje, stack trace, contexto de la operación (usuario, entidad afectada), y un identificador único de correlación.
3. THE Plataforma SHALL clasificar los eventos en niveles: `info` (operaciones normales), `warn` (situaciones anómalas recuperables), `error` (fallos de operación), y `critical` (fallos que requieren intervención inmediata).
4. WHEN un evento de nivel `critical` ocurre (ej. PAC no disponible por más de 3 intentos, fallo de base de datos, carrier principal caído), THE Plataforma SHALL enviar una notificación inmediata al administrador por correo electrónico con el detalle del error y el identificador de correlación.
5. THE Plataforma SHALL exponer una interfaz en el Dashboard para que el administrador pueda consultar el audit log filtrado por nivel, fecha, tipo de evento, y usuario, con paginación.
6. THE Plataforma SHALL retener los registros del audit log durante al menos 12 meses.
7. IF el mismo error crítico se repite más de 5 veces en un período de 10 minutos, THEN THE Plataforma SHALL enviar una sola notificación agrupada al administrador (no una por cada ocurrencia) para evitar spam de alertas.
8. THE Plataforma SHALL asignar un `correlationId` único a cada request HTTP entrante y propagarlo a todos los logs generados durante el procesamiento de ese request.

---

### Requirement 15: Importación Masiva de Datos

**Prioridad: Must Have**

**User Story:** Como administrador, quiero importar datos existentes desde archivos CSV o Excel (remitentes, consignatarios, envíos históricos), para que pueda migrar la operación actual a la plataforma sin perder el historial de datos.

#### Acceptance Criteria

1. THE Plataforma SHALL aceptar archivos CSV y XLSX para importación masiva de las entidades: remitentes, consignatarios, y envíos históricos.
2. WHEN un archivo de importación es cargado, THE Plataforma SHALL ejecutar una validación completa de todos los registros (formato de RFC, CP, campos requeridos, duplicados) y retornar un reporte de validación indicando: total de registros, registros válidos, registros con errores, y detalle de cada error con número de fila y campo afectado.
3. THE Plataforma SHALL soportar un modo "dry-run" que valida el archivo completo y retorna el reporte de validación sin persistir ningún dato en la base de datos.
4. WHEN el usuario confirma la importación tras revisar el reporte de validación, THE Plataforma SHALL importar únicamente los registros válidos, omitiendo los registros con errores, y retornar un resumen final con el conteo de registros importados y omitidos.
5. THE Plataforma SHALL procesar archivos de importación de hasta 10,000 registros sin timeout, ejecutando la importación como un job en background y notificando al administrador por correo cuando el proceso complete.
6. THE Plataforma SHALL registrar cada operación de importación en el audit log con: usuario que la ejecutó, nombre del archivo, fecha, total de registros procesados, y total de errores.
7. THE Plataforma SHALL proveer plantillas descargables en formato CSV para cada entidad importable, con los encabezados correctos y filas de ejemplo.
8. IF un registro a importar tiene el mismo RFC y nombre que un registro existente, THEN THE Plataforma SHALL omitir el registro duplicado y registrarlo en el reporte de validación como "duplicado existente".

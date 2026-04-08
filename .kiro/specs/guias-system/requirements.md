# Requirements Document

## Introduction

El sistema de Guías reemplaza el actual sistema de "Órdenes" para convertirlo en un flujo de creación de guías de mensajería y paquetería para SALTER. Una guía representa un documento de envío con datos de remitente, consignatario, peso, piezas, folio auto-generado y código QR, que puede imprimirse en un formato predefinido. Solo los usuarios con rol "coordinador" pueden crear guías. El sistema incluye un botón flotante de acceso rápido visible en todo el dashboard, creación inline de clientes y destinatarios, y pre-llenado de datos cuando se navega desde la página de un cliente.

## Glossary

- **Guía**: Documento de envío de mensajería y paquetería que contiene datos de remitente, consignatario, peso, piezas, folio y fecha. Reemplaza el concepto anterior de "Orden".
- **Folio**: Identificador único consecutivo de la guía en formato "{PREFIJO}-{NÚMERO}" (ej. "SA-00001"). Es de solo lectura y auto-generado por el sistema.
- **Prefijo_Folio**: Cadena configurable por el administrador que precede al número consecutivo del folio (valor por defecto: "SA").
- **Remitente**: Cliente que envía el paquete (origen del envío).
- **Consignatario**: Destinatario que recibe el paquete (destino del envío).
- **Coordinador**: Rol de usuario autorizado para crear guías.
- **Administrador**: Rol de usuario con permisos para configurar el prefijo del folio y el número de copias por defecto.
- **Quick_Action_Button**: Botón flotante persistente visible en todas las páginas del dashboard que permite crear una nueva guía.
- **Guía_Form**: Formulario de creación de guía que incluye selección de remitente, consignatario, peso, piezas y otros campos del envío.
- **Print_Preview**: Vista previa de la guía en formato de impresión con código QR antes de enviar a imprimir.
- **Copias_Default**: Número de copias de impresión por defecto, configurable por el administrador.
- **Sistema_Guías**: El módulo completo que gestiona la creación, visualización e impresión de guías.

## Requirements

### Requirement 1: Renombrar Órdenes a Guías

**User Story:** Como administrador del sistema, quiero que el módulo de "Órdenes" se renombre a "Guías" en toda la interfaz, rutas y base de datos, para que la terminología refleje el flujo real de negocio de mensajería y paquetería.

#### Acceptance Criteria

1. THE Sistema_Guías SHALL display "Guías" instead of "Órdenes" in all navigation menus, page titles, breadcrumbs, and button labels.
2. THE Sistema_Guías SHALL use the URL path "/guias" instead of "/ordenes" for all guía-related pages.
3. THE Sistema_Guías SHALL use the API path "/api/v1/guias" instead of "/api/v1/ordenes" for all guía-related endpoints.

### Requirement 2: Restricción de Rol para Creación de Guías

**User Story:** Como coordinador, quiero ser el único rol autorizado para crear guías, para que el proceso de generación de guías esté controlado y solo personal autorizado pueda emitirlas.

#### Acceptance Criteria

1. WHEN a user with role "coordinador" accesses the guía creation form, THE Sistema_Guías SHALL allow the user to create a new guía.
2. WHEN a user without role "coordinador" attempts to create a guía via the API, THE Sistema_Guías SHALL return a 403 status code with error code "NO_AUTORIZADO".
3. WHEN a user without role "coordinador" accesses the dashboard, THE Sistema_Guías SHALL hide the Quick_Action_Button for creating guías.
4. WHEN a user without role "coordinador" navigates to the guía creation page directly, THE Sistema_Guías SHALL redirect the user to the guías list page.

### Requirement 3: Botón Flotante de Acción Rápida

**User Story:** Como coordinador, quiero tener un botón flotante siempre visible en el dashboard que me permita crear una nueva guía desde cualquier página, para agilizar el proceso de creación sin tener que navegar al módulo de guías.

#### Acceptance Criteria

1. WHILE a user with role "coordinador" is on any page within the dashboard, THE Sistema_Guías SHALL display the Quick_Action_Button in a fixed position on the screen.
2. WHEN the user clicks the Quick_Action_Button, THE Sistema_Guías SHALL open the Guía_Form in a dialog overlay.
3. THE Quick_Action_Button SHALL remain visible and accessible regardless of page scroll position.
4. THE Quick_Action_Button SHALL not overlap or obstruct critical page content or navigation elements.

### Requirement 4: Selección y Creación Inline de Remitente

**User Story:** Como coordinador, quiero seleccionar un remitente existente al crear una guía, o crear uno nuevo inline si no existe, para no interrumpir el flujo de creación de la guía.

#### Acceptance Criteria

1. WHEN the user opens the Guía_Form, THE Sistema_Guías SHALL display a searchable dropdown listing all existing remitentes.
2. WHEN the user searches for a remitente that does not exist, THE Sistema_Guías SHALL display an option to create a new remitente inline.
3. WHEN the user selects the inline creation option, THE Sistema_Guías SHALL display a remitente creation form within the Guía_Form context.
4. WHEN the user submits the inline remitente form with valid data, THE Sistema_Guías SHALL save the new remitente and auto-select the newly created remitente in the Guía_Form.
5. IF the inline remitente creation fails due to validation errors, THEN THE Sistema_Guías SHALL display the validation errors and keep the inline form open without losing the guía form data.

### Requirement 5: Selección y Creación Inline de Consignatario

**User Story:** Como coordinador, quiero seleccionar un consignatario existente al crear una guía, o crear uno nuevo inline si no existe, para no interrumpir el flujo de creación de la guía.

#### Acceptance Criteria

1. WHEN the user opens the Guía_Form, THE Sistema_Guías SHALL display a searchable dropdown listing all existing consignatarios.
2. WHEN the user searches for a consignatario that does not exist, THE Sistema_Guías SHALL display an option to create a new consignatario inline.
3. WHEN the user selects the inline creation option, THE Sistema_Guías SHALL display a consignatario creation form within the Guía_Form context.
4. WHEN the user submits the inline consignatario form with valid data, THE Sistema_Guías SHALL save the new consignatario and auto-select the newly created consignatario in the Guía_Form.
5. IF the inline consignatario creation fails due to validation errors, THEN THE Sistema_Guías SHALL display the validation errors and keep the inline form open without losing the guía form data.

### Requirement 6: Folio Auto-generado y Configurable

**User Story:** Como administrador, quiero que el folio de cada guía se genere automáticamente como número consecutivo con un prefijo configurable, para mantener un control secuencial y poder personalizar el identificador según las necesidades del negocio.

#### Acceptance Criteria

1. WHEN a new guía is created, THE Sistema_Guías SHALL auto-generate the folio as "{Prefijo_Folio}-{NÚMERO}" where NÚMERO is un consecutivo de 5 dígitos con ceros a la izquierda (ej. "SA-00001").
2. THE Sistema_Guías SHALL display the folio field as read-only in the Guía_Form.
3. THE Sistema_Guías SHALL increment the folio number sequentially based on the last folio generated in the database.
4. WHEN an administrator updates the Prefijo_Folio, THE Sistema_Guías SHALL use the new prefix for all subsequent guías without altering existing folios.
5. THE Sistema_Guías SHALL store the current Prefijo_Folio value in a system configuration table with a default value of "SA".
6. THE Sistema_Guías SHALL ensure that each generated folio is unique across all guías.

### Requirement 7: Pre-llenado desde Página de Cliente

**User Story:** Como coordinador, quiero que al crear una guía desde la página de un remitente, los datos de ese remitente se pre-llenen automáticamente en el formulario, para ahorrar tiempo y evitar errores de selección.

#### Acceptance Criteria

1. WHEN the user clicks "Crear Guía" from a remitente detail or list page, THE Sistema_Guías SHALL open the Guía_Form with the remitente field pre-selected with the corresponding remitente data.
2. WHEN the Guía_Form is opened with a pre-selected remitente, THE Sistema_Guías SHALL allow the user to change the pre-selected remitente before submitting.
3. WHEN the Guía_Form is opened without context (from the Quick_Action_Button or guías page), THE Sistema_Guías SHALL display the remitente field empty.

### Requirement 8: Impresión de Guía en Formato Predefinido

**User Story:** Como coordinador, quiero imprimir la guía creada en un formato predefinido de "Mensajería y Paquetería" con todos los campos requeridos, para generar el documento físico que acompaña al envío.

#### Acceptance Criteria

1. WHEN a guía has been created and saved, THE Sistema_Guías SHALL display an option to print the guía.
2. WHEN the user selects the print option, THE Sistema_Guías SHALL render the guía in the predefined SALTER "Mensajería y Paquetería" format including: logo SALTER, Origen, No. De Cuenta, Peso, Piezas, Folio, Remitente (Nombre, Dirección, Colonia, Ciudad y Estado, Teléfono), Consignatario (Nombre, Dirección, Colonia, Ciudad y Estado, C.P., Teléfono), Fecha, Recolectado por, and Recibido fields.
3. THE Sistema_Guías SHALL format the print layout to match the physical guide dimensions used by SALTER.

### Requirement 9: Código QR en Vista Previa de Guía

**User Story:** Como coordinador, quiero que la guía incluya un código QR cuando la previsualizo antes de imprimir, para facilitar el escaneo y rastreo del envío.

#### Acceptance Criteria

1. WHEN the user opens the Print_Preview of a guía, THE Sistema_Guías SHALL generate and display a QR code within the guía layout.
2. THE Sistema_Guías SHALL encode the folio of the guía in the QR code content.
3. THE Sistema_Guías SHALL include the QR code in the printed output when the user prints the guía.

### Requirement 10: Selección de Número de Copias al Imprimir

**User Story:** Como coordinador, quiero poder seleccionar cuántas copias imprimir de una guía, con un valor por defecto definido por el administrador, para ajustar la cantidad de copias según la necesidad de cada envío.

#### Acceptance Criteria

1. WHEN the user opens the print dialog for a guía, THE Sistema_Guías SHALL display a numeric input for the number of copies pre-filled with the Copias_Default value.
2. WHEN the user modifies the number of copies, THE Sistema_Guías SHALL use the user-specified value for printing.
3. WHEN an administrator updates the Copias_Default value, THE Sistema_Guías SHALL use the new default for all subsequent print dialogs.
4. THE Sistema_Guías SHALL store the Copias_Default value in the system configuration table with a default value of 3.
5. THE Sistema_Guías SHALL validate that the number of copies is a positive integer between 1 and 10.

### Requirement 11: Estado Inicial de la Guía

**User Story:** Como coordinador, quiero que al crear y guardar una guía, su estado inicial sea "creada", para tener un punto de partida claro en el ciclo de vida de la guía.

#### Acceptance Criteria

1. WHEN a new guía is created and saved, THE Sistema_Guías SHALL set the guía status to "creada".
2. THE Sistema_Guías SHALL display the status "Creada" in the guías list and detail views.
3. THE Sistema_Guías SHALL store the status "creada" as the default value in the guías database table.

---
version: 1.0.0
date: 2026-04-03
---

# Plan de Pruebas y Guía de Usuario — Release 1

> **Version:** 1.0.0 | **Date:** 2026-04-03
>
> **Plataforma:** GF SALTER — Sistema Logístico
> **Alcance:** Release 1 (Must Have) — Req 1, 2, 3, 4, 11, 14, 15

---

## 1. Página de Inicio (Landing)

**URL:** `/`

### Qué debe hacer:
- [ ] Mostrar el logo GF SALTER con el tagline "Alternativa en movimiento"
- [ ] Mostrar el botón "Iniciar Sesión" que lleva a `/login`
- [ ] Mostrar el pie de página con "© 2026 GF SALTER · Cuernavaca, Morelos"

### Qué NO debe hacer:
- [ ] No debe mostrar contenido del dashboard sin autenticación
- [ ] No debe mostrar la barra lateral (sidebar)

---

## 2. Inicio de Sesión

**URL:** `/login`

### Qué debe hacer:
- [ ] Mostrar formulario con campos: Correo electrónico, Contraseña
- [ ] Mostrar checkbox "Recordarme"
- [ ] Al marcar "Recordarme" e iniciar sesión, el correo debe quedar guardado para la próxima visita
- [ ] Al iniciar sesión con credenciales correctas, redirigir a `/envios`
- [ ] Al iniciar sesión con credenciales incorrectas, mostrar mensaje de error
- [ ] Si el usuario tiene `mustChangePassword: true`, redirigir a `/cambiar-contrasena`

### Qué NO debe hacer:
- [ ] No debe permitir acceso al dashboard sin autenticación
- [ ] No debe mostrar la contraseña en texto plano (campo tipo password)

### Pruebas de seguridad:
- [ ] Intentar 5 veces con contraseña incorrecta → la cuenta debe bloquearse por 15 minutos
- [ ] Intentar acceder a `/envios` directamente sin sesión → debe redirigir a `/login`

---

## 3. Cambio de Contraseña (Primer Inicio)

**URL:** `/cambiar-contrasena`

### Qué debe hacer:
- [ ] Mostrar banner de advertencia: "Cambio de contraseña requerido"
- [ ] Campos: Nueva contraseña, Confirmar contraseña
- [ ] Validar que la contraseña tenga mínimo 8 caracteres
- [ ] Validar que ambas contraseñas coincidan
- [ ] Al cambiar exitosamente, cerrar sesión y redirigir a `/login`
- [ ] El usuario puede iniciar sesión con la nueva contraseña sin ser redirigido aquí de nuevo

### Qué NO debe hacer:
- [ ] No debe aceptar contraseñas menores a 8 caracteres
- [ ] No debe permitir continuar si las contraseñas no coinciden

---

## 4. Dashboard / Navegación

**Sidebar visible en todas las páginas autenticadas**

### Qué debe hacer:
- [ ] Mostrar logo GF SALTER en la parte superior del sidebar
- [ ] Mostrar menú de navegación: Envíos, Órdenes, Flota, Importación, Usuarios, Audit Log
- [ ] Mostrar breadcrumb (ruta de navegación) en la barra superior
- [ ] Mostrar información del usuario logueado (nombre, rol) en la esquina superior derecha
- [ ] Al hacer clic en el usuario, mostrar menú desplegable con "Cerrar sesión"
- [ ] "Cerrar sesión" debe redirigir a la página de inicio (`/`)

### Qué NO debe hacer:
- [ ] El menú desplegable del usuario no debe cortarse o quedar oculto
- [ ] El breadcrumb no debe mostrar rutas incorrectas

---

## 5. Gestión de Envíos

### 5.1 Lista de Envíos

**URL:** `/envios`

### Qué debe hacer:
- [ ] Mostrar tabla con columnas: Folio, Peso (kg), Estado, Fecha
- [ ] Mostrar badges de estado con colores diferenciados:
  - Pendiente (gris), Recolectado (azul), En tránsito (ámbar), En reparto (naranja), Entregado (verde), No entregado (rojo), Cancelado (gris oscuro)
- [ ] Mostrar botón "Nuevo Envío" que lleva a `/envios/nuevo`
- [ ] Si no hay envíos, mostrar mensaje "No hay envíos registrados"
- [ ] Paginación: máximo 50 registros por página

### Qué NO debe hacer:
- [ ] No debe mostrar más de 50 registros en una sola página

---

### 5.2 Crear Nuevo Envío

**URL:** `/envios/nuevo`

### Qué debe hacer:
- [ ] Mostrar formulario con campos: Folio, Peso (kg), Tipo de Contenido, ID Remitente, ID Consignatario, Valor Declarado, Comentarios
- [ ] Al enviar el formulario con datos válidos, crear el envío y redirigir a `/envios`
- [ ] El envío creado debe aparecer en la lista con estado "Pendiente"
- [ ] Breadcrumb debe mostrar: Inicio / Envíos / Nuevo

### Qué NO debe hacer:
- [ ] No debe permitir crear un envío con un folio que ya existe (debe mostrar error "FOLIO_DUPLICADO")
- [ ] No debe permitir enviar el formulario sin los campos requeridos (folio, peso, tipo de contenido, remitente, consignatario)

### Pruebas de validación:
- [ ] Intentar crear envío con folio duplicado → error "El folio ya existe"
- [ ] Intentar crear envío sin folio → error de validación
- [ ] Intentar crear envío con peso 0 o negativo → error de validación

---

### 5.3 Detalle de Envío

**URL:** `/envios/[id]`

### Qué debe hacer:
- [ ] Mostrar datos del envío: Folio, Peso, Tipo de Contenido, Valor Declarado, Comentarios
- [ ] Mostrar badge de estado actual
- [ ] Mostrar sección "Historial de estados" (puede estar vacía inicialmente)
- [ ] Mostrar enlace para volver a la lista de envíos

### Qué NO debe hacer:
- [ ] Si el envío no existe, mostrar mensaje "Envío no encontrado" con enlace de regreso

---

## 6. Gestión de Remitentes y Consignatarios

### 6.1 Remitentes

**URL:** `/api/v1/remitentes` (API — sin UI de lista aún)

### Qué debe hacer (vía API):
- [ ] POST crear remitente con: nombre, RFC, dirección completa, teléfono, email
- [ ] Validar formato RFC (12 chars persona moral, 13 chars persona física)
- [ ] Validar CP (exactamente 5 dígitos)
- [ ] GET buscar por nombre, RFC, o CP

### Qué NO debe hacer:
- [ ] No debe aceptar RFC con formato incorrecto (error "RFC_INVALIDO")
- [ ] No debe aceptar CP con menos o más de 5 dígitos (error "CP_INVALIDO")
- [ ] No debe permitir eliminar un remitente que tiene envíos activos (error "ENTIDAD_CON_DEPENDENCIAS")

### Pruebas de validación RFC:
- [ ] RFC persona moral válido (12 chars): `EEE010101AAA` → aceptado
- [ ] RFC persona física válido (13 chars): `AAAA010101AAA` → aceptado
- [ ] RFC inválido (10 chars): `ABC123` → rechazado
- [ ] RFC inválido (caracteres especiales): `EEE-01-01-01` → rechazado

### Pruebas de validación CP:
- [ ] CP válido: `62000` → aceptado
- [ ] CP inválido (4 dígitos): `6200` → rechazado
- [ ] CP inválido (letras): `ABCDE` → rechazado

---

## 7. Gestión de Órdenes de Transporte

### 7.1 Lista de Órdenes

**URL:** `/ordenes`

### Qué debe hacer:
- [ ] Mostrar tabla con columnas: Número de Orden, Estado, Peso Total, Fecha
- [ ] Mostrar badges de estado: Borrador (gris), Confirmada (azul), En ruta (ámbar), Completada (verde), Cancelada (gris oscuro)
- [ ] Mostrar botón "Nueva Orden" que lleva a `/ordenes/nueva`

---

### 7.2 Crear Nueva Orden

**URL:** `/ordenes/nueva`

### Qué debe hacer:
- [ ] Formulario con: IDs de envíos (separados por coma), Vehículo (opcional), Operador (opcional), Fecha de entrega
- [ ] Al crear, generar número de orden automático: `ORD-{YYYYMM}-{NNNNN}`
- [ ] Calcular peso total sumando los pesos de todos los envíos
- [ ] Redirigir a `/ordenes` al crear exitosamente

### Qué NO debe hacer:
- [ ] No debe permitir crear orden con envíos que no estén en estado "pendiente"
- [ ] No debe permitir agregar un envío que ya pertenece a otra orden activa
- [ ] No debe asignar un vehículo que no esté "disponible"
- [ ] No debe asignar un vehículo cuya capacidad sea menor al peso total

### Pruebas de validación:
- [ ] Crear orden con envío en estado "entregado" → error "ENVIO_NO_PENDIENTE"
- [ ] Crear orden con envío ya en otra orden → error "ENVIO_EN_ORDEN_ACTIVA"
- [ ] Asignar vehículo con capacidad insuficiente → error "CAPACIDAD_INSUFICIENTE"

---

### 7.3 Completar Orden (Cascada de Estado)

### Qué debe hacer:
- [ ] Al cambiar estado de orden a "completada", TODOS los envíos asociados deben cambiar automáticamente a "entregado"
- [ ] Verificar en la lista de envíos que los estados se actualizaron

---

## 8. Gestión de Flota

**URL:** `/flota`

### 8.1 Vehículos (Tab)

### Qué debe hacer:
- [ ] Mostrar tabla con: Placa, Núm. Económico, Tipo, Capacidad (kg), Estado, Año
- [ ] Badges de estado: Disponible (verde), En ruta (ámbar), En mantenimiento (naranja), Inactivo (gris)
- [ ] Botón "Nuevo Vehículo"

### Qué NO debe hacer:
- [ ] No debe permitir placas duplicadas
- [ ] No debe permitir números económicos duplicados

---

### 8.2 Operadores (Tab)

### Qué debe hacer:
- [ ] Mostrar tabla con: Nombre, CURP, Licencia, Vence, Teléfono, Estado
- [ ] Si la licencia vence en ≤ 30 días, la fila debe mostrarse con fondo rojo claro y un ícono de advertencia
- [ ] Botón "Nuevo Operador"

### Qué NO debe hacer:
- [ ] No debe aceptar CURP con longitud diferente a 18 caracteres

---

## 9. Gestión de Usuarios (Control de Acceso)

**URL:** `/usuarios`

### Qué debe hacer:
- [ ] Mostrar tabla de usuarios: Nombre, Correo, Rol (badge), Estado, Fecha de creación
- [ ] Botón "+ Nuevo Usuario" que abre formulario inline
- [ ] Formulario: Nombre, Correo, Rol (con descripción y permisos visibles)
- [ ] Al seleccionar un rol, mostrar los permisos asociados en badges azules
- [ ] Al crear usuario, generar contraseña temporal automáticamente
- [ ] Mostrar la contraseña temporal UNA SOLA VEZ en un recuadro verde con botón "Copiar"
- [ ] El nuevo usuario debe tener `mustChangePassword: true`

### Qué NO debe hacer:
- [ ] No debe permitir al admin escribir la contraseña manualmente
- [ ] No debe permitir crear usuario con correo duplicado (error "EMAIL_DUPLICADO")
- [ ] Solo el rol "administrador" puede acceder a esta página

### Pruebas de roles:
- [ ] Crear usuario con rol "coordinador" → verificar que puede acceder a envíos y órdenes
- [ ] Crear usuario con rol "operador" → verificar acceso limitado
- [ ] Crear usuario con rol "cliente" → verificar acceso de solo lectura
- [ ] Intentar acceder a `/usuarios` con rol "operador" → debe retornar 403

### Prueba de primer inicio de sesión:
- [ ] Crear nuevo usuario → copiar contraseña temporal
- [ ] Cerrar sesión → iniciar sesión con el nuevo usuario
- [ ] Debe redirigir a `/cambiar-contrasena`
- [ ] Cambiar contraseña → cerrar sesión automática
- [ ] Iniciar sesión con nueva contraseña → debe ir directo a `/envios` (sin pedir cambio)

---

## 10. Importación Masiva de Datos

**URL:** `/importacion`

### Qué debe hacer:
- [ ] Mostrar selector de entidad: Remitentes, Consignatarios, Envíos
- [ ] Mostrar enlaces para descargar plantillas CSV
- [ ] Permitir subir archivo CSV o XLSX
- [ ] Checkbox "Modo prueba (dry-run)" activado por defecto
- [ ] En modo dry-run: validar sin importar datos
- [ ] En modo normal: importar solo registros válidos, omitir errores
- [ ] Mostrar ID de importación y estado después de enviar

### Qué NO debe hacer:
- [ ] En modo dry-run, NO debe crear registros en la base de datos
- [ ] No debe importar registros con RFC o CP inválidos
- [ ] No debe importar registros duplicados (mismo RFC + nombre que uno existente)

### Pruebas:
- [ ] Descargar plantilla CSV de remitentes → verificar que tiene headers correctos
- [ ] Subir plantilla con datos válidos en modo dry-run → verificar que no se crearon registros
- [ ] Subir plantilla con datos válidos en modo normal → verificar que los registros aparecen en la API
- [ ] Subir archivo con RFC inválido → verificar que ese registro se omite

---

## 11. Audit Log

**URL:** `/audit-log`

### Qué debe hacer:
- [ ] Mostrar tabla con: Fecha, Nivel (badge), Evento, Entidad, Usuario, Mensaje
- [ ] Badges de nivel: Info (azul), Warn (ámbar), Error (naranja), Critical (rojo)
- [ ] Filtros: Nivel, Evento, Usuario ID, Desde, Hasta
- [ ] Paginación
- [ ] Solo accesible por rol "administrador"

### Qué NO debe hacer:
- [ ] No debe ser accesible por roles "coordinador", "operador", o "cliente"

### Pruebas:
- [ ] Crear un envío → verificar que aparece un registro "envio.created" en el audit log
- [ ] Cambiar estado de envío → verificar registro "envio.estado.updated"
- [ ] Crear un usuario → verificar registro "user.created"
- [ ] Filtrar por nivel "info" → solo deben aparecer registros de nivel info

---

## 12. API REST — Pruebas con curl

### Autenticación requerida:
```bash
# Todas las rutas /api/v1/ requieren sesión activa
# Sin sesión → HTTP 401
curl http://localhost:3000/api/v1/envios
# Respuesta esperada: { "data": null, "errors": [{ "code": "NO_AUTENTICADO" }] }
```

### Estructura de respuesta (envelope):
Todas las respuestas deben seguir el formato:
```json
{
  "data": { ... } | null,
  "meta": { "page": 1, "limit": 20, "total": 100 },
  "errors": [{ "code": "...", "message": "...", "field": "..." }]
}
```

---

## Resumen de Códigos de Error

| Código | HTTP | Cuándo ocurre |
|--------|------|---------------|
| `NO_AUTENTICADO` | 401 | Request sin sesión válida |
| `NO_AUTORIZADO` | 403 | Usuario sin permisos para la operación |
| `FOLIO_DUPLICADO` | 409 | Folio de envío ya existe |
| `RFC_INVALIDO` | 422 | RFC no cumple formato SAT |
| `CP_INVALIDO` | 422 | CP no tiene 5 dígitos |
| `ENVIO_NO_PENDIENTE` | 422 | Envío no está en estado pendiente |
| `ENVIO_EN_ORDEN_ACTIVA` | 409 | Envío ya pertenece a otra orden |
| `VEHICULO_NO_DISPONIBLE` | 422 | Vehículo no está disponible |
| `CAPACIDAD_INSUFICIENTE` | 422 | Vehículo no tiene capacidad suficiente |
| `ENTIDAD_CON_DEPENDENCIAS` | 409 | No se puede eliminar entidad con registros dependientes |
| `EMAIL_DUPLICADO` | 409 | Correo de usuario ya registrado |
| `CURP_INVALIDO` | 422 | CURP no tiene 18 caracteres |

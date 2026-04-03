---
version: 1.0.0
date: 2026-04-03
---

# UI/UX Design Specification: GF SALTER Logistics Platform

> **Cliente:** GF SALTER — "Alternativa en movimiento"
> **Stack:** Next.js 15, TypeScript, shadcn/ui, Tailwind CSS, MapLibre GL JS
> **Idioma UI:** Español (México)

---

## 1. Branding & Design Tokens

### Paleta de Colores

Basada en el sitio actual de GF SALTER (https://salter.com.mx): tonos navy/azul oscuro como base,
con acentos naranja/ámbar para acciones y estados activos. Alta legibilidad para uso en exteriores.

| Token | Nombre | Hex | Uso |
|-------|--------|-----|-----|
| `brand-navy` | Azul marino | `#0F1F3D` | Sidebar, header, fondos primarios |
| `brand-navy-light` | Azul marino claro | `#1A3260` | Hover en sidebar, cards secundarias |
| `brand-orange` | Naranja GF SALTER | `#E85D04` | CTAs primarios, acciones, acento |
| `brand-orange-light` | Naranja claro | `#F48C06` | Hover de botones, badges activos |
| `brand-amber` | Ámbar | `#FAA307` | Estados en tránsito, advertencias |
| `surface-base` | Fondo base | `#F8F9FB` | Fondo de páginas |
| `surface-card` | Fondo tarjeta | `#FFFFFF` | Cards, paneles, tablas |
| `surface-muted` | Fondo atenuado | `#EEF1F6` | Filas alternas, inputs deshabilitados |
| `text-primary` | Texto principal | `#0F1F3D` | Títulos, etiquetas |
| `text-secondary` | Texto secundario | `#4A5568` | Subtítulos, metadatos |
| `text-muted` | Texto atenuado | `#8A96A8` | Placeholders, hints |
| `text-on-dark` | Texto sobre oscuro | `#FFFFFF` | Texto en sidebar/header |
| `border-default` | Borde estándar | `#DDE3EC` | Bordes de cards, inputs, tablas |


### Colores de Estado (Status Colors)

Consistentes en todas las vistas. Usados en badges, filas de tabla, y líneas de tiempo.

| Estado | Color fondo | Color texto | Tailwind classes |
|--------|-------------|-------------|------------------|
| `pendiente` | `#F1F3F5` | `#4A5568` | `bg-gray-100 text-gray-600` |
| `recolectado` | `#EBF4FF` | `#1A56DB` | `bg-blue-50 text-blue-700` |
| `en_tránsito` | `#FFFBEB` | `#B45309` | `bg-amber-50 text-amber-700` |
| `en_reparto` | `#FFF7ED` | `#C2410C` | `bg-orange-50 text-orange-700` |
| `entregado` | `#F0FDF4` | `#15803D` | `bg-green-50 text-green-700` |
| `no_entregado` | `#FEF2F2` | `#B91C1C` | `bg-red-50 text-red-700` |
| `cancelado` | `#F8FAFC` | `#64748B` | `bg-slate-50 text-slate-500` |

### Colores de Nivel de Audit Log

| Nivel | Tailwind classes |
|-------|-----------------|
| `info` | `bg-blue-50 text-blue-700` |
| `warn` | `bg-amber-50 text-amber-700` |
| `error` | `bg-orange-50 text-orange-700` |
| `critical` | `bg-red-50 text-red-700` |

### Tipografía

Fuentes de Google Fonts, sin costo, con excelente legibilidad en pantallas móviles.

| Rol | Fuente | Peso | Uso |
|-----|--------|------|-----|
| Títulos / Headings | **Inter** | 600, 700 | H1–H4, nombres de sección |
| Cuerpo / Body | **Inter** | 400, 500 | Párrafos, etiquetas, tablas |
| Monoespaciado | **JetBrains Mono** | 400 | Folios, IDs, códigos, datos técnicos |

Escala tipográfica (rem base 16px):
- `text-xs` (0.75rem) — metadatos, timestamps
- `text-sm` (0.875rem) — etiquetas de formulario, celdas de tabla
- `text-base` (1rem) — cuerpo principal
- `text-lg` (1.125rem) — subtítulos de sección
- `text-xl` (1.25rem) — títulos de página
- `text-2xl` (1.5rem) — KPI cards
- `text-3xl` (1.875rem) — valores numéricos grandes en dashboard

### Logo

- URL: `https://salter.com.mx/gallery/45197055.png`
- Sidebar expandido: logo completo, ancho máximo 140px, margen 16px
- Sidebar colapsado: solo isotipo, 32×32px
- Header móvil: logo completo centrado, ancho máximo 120px
- Página de rastreo público: logo centrado, ancho máximo 180px
- Fondo requerido: oscuro (navy) o blanco — no usar sobre grises medios
- No distorsionar proporciones; no aplicar filtros de color


### Tailwind CSS — Custom Tokens

Agregar en `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:          "#0F1F3D",
          "navy-light":  "#1A3260",
          orange:        "#E85D04",
          "orange-light":"#F48C06",
          amber:         "#FAA307",
        },
        surface: {
          base:  "#F8F9FB",
          card:  "#FFFFFF",
          muted: "#EEF1F6",
        },
        "text-on-dark": "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
};

export default config;
```

---

## 2. Layout & Navegación

### Estructura General

```
┌─────────────────────────────────────────────────────┐
│  HEADER (64px)  logo | breadcrumb | bell | avatar   │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   SIDEBAR    │         MAIN CONTENT AREA            │
│  (240px /    │         (flex-1, overflow-y-auto)    │
│   64px col.) │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

En móvil (`< lg`): sidebar se oculta; aparece bottom tab bar con las 5 secciones más usadas + botón hamburger para el resto.

### Header (Top Bar)

- Altura: 64px, fondo `brand-navy`, sticky
- Izquierda: logo GF SALTER (enlace a dashboard)
- Centro (desktop): breadcrumb de navegación actual
- Derecha: ícono de campana (notificaciones con badge de conteo), avatar del usuario con menú desplegable
- Role badge junto al nombre del usuario:
  - `administrador` → `bg-red-100 text-red-700`
  - `coordinador` → `bg-blue-100 text-blue-700`
  - `operador` → `bg-green-100 text-green-700`
  - `cliente` → `bg-gray-100 text-gray-600`

### Sidebar (Desktop)

- Ancho expandido: 240px | Colapsado: 64px (solo íconos)
- Fondo: `brand-navy`; texto: `text-on-dark`
- Item activo: fondo `brand-navy-light`, borde izquierdo 3px `brand-orange`
- Hover: fondo `brand-navy-light` con transición 150ms
- Toggle de colapso: botón chevron en la parte inferior

**R1 — Operaciones**
- 🏠 Dashboard
- 📦 Envíos
- 📋 Órdenes
- 🚛 Flota (Vehículos + Operadores)
- 👤 Remitentes
- 🏢 Consignatarios
- 📥 Importación
- 📜 Audit Log _(solo administrador)_

**R2 — Análisis y Conectividad**
- 🗺️ Rastreo (mapa en vivo)
- 📊 Reportes
- 🔔 Notificaciones
- 🔑 API Keys

**R3 — Avanzado**
- 🛣️ Rutas
- 🤝 Transportistas

### Bottom Tab Bar (Móvil, `< lg`)

5 tabs fijos + botón "Más":
1. 🏠 Inicio
2. 📦 Envíos
3. 📋 Órdenes
4. 🚛 Flota
5. 🗺️ Rastreo
6. ☰ Más → abre `Sheet` lateral con el resto del menú

- Altura: 64px, fondo `brand-navy`, íconos 24px, etiquetas `text-xs`
- Item activo: ícono y texto en `brand-orange`
- Touch target mínimo: 44×44px por tab

### Página de Login

- Fondo: `brand-navy`
- Card centrada (max-w-sm): logo, título "Iniciar sesión", campos email/contraseña, botón primario
- Sin sidebar ni header


---

## 3. Pantallas Clave

### 3.1 Dashboard (Inicio)

**Layout:** grid de 12 columnas, gap-4

**Fila 1 — KPI Cards** (4 cards, 3 cols desktop / 6 cols tablet / 12 cols móvil)

Cada card:
- Ícono 32px en color de acento
- Valor numérico en `text-3xl font-bold`
- Etiqueta en `text-sm text-secondary`
- Variación vs. ayer (flecha + porcentaje, verde/rojo)

| Card | Ícono | Color acento |
|------|-------|--------------|
| Total Envíos | 📦 | `brand-navy` |
| En Tránsito | 🚛 | `brand-amber` |
| Entregados Hoy | ✅ | `green-600` |
| Vehículos Activos | 🚗 | `brand-orange` |

**Fila 2 — Mapa + Panel de Alertas** (R2)
- Mapa MapLibre: 8 cols desktop / 12 cols móvil, altura 400px
- Panel de alertas: 4 cols desktop / 12 cols móvil
  - Lista de alertas con ícono de severidad, mensaje, y timestamp
  - Tipos: licencia próxima a vencer (⚠️ amber), vehículo sin señal (🔴 red)
  - Cada alerta es clickeable → navega a la entidad afectada

**Fila 3 — Tabla de Órdenes Recientes**
- Columnas: Número de Orden, Estado (badge), Vehículo, Operador, Envíos, Fecha
- Máximo 10 filas, enlace "Ver todas" al final
- En móvil: colapsa a card view

### 3.2 Envíos

**Vista Lista**
- Barra de herramientas: buscador (folio, consignatario), filtros (estado, fecha), botón "Nuevo Envío" (`brand-orange`)
- Tabla: Folio (mono), Estado (badge), Remitente, Consignatario, Peso, Fecha, Acciones
- Paginación: 50 por página
- En móvil: card view con folio, estado badge, consignatario, botón "Ver"

**Formulario Nuevo Envío — Multi-paso (4 pasos)**

Stepper horizontal (desktop) / vertical (móvil):

1. **Datos del Envío** — folio, peso (kg), dimensiones (largo/ancho/alto cm), tipo de contenido, valor declarado (MXN), comentarios
2. **Remitente** — búsqueda por nombre/RFC con autocompletado, o "Nuevo remitente" inline
3. **Consignatario** — igual que remitente
4. **Confirmación** — resumen completo, botón "Crear Envío"

Validación en tiempo real con Zod + react-hook-form. Errores inline bajo cada campo.

**Vista Detalle de Envío**
- Header: folio (mono, grande), estado badge, botón "Cambiar Estado" (dropdown)
- Datos del envío (grid 2 cols)
- Remitente y consignatario (grid 2 cols)
- Línea de tiempo de estados: ícono, fecha/hora, usuario, notas, coordenadas GPS si disponibles
- Imágenes adjuntas: grid de thumbnails, botón "Agregar imagen" (máx 5)
- Ubicación actual (R2): mini mapa MapLibre con último ping GPS

### 3.3 Órdenes

**Vista Lista**
- Barra: buscador (número de orden), filtros (estado, fecha, vehículo), botón "Nueva Orden"
- Tabla: Número de Orden (mono), Estado (badge), Vehículo, Operador, # Envíos, Peso Total, Fecha Entrega, Acciones
- En móvil: card view

**Formulario Nueva Orden (3 pasos)**

1. **Selección de Envíos** — tabla multi-select de envíos en estado `pendiente`, contador de peso acumulado en tiempo real
2. **Asignación** — selector de vehículo (muestra capacidad y estado), selector de operador (muestra fecha de licencia), date picker para fecha de entrega
3. **Confirmación** — lista de envíos, vehículo, operador, barra de progreso peso vs. capacidad, fecha

**Vista Detalle de Orden**
- Header: número de orden, estado badge, botones de acción según estado (Confirmar / Cancelar / Completar)
- Datos de asignación (vehículo, operador, fecha)
- Lista de envíos con estado individual
- Mapa de ruta (R2): MapLibre con paradas marcadas
- Línea de tiempo de estados de la orden

### 3.4 Flota

**Layout con Tabs:** `Vehículos` | `Operadores`

**Tab Vehículos**
- Grid de cards (3 cols desktop / 2 cols tablet / 1 col móvil)
- Cada card: número económico + placa (mono), tipo, estado badge, barra de capacidad (Progress), botón "Ver detalle"
- Estados: disponible=green, en_ruta=orange, en_mantenimiento=amber, inactivo=gray
- Botón "Registrar Vehículo" → Dialog con formulario

**Tab Operadores**
- Tabla: Nombre, CURP (mono), Licencia #, Vence, Estado, Acciones
- Fila con licencia vencida o próxima a vencer (≤ 30 días): fondo `bg-red-50`, badge rojo "Vence pronto"
- Botón "Registrar Operador" → Dialog con formulario

### 3.5 Rastreo Público (sin autenticación)

URL: `/rastreo/[folio]`

**Layout:**
- Sin sidebar, header mínimo con logo GF SALTER centrado y tagline
- Card centrada (max-w-lg):
  - Input grande: "Ingresa tu número de folio", botón "Rastrear"
  - Al buscar: estado actual (badge grande), línea de tiempo de estados
  - Mapa MapLibre (altura 300px) con última ubicación conocida (R2)
  - Mensaje de estado en español claro: "Tu paquete está en camino" / "Entregado el [fecha]"
- Footer: datos de contacto GF SALTER, Cuernavaca, Morelos

### 3.6 Importación

**Layout de página única:**

1. **Zona de carga** — dropzone drag & drop:
   - Área punteada: "Arrastra tu archivo CSV o XLSX aquí" / "o haz clic para seleccionar"
   - Selector de entidad: `Remitentes` | `Consignatarios` | `Envíos`
   - Toggle "Modo simulación (dry-run)" — cuando activo, banner informativo azul

2. **Reporte de validación** (aparece tras cargar):
   - Resumen: total registros, válidos (verde), con errores (rojo)
   - Tabla de errores: Fila #, Campo, Error — filtrable, paginada
   - Botón "Importar [N] registros válidos" (primario, deshabilitado en dry-run)

3. **Estado del job** (tras confirmar):
   - Spinner + "Procesando importación en segundo plano..."
   - Al completar: resumen final (importados / omitidos / errores)

4. **Plantillas descargables** — 3 botones de descarga CSV en la parte inferior

### 3.7 Audit Log (solo administrador)

**Barra de filtros:** nivel (multi-select con badges), rango de fechas, tipo de evento, usuario

**Tabla:**
- Columnas: Timestamp, Nivel (badge), Evento, Usuario, Entidad, Correlation ID (mono, truncado)
- Filas expandibles: payload JSON formateado + stack trace en panel inferior con fondo `surface-muted` y fuente mono
- Paginación: 50 por página


---

## 4. Inventario de Componentes shadcn/ui

| Patrón UI | Componente | Notas |
|-----------|------------|-------|
| Tablas de datos | `DataTable` (shadcn) + TanStack Table | Sorting, filtering, pagination integrados |
| Formularios | `Form` + `FormField` + `FormMessage` | Con react-hook-form + Zod |
| Badges de estado | `Badge` con variantes custom | Ver colores de estado en sección 1 |
| Modales / confirmaciones | `Dialog` | Formularios de registro y confirmaciones destructivas |
| Notificaciones toast | `Sonner` (shadcn toast) | Éxito, error, info — posición bottom-right |
| Sidebar móvil | `Sheet` (side=left) | Abre desde hamburger en header |
| Tabs (Flota) | `Tabs` + `TabsList` + `TabsContent` | |
| Stepper de formulario | Custom con `Steps` pattern | Basado en `cn()` + estado local |
| Dropzone de archivos | Custom (react-dropzone) | No disponible en shadcn |
| Mapa | MapLibre GL JS | Wrapper React custom en `src/components/mapa/` |
| Selector de fecha | `Calendar` + `Popover` | Date picker de shadcn |
| Barra de progreso | `Progress` | Capacidad de vehículo, progreso de importación |
| Tooltips | `Tooltip` + `TooltipProvider` | Hints en íconos, campos truncados |
| Menú de usuario | `DropdownMenu` | Avatar → nombre, rol, cerrar sesión |
| Combobox / Autocomplete | `Command` + `Popover` | Búsqueda de remitentes/consignatarios |
| Alertas inline | `Alert` + `AlertDescription` | Licencias por vencer, vehículos sin señal |
| Skeleton loaders | `Skeleton` | Durante carga de tablas y KPI cards |
| Separadores | `Separator` | Entre secciones del sidebar y formularios |

---

## 5. Estrategia Responsive

### Breakpoints (Tailwind, mobile-first)

| Breakpoint | Valor | Comportamiento |
|------------|-------|----------------|
| base | 0px | Móvil: columna única, bottom tab bar |
| `sm` | 640px | Formularios en 2 columnas, cards en 2 cols |
| `md` | 768px | Tablas visibles (no card view) |
| `lg` | 1024px | Sidebar visible (240px), layout de 2 columnas |
| `xl` | 1280px | Grid de 3 columnas para cards de flota, KPIs en fila |

### Reglas por Componente

**Tablas:**
- `lg+`: tabla completa con todas las columnas
- `md`: columnas reducidas (ocultar secundarias con `hidden md:table-cell`)
- `< md`: cada fila se convierte en una card con los datos más importantes

**Formularios:**
- `lg+`: grid de 2 columnas para campos relacionados (nombre + RFC, etc.)
- `< lg`: columna única, campos apilados verticalmente

**Sidebar:**
- `lg+`: sidebar fijo a la izquierda (240px expandido / 64px colapsado)
- `< lg`: oculto; accesible via `Sheet` desde hamburger en header

**Mapa:**
- `lg+`: integrado en el layout (8/12 cols en dashboard)
- `< lg`: ancho completo (100vw) en la vista de rastreo

**KPI Cards:**
- `xl+`: 4 en fila (3 cols c/u)
- `md–lg`: 2 en fila (6 cols c/u)
- `< md`: 1 por fila (12 cols)

---

## 6. Principios de Diseño

### Claridad sobre decoración
Los operadores usan la plataforma en campo, a veces bajo el sol directo. Cada elemento debe comunicar su función sin ambigüedad. Sin animaciones innecesarias, sin gradientes complejos, sin iconografía ambigua.

### Alto contraste para exteriores
- Relación de contraste mínima: 4.5:1 para texto normal, 3:1 para texto grande (WCAG AA)
- Fondo `brand-navy` con texto blanco en sidebar/header: contraste > 7:1
- Badges de estado: combinaciones de fondo/texto verificadas para legibilidad en pantallas brillantes

### Touch targets grandes
- Mínimo 44×44px para todos los elementos interactivos (botones, links, tabs, checkboxes)
- Espaciado entre elementos táctiles: mínimo 8px
- Botones de acción principal: altura mínima 48px en móvil

### Español mexicano en toda la UI
- Sin etiquetas en inglés en la interfaz de usuario
- Terminología consistente con el glosario del proyecto (Envío, Orden, Remitente, Consignatario, Flota, etc.)
- Mensajes de error descriptivos y accionables en español
- Formatos locales: fechas `DD/MM/YYYY`, moneda `$1,234.56 MXN`, teléfonos `(777) 123-4567`

### Consistencia de estados
Los colores de estado definidos en la sección 1 se aplican sin excepción en:
- Badges en tablas
- Líneas de tiempo
- Filtros de búsqueda
- Notificaciones toast
- Audit log

### Feedback inmediato
- Skeleton loaders durante fetch de datos (nunca pantalla en blanco)
- Toast de confirmación tras cada acción exitosa (crear, actualizar, importar)
- Toast de error con mensaje descriptivo ante fallos de API
- Indicador de carga en botones de submit (spinner inline, botón deshabilitado)
- Validación de formularios en tiempo real (on blur), no solo al submit

### Jerarquía visual clara
- Una sola acción primaria por pantalla (botón `brand-orange`)
- Acciones secundarias en variante `outline` o `ghost`
- Acciones destructivas (cancelar, eliminar) en variante `destructive` (rojo), siempre con confirmación via `Dialog`

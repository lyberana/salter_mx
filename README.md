# SALTER MX — Plataforma Logística

Plataforma logística para GF SALTER (Servicios Alternativos). Gestión de envíos, órdenes de transporte, flota, importación masiva y más.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Drizzle ORM + PostgreSQL (Neon)
- Auth.js v5 (credentials + JWT)
- shadcn/ui + Tailwind CSS
- Inngest (background jobs)
- Pino (logging)
- Docker Compose

## Páginas Públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con hero, carousel de servicios, estadísticas y footer de contacto |
| `/rastreo` | Demo de rastreo de envíos — ingresa un folio y visualiza un timeline de movimientos |
| `/login` | Inicio de sesión |

## Dashboard (autenticado)

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Panel principal |
| `/envios` | Gestión de envíos (CRUD, cambio de estado, historial) |
| `/ordenes` | Órdenes de transporte |
| `/flota` | Vehículos y operadores |
| `/consignatarios` | Gestión de consignatarios |
| `/remitentes` | Gestión de remitentes |
| `/importacion` | Importación masiva CSV/XLSX |
| `/audit-log` | Registro de auditoría (solo admin) |
| `/usuarios` | Gestión de usuarios |

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.local.example .env.local

# Levantar con Docker
docker compose up

# O desarrollo local
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # Login, cambiar contraseña
│   ├── (dashboard)/     # Páginas autenticadas
│   ├── api/v1/          # API REST
│   ├── rastreo/         # Demo pública de rastreo
│   └── page.tsx         # Landing page
├── components/
│   └── ui/              # shadcn/ui (button, card, carousel, badge, etc.)
├── lib/
│   ├── db/              # Drizzle schema, migraciones
│   ├── services/        # Lógica de negocio
│   ├── repositories/    # Acceso a datos
│   ├── inngest/         # Background jobs
│   ├── middleware/       # Auth, idempotency
│   └── utils/           # Validaciones (RFC, CP, etc.)
└── auth.ts              # Configuración Auth.js
```

## MCP (Model Context Protocol)

El proyecto tiene configurado el servidor MCP de shadcn para asistencia con componentes UI:

```json
// .kiro/settings/mcp.json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

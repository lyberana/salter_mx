import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { vehiculos, operadores } from "@/lib/db/schema";

// ─── Vehiculos ───────────────────────────────────────────────────────────────

export async function createVehiculo(data: typeof vehiculos.$inferInsert) {
  const [created] = await db.insert(vehiculos).values(data).returning();
  return created;
}

export async function getVehiculoById(id: string) {
  const [row] = await db.select().from(vehiculos).where(eq(vehiculos.id, id)).limit(1);
  return row ?? null;
}

export async function listVehiculos() {
  return db.select().from(vehiculos).orderBy(vehiculos.numeroEconomico);
}

export async function updateVehiculoEstado(
  id: string,
  estado: "disponible" | "en_ruta" | "en_mantenimiento" | "inactivo"
) {
  const [updated] = await db
    .update(vehiculos)
    .set({ estado, updatedAt: new Date() })
    .where(eq(vehiculos.id, id))
    .returning();
  return updated ?? null;
}

export async function getVehiculosDisponibles() {
  return db
    .select()
    .from(vehiculos)
    .where(eq(vehiculos.estado, "disponible"));
}

// ─── Operadores ──────────────────────────────────────────────────────────────

export async function createOperador(data: typeof operadores.$inferInsert) {
  const [created] = await db.insert(operadores).values(data).returning();
  return created;
}

export async function getOperadorById(id: string) {
  const [row] = await db
    .select()
    .from(operadores)
    .where(eq(operadores.id, id))
    .limit(1);
  return row ?? null;
}

export async function listOperadores() {
  return db.select().from(operadores).orderBy(operadores.nombre);
}

export async function getOperadoresLicenciaProximaVencer(diasLimite: number) {
  const hoy = new Date();
  const limite = new Date(hoy);
  limite.setDate(limite.getDate() + diasLimite);

  return db
    .select()
    .from(operadores)
    .where(
      sql`${operadores.activo} = true
        AND ${operadores.licenciaVence} <= ${limite.toISOString().split("T")[0]}
        AND ${operadores.licenciaVence} >= ${hoy.toISOString().split("T")[0]}`
    );
}

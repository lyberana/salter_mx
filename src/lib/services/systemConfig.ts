import * as repo from "@/lib/repositories/systemConfig";
import { updateSystemConfigSchema, type UpdateSystemConfigInput } from "@/lib/schemas/guias";
import { logger } from "@/lib/logger";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; field?: string };

export interface SystemConfig {
  folio_prefix: string;
  default_copies: number;
}

// ─── getConfig ───────────────────────────────────────────────────────────────

export async function getConfig(): Promise<ServiceResult<SystemConfig>> {
  try {
    const prefix = await repo.getConfigValue("folio_prefix");
    const copies = await repo.getConfigValue("default_copies");

    return {
      ok: true,
      data: {
        folio_prefix: prefix ?? "SA",
        default_copies: copies ? parseInt(copies, 10) : 3,
      },
    };
  } catch (err) {
    logger.error({ err }, "Failed to get system config");
    return { ok: false, code: "CONFIG_NOT_FOUND", message: "No se pudo obtener la configuración del sistema" };
  }
}

// ─── updateConfig ────────────────────────────────────────────────────────────

export async function updateConfig(input: UpdateSystemConfigInput): Promise<ServiceResult<SystemConfig>> {
  const parsed = updateSystemConfigSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: firstError.message,
      field: firstError.path.join("."),
    };
  }

  try {
    if (parsed.data.folio_prefix !== undefined) {
      await repo.setConfigValue("folio_prefix", parsed.data.folio_prefix);
    }
    if (parsed.data.default_copies !== undefined) {
      await repo.setConfigValue("default_copies", String(parsed.data.default_copies));
    }

    return getConfig();
  } catch (err) {
    logger.error({ err }, "Failed to update system config");
    return { ok: false, code: "SERVER_ERROR", message: "No se pudo actualizar la configuración del sistema" };
  }
}

// ─── getNextFolio ────────────────────────────────────────────────────────────

export async function getNextFolio(): Promise<ServiceResult<string>> {
  try {
    const prefix = (await repo.getConfigValue("folio_prefix")) ?? "SA";
    const counter = await repo.incrementAndGetCounter("folio_counter");
    const folio = `${prefix}-${String(counter).padStart(5, "0")}`;
    return { ok: true, data: folio };
  } catch (err) {
    logger.error({ err }, "Failed to generate next folio");
    return { ok: false, code: "FOLIO_GENERATION_ERROR", message: "Error al generar el folio" };
  }
}

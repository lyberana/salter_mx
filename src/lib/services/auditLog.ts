import { db } from "@/lib/db/index";
import { auditLog } from "@/lib/db/schema";
import { getCorrelationId } from "@/lib/context/correlation";
import { inngest } from "@/lib/inngest/client";
import { logger } from "@/lib/logger";
import { sql, and, eq, gt } from "drizzle-orm";

type AuditLevel = "info" | "warn" | "error" | "critical";

interface LogEventParams {
  nivel: AuditLevel;
  evento: string;
  userId?: string;
  entidad?: string;
  entidadId?: string;
  payload?: Record<string, unknown>;
  errorMessage?: string;
  stackTrace?: string;
}

export async function logEvent(params: LogEventParams): Promise<void> {
  const correlationId = getCorrelationId();

  try {
    await db.insert(auditLog).values({
      correlationId,
      nivel: params.nivel,
      evento: params.evento,
      userId: params.userId,
      entidad: params.entidad,
      entidadId: params.entidadId,
      payload: params.payload,
      errorMessage: params.errorMessage,
      stackTrace: params.stackTrace,
    });
  } catch (err) {
    // Don't let audit log failures break the main operation
    logger.error({ err, evento: params.evento }, "Failed to write audit log");
  }

  // For critical events, check throttling and send alert
  if (params.nivel === "critical") {
    await handleCriticalAlert(params);
  }
}

async function handleCriticalAlert(params: LogEventParams): Promise<void> {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Count recent critical events of the same type
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(
        and(
          eq(auditLog.nivel, "critical"),
          eq(auditLog.evento, params.evento),
          gt(auditLog.createdAt, tenMinutesAgo)
        )
      );

    const recentCount = result?.count ?? 0;

    if (recentCount > 5) {
      // Throttled: send grouped alert instead of individual
      await inngest.send({
        name: "alerta/throttled",
        data: {
          evento: params.evento,
          count: recentCount,
          lastError: params.errorMessage,
          correlationId: getCorrelationId(),
        },
      });
    } else {
      // Send immediate critical alert
      await inngest.send({
        name: "alerta/critical",
        data: {
          evento: params.evento,
          errorMessage: params.errorMessage,
          stackTrace: params.stackTrace,
          correlationId: getCorrelationId(),
          userId: params.userId,
          entidad: params.entidad,
          entidadId: params.entidadId,
        },
      });
    }
  } catch (err) {
    logger.error({ err }, "Failed to send critical alert");
  }
}

// Convenience helpers
export async function logInfo(evento: string, params?: Partial<LogEventParams>) {
  return logEvent({ nivel: "info", evento, ...params });
}

export async function logWarn(evento: string, params?: Partial<LogEventParams>) {
  return logEvent({ nivel: "warn", evento, ...params });
}

export async function logError(evento: string, error: Error, params?: Partial<LogEventParams>) {
  return logEvent({
    nivel: "error",
    evento,
    errorMessage: error.message,
    stackTrace: error.stack,
    ...params,
  });
}

export async function logCritical(evento: string, error: Error, params?: Partial<LogEventParams>) {
  return logEvent({
    nivel: "critical",
    evento,
    errorMessage: error.message,
    stackTrace: error.stack,
    ...params,
  });
}

import { inngest } from "@/lib/inngest/client";
import { logger } from "@/lib/logger";

export const alertaCritical = inngest.createFunction(
  { id: "alerta-critical", name: "Alerta Crítica", triggers: [{ event: "alerta/critical" }] },
  async ({ event }) => {
    const { evento, errorMessage, stackTrace, correlationId, userId, entidad, entidadId } = event.data;

    logger.error({
      event: "alerta.critical.processing",
      correlationId,
      evento,
      errorMessage,
    }, "Processing critical alert");

    logger.warn({
      event: "alerta.critical.email_placeholder",
      to: "admin@gfsalter.com",
      subject: `[CRITICAL] ${evento}`,
      body: { errorMessage, stackTrace, correlationId, userId, entidad, entidadId },
    }, "Critical alert email would be sent here");

    return { sent: true, evento, correlationId };
  }
);

export const alertaThrottled = inngest.createFunction(
  { id: "alerta-throttled", name: "Alerta Agrupada", triggers: [{ event: "alerta/throttled" }] },
  async ({ event }) => {
    const { evento, count, lastError, correlationId } = event.data;

    logger.warn({
      event: "alerta.throttled.processing",
      correlationId,
      evento,
      count,
    }, "Processing throttled alert");

    logger.warn({
      event: "alerta.throttled.email_placeholder",
      to: "admin@gfsalter.com",
      subject: `[CRITICAL AGRUPADA] ${evento} (${count} ocurrencias)`,
      body: { evento, count, lastError, correlationId },
    }, "Throttled alert email would be sent here");

    return { sent: true, evento, count, correlationId };
  }
);

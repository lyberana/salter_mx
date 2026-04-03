import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export function getRequestLogger(req: NextRequest) {
  const correlationId = req.headers.get("x-correlation-id") ?? "unknown";
  return logger.child({ correlationId });
}

export function getCorrelationIdFromRequest(req: NextRequest): string {
  return req.headers.get("x-correlation-id") ?? "unknown";
}

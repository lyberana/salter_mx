import { AsyncLocalStorage } from "async_hooks";

interface RequestContext {
  correlationId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function getCorrelationId(): string {
  return storage.getStore()?.correlationId ?? "no-correlation-id";
}

export function runWithCorrelationId<T>(correlationId: string, fn: () => T): T {
  return storage.run({ correlationId }, fn);
}

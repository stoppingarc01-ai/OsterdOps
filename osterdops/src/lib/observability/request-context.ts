import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestCorrelationContext {
  requestId: string;
  organizationId?: string;
  projectId?: string;
  keyId?: string;
  startTime?: number;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestCorrelationContext>();

export function runWithRequestContext<T>(
  context: RequestCorrelationContext,
  fn: () => T
): T {
  return asyncLocalStorage.run(context, fn);
}

export function getRequestContext(): RequestCorrelationContext | undefined {
  return asyncLocalStorage.getStore();
}

export function extractOrGenerateRequestId(
  headers?: Headers | Record<string, string | null | undefined>
): string {
  if (headers) {
    if (typeof (headers as Headers).get === "function") {
      const h = headers as Headers;
      const customId = h.get("x-osterdops-request-id") || h.get("x-request-id");
      if (customId && customId.trim()) return customId.trim();
    } else {
      const obj = headers as Record<string, string | null | undefined>;
      const customId = obj["x-osterdops-request-id"] || obj["x-request-id"] || obj["X-Request-Id"];
      if (customId && customId.trim()) return customId.trim();
    }
  }

  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

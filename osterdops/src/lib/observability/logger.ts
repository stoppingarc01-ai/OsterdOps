/**
 * OsterdOps — Structured Operational Logger (Phase 14)
 * Outputs standardized JSON log events with mandatory sensitive field redaction.
 */

import { redactSensitiveData } from "./redaction";
import { getRequestContext } from "./request-context";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  environment: string;
  event: string;
  requestId?: string;
  organizationId?: string;
  projectId?: string;
  durationMs?: number;
  statusCode?: number;
  errorCode?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export function formatLogEntry(
  level: LogLevel,
  event: string,
  meta: Record<string, unknown> = {},
  error?: unknown
): LogEntry {
  const sanitizedMeta = (redactSensitiveData(meta) as Record<string, unknown>) || {};
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : undefined;
  const asyncCtx = getRequestContext();

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: "osterdops",
    environment: process.env.NODE_ENV || "development",
    event,
    requestId: sanitizedMeta.requestId ? String(sanitizedMeta.requestId) : asyncCtx?.requestId,
    organizationId: sanitizedMeta.organizationId ? String(sanitizedMeta.organizationId) : asyncCtx?.organizationId,
    projectId: sanitizedMeta.projectId ? String(sanitizedMeta.projectId) : asyncCtx?.projectId,
    durationMs: typeof sanitizedMeta.durationMs === "number" ? sanitizedMeta.durationMs : undefined,
    statusCode: typeof sanitizedMeta.statusCode === "number" ? sanitizedMeta.statusCode : undefined,
    errorCode: sanitizedMeta.errorCode ? String(sanitizedMeta.errorCode) : undefined,
    error: errorMessage ? String(redactSensitiveData(errorMessage)) : undefined,
    metadata: sanitizedMeta,
  };

  return entry;
}

export const logger = {
  info(event: string, meta: Record<string, unknown> = {}): LogEntry {
    const entry = formatLogEntry("info", event, meta);
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify(entry));
    }
    return entry;
  },

  warn(event: string, meta: Record<string, unknown> = {}): LogEntry {
    const entry = formatLogEntry("warn", event, meta);
    if (process.env.NODE_ENV !== "test") {
      console.warn(JSON.stringify(entry));
    }
    return entry;
  },

  error(event: string, error?: unknown, meta: Record<string, unknown> = {}): LogEntry {
    const entry = formatLogEntry("error", event, meta, error);
    if (process.env.NODE_ENV !== "test") {
      console.error(JSON.stringify(entry));
    }
    return entry;
  },

  debug(event: string, meta: Record<string, unknown> = {}): LogEntry {
    const entry = formatLogEntry("debug", event, meta);
    if (process.env.NODE_ENV !== "test" && process.env.DEBUG === "true") {
      console.debug(JSON.stringify(entry));
    }
    return entry;
  },
};

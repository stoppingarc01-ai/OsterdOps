/**
 * OsterdOps — Standardized API Response & Error Helpers (Phase 18)
 * Integrates request correlation, API versioning, and canonical error serialization.
 */

import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { CURRENT_API_VERSION, applyVersionHeaders } from "./versioning";
import { StandardApiError } from "./errors";

export interface SuccessResponseOptions {
  meta?: Record<string, unknown>;
  status?: number;
  requestId?: string;
  version?: string;
  headers?: Record<string, string>;
}

export function apiSuccess<T>(
  data: T,
  metaOrOptions?: Record<string, unknown> | SuccessResponseOptions,
  status = 200,
  requestId?: string
): NextResponse {
  let meta: Record<string, unknown> | undefined;
  let finalStatus = status;
  let finalRequestId = requestId;
  let version = CURRENT_API_VERSION;
  let customHeaders: Record<string, string> = {};

  if (metaOrOptions) {
    if ("meta" in metaOrOptions || "status" in metaOrOptions || "requestId" in metaOrOptions || "version" in metaOrOptions || "headers" in metaOrOptions) {
      const opts = metaOrOptions as SuccessResponseOptions;
      meta = opts.meta;
      finalStatus = opts.status ?? status;
      finalRequestId = opts.requestId ?? requestId;
      version = opts.version ?? CURRENT_API_VERSION;
      customHeaders = opts.headers ?? {};
    } else {
      meta = metaOrOptions as Record<string, unknown>;
    }
  }

  const payload: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };

  const res = NextResponse.json(payload, { status: finalStatus });

  // Apply correlation and version headers
  applyVersionHeaders(res.headers, version);
  if (finalRequestId) {
    res.headers.set("x-osterdops-request-id", finalRequestId);
  }

  for (const [k, v] of Object.entries(customHeaders)) {
    res.headers.set(k, v);
  }

  return res;
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
  requestId?: string,
  retryAfterSeconds?: number
): NextResponse {
  const payload: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    } as unknown as { code: string; message: string; details?: unknown },
  };

  const res = NextResponse.json(payload, { status });
  applyVersionHeaders(res.headers, CURRENT_API_VERSION);

  if (requestId) {
    res.headers.set("x-osterdops-request-id", requestId);
  }
  if (retryAfterSeconds !== undefined) {
    res.headers.set("Retry-After", String(retryAfterSeconds));
  }

  return res;
}

/**
 * Global handler for StandardApiError or standard Exceptions.
 */
export function handleApiError(err: unknown, requestId?: string): NextResponse {
  if (err instanceof StandardApiError) {
    return apiError(
      err.code,
      err.message,
      err.statusCode,
      err.details,
      err.requestId || requestId,
      err.retryAfterSeconds
    );
  }

  const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
  return apiError("INTERNAL_ERROR", message, 500, undefined, requestId);
}

export const ApiErrors = {
  badRequest: (message = "Invalid request payload or parameters", details?: unknown, requestId?: string) =>
    apiError("BAD_REQUEST", message, 400, details, requestId),

  unauthorized: (message = "Authentication required or token expired", details?: unknown, requestId?: string) =>
    apiError("UNAUTHORIZED", message, 401, details, requestId),

  forbidden: (message = "Insufficient permissions to perform this action", details?: unknown, requestId?: string) =>
    apiError("FORBIDDEN", message, 403, details, requestId),

  notFound: (message = "Requested resource not found", details?: unknown, requestId?: string) =>
    apiError("NOT_FOUND", message, 404, details, requestId),

  conflict: (message = "Resource already exists or conflict occurred", details?: unknown, requestId?: string) =>
    apiError("CONFLICT", message, 409, details, requestId),

  validationError: (message = "Request validation failed", details?: unknown, requestId?: string) =>
    apiError("VALIDATION_ERROR", message, 400, details, requestId),

  rateLimited: (message = "Rate limit exceeded. Please apply exponential backoff.", details?: unknown, requestId?: string, retryAfterSeconds?: number) =>
    apiError("RATE_LIMITED", message, 429, details, requestId, retryAfterSeconds),

  budgetExceeded: (message = "Monthly spend limit exceeded under HARD budget enforcement.", details?: unknown, requestId?: string) =>
    apiError("BUDGET_EXCEEDED", message, 429, details, requestId),

  entitlementExceeded: (message = "Plan quota or feature limit exceeded. Upgrade subscription.", details?: unknown, requestId?: string) =>
    apiError("ENTITLEMENT_EXCEEDED", message, 403, details, requestId),

  idempotencyConflict: (message = "Idempotency key was previously used with a different request payload.", details?: unknown, requestId?: string) =>
    apiError("IDEMPOTENCY_CONFLICT", message, 409, details, requestId),

  unsupportedVersion: (message = "The requested API version is not supported.", details?: unknown, requestId?: string) =>
    apiError("UNSUPPORTED_VERSION", message, 400, details, requestId),

  serviceUnavailable: (message = "Service is temporarily unavailable. Please retry shortly.", details?: unknown, requestId?: string, retryAfterSeconds?: number) =>
    apiError("SERVICE_UNAVAILABLE", message, 503, details, requestId, retryAfterSeconds),

  internalError: (message = "An unexpected server error occurred", details?: unknown, requestId?: string) =>
    apiError("INTERNAL_SERVER_ERROR", message, 500, details, requestId),
};

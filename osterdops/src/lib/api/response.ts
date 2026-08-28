/**
 * OsterdOps — Standardized API Response & Error Helpers
 */

import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(payload, { status });
}

export function apiError(code: string, message: string, status = 400, details?: unknown) {
  const payload: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return NextResponse.json(payload, { status });
}

export const ApiErrors = {
  badRequest: (message = "Invalid request payload or parameters", details?: unknown) =>
    apiError("BAD_REQUEST", message, 400, details),

  unauthorized: (message = "Authentication required or token expired", details?: unknown) =>
    apiError("UNAUTHORIZED", message, 401, details),

  forbidden: (message = "Insufficient permissions to perform this action", details?: unknown) =>
    apiError("FORBIDDEN", message, 403, details),

  notFound: (message = "Requested resource not found", details?: unknown) =>
    apiError("NOT_FOUND", message, 404, details),

  conflict: (message = "Resource already exists or conflict occurred", details?: unknown) =>
    apiError("CONFLICT", message, 409, details),

  rateLimited: (message = "Rate limit exceeded or budget limit reached", details?: unknown) =>
    apiError("RATE_LIMITED", message, 429, details),

  internalError: (message = "An unexpected server error occurred", details?: unknown) =>
    apiError("INTERNAL_SERVER_ERROR", message, 500, details),
};

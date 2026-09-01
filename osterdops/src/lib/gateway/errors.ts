/**
 * OsterdOps — AI Gateway Error Normalization & HTTP Response Envelopes (Phase 22)
 * Maps provider failures and network exceptions into standardized OsterdOps gateway errors without secret leaks.
 */

import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import type { GatewayErrorCode } from "./types";
import { redactSensitiveData } from "@/lib/observability/redaction";

export interface GatewayErrorPayload {
  code: GatewayErrorCode;
  message: string;
  provider?: string;
  statusCode: number;
  retryable: boolean;
}

/**
 * Creates a standard JSON error response for gateway clients.
 */
export function createGatewayErrorResponse(
  error: GatewayErrorPayload,
  headers?: Record<string, string>
): NextResponse<ApiResponse<never>> {
  // Ensure message has zero private secrets
  const cleanMessage = typeof error.message === "string"
    ? String(redactSensitiveData(error.message))
    : "An error occurred.";

  const body: ApiResponse<never> = {
    success: false,
    error: {
      code: error.code,
      message: cleanMessage,
      details: {
        provider: error.provider,
        retryable: error.retryable,
      },
    },
  };

  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "application/json");

  return NextResponse.json(body, {
    status: error.statusCode,
    headers: responseHeaders,
  });
}

/**
 * Normalizes an unknown exception or provider error into a standard GatewayErrorPayload.
 */
export function normalizeGatewayError(
  err: unknown,
  provider?: string,
  statusCode = 500
): GatewayErrorPayload {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();

    if (
      err.name === "CircuitBreakerError" ||
      msg.includes("circuit breaker is open") ||
      (err as { code?: string }).code === "CIRCUIT_BREAKER_OPEN"
    ) {
      return {
        code: "CIRCUIT_BREAKER_OPEN",
        message: err.message,
        provider,
        statusCode: 503,
        retryable: true,
      };
    }

    if (err.name === "AbortError" || msg.includes("timeout") || msg.includes("aborted")) {
      return {
        code: "TIMEOUT",
        message: `Upstream AI provider request timed out after server deadline.`,
        provider,
        statusCode: 504,
        retryable: true,
      };
    }

    if (
      msg.includes("invalid_credentials") ||
      msg.includes("authentication_failed") ||
      msg.includes("invalid api key") ||
      msg.includes("api key not valid") ||
      statusCode === 401 ||
      statusCode === 403
    ) {
      return {
        code: "INVALID_CREDENTIALS",
        message: `Upstream provider credentials for '${provider}' are invalid or unauthorized.`,
        provider,
        statusCode: 401,
        retryable: false,
      };
    }

    if (msg.includes("provider_rate_limited") || msg.includes("rate limit") || statusCode === 429) {
      return {
        code: "PROVIDER_RATE_LIMITED",
        message: `Upstream rate limit reached for '${provider}'.`,
        provider,
        statusCode: 429,
        retryable: true,
      };
    }

    if (msg.includes("model_not_found") || msg.includes("not found") || statusCode === 404) {
      return {
        code: "MODEL_NOT_FOUND",
        message: `The specified model was not found on provider '${provider}'.`,
        provider,
        statusCode: 404,
        retryable: false,
      };
    }

    if (msg.includes("bad_request") || msg.includes("invalid_request") || statusCode === 400) {
      return {
        code: "PROVIDER_BAD_REQUEST",
        message: `The upstream provider rejected the request parameters: ${err.message}`,
        provider,
        statusCode: 400,
        retryable: false,
      };
    }

    if (msg.includes("stream_error") || msg.includes("stream interrupted")) {
      return {
        code: "PROVIDER_STREAM_ERROR",
        message: "Streaming connection with upstream AI provider was interrupted.",
        provider,
        statusCode: 500,
        retryable: true,
      };
    }

    if (msg.includes("provider_unavailable") || statusCode >= 500) {
      return {
        code: "PROVIDER_UNAVAILABLE",
        message: `Upstream provider '${provider}' is temporarily unavailable.`,
        provider,
        statusCode: 503,
        retryable: true,
      };
    }

    return {
      code: "PROVIDER_ERROR",
      message: err.message,
      provider,
      statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 502,
      retryable: statusCode >= 500,
    };
  }

  return {
    code: "PROVIDER_ERROR",
    message: "An unexpected error occurred while communicating with the upstream AI provider.",
    provider,
    statusCode: 502,
    retryable: true,
  };
}

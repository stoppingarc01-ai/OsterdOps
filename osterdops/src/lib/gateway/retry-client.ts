/**
 * OsterdOps — Resilient Upstream Provider HTTP Transport & Retry Client (Phase 22)
 * Handles bounded exponential backoff, full jitter, Retry-After header parsing,
 * request deadlines, and non-destructive retry classifications.
 */

import { calculateExponentialBackoff, isRetryableError } from "@/lib/jobs/retry";
import { incrementMetric } from "@/lib/observability/metrics";
import type { CircuitBreaker } from "./circuit-breaker";

export interface RetryClientOptions {
  maxRetries?: number;
  timeoutMs?: number;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
  circuitBreaker?: CircuitBreaker;
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

export interface RetryExecutionResult {
  rawResponse: Response;
  responseBody: unknown;
  latencyMs: number;
  attempts: number;
}

/**
 * Parses the standard HTTP `Retry-After` header (either decimal seconds or an HTTP-date string).
 */
export function parseRetryAfterHeader(headerValue: string | null): number | null {
  if (!headerValue) return null;

  const seconds = Number(headerValue);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return Math.min(30000, seconds * 1000); // Bounded at 30s
  }

  // Parse HTTP date format: e.g. "Wed, 21 Oct 2026 07:28:00 GMT"
  const parsedDate = Date.parse(headerValue);
  if (!Number.isNaN(parsedDate)) {
    const diffMs = parsedDate - Date.now();
    return Math.min(30000, Math.max(0, diffMs));
  }

  return null;
}

/**
 * Calculates exponential backoff with full jitter to avoid thundering herds.
 */
export function calculateJitteredBackoff(
  attempt: number,
  baseMs = 200,
  maxMs = 5000
): number {
  const rawBackoff = calculateExponentialBackoff(attempt, baseMs, maxMs);
  // Full jitter: random duration between baseMs and calculated backoff
  return Math.floor(Math.random() * (rawBackoff - baseMs + 1)) + baseMs;
}

/**
 * Executes an HTTP fetch with automated timeout enforcement and selective retries.
 */
export async function executeProviderHttpWithRetry(
  requestFn: (signal: AbortSignal) => Promise<Response>,
  options: RetryClientOptions = {}
): Promise<RetryExecutionResult> {
  const maxRetries = options.maxRetries ?? 2;
  const timeoutMs = options.timeoutMs ?? 60000;
  const baseBackoffMs = options.baseBackoffMs ?? 200;
  const maxBackoffMs = options.maxBackoffMs ?? 5000;

  const overallStart = performance.now();
  let attempt = 0;
  let lastError: unknown;

  // Circuit Breaker pre-flight check
  if (options.circuitBreaker) {
    options.circuitBreaker.checkExecution();
  }

  while (attempt <= maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await requestFn(controller.signal);
      clearTimeout(timer);

      // Check if response is successful or permanent non-retryable error
      if (response.ok) {
        options.circuitBreaker?.recordSuccess();
        const responseBody = await response.json().catch(() => ({}));
        const latencyMs = Math.round(performance.now() - overallStart);

        return {
          rawResponse: response,
          responseBody,
          latencyMs,
          attempts: attempt,
        };
      }

      // Read error body once safely
      const responseBody = await response.json().catch(() => ({}));

      // Non-retryable HTTP client errors (400, 401, 403, 404, 422)
      const isClientError = [400, 401, 403, 404, 422].includes(response.status);
      const isRetryableStatus = response.status === 429 || response.status >= 500;

      if (isClientError || !isRetryableStatus || attempt > maxRetries) {
        if (response.status >= 500) {
          options.circuitBreaker?.recordFailure();
        }
        const latencyMs = Math.round(performance.now() - overallStart);
        return {
          rawResponse: response,
          responseBody,
          latencyMs,
          attempts: attempt,
        };
      }

      // Check Retry-After header
      const retryAfterHeader = response.headers.get("retry-after") || response.headers.get("Retry-After");
      const retryAfterMs = parseRetryAfterHeader(retryAfterHeader);
      const delayMs = retryAfterMs !== null
        ? retryAfterMs
        : calculateJitteredBackoff(attempt, baseBackoffMs, maxBackoffMs);

      incrementMetric("provider.retry", 1, {
        status: String(response.status),
      });

      if (options.onRetry) {
        options.onRetry(attempt, new Error(`HTTP ${response.status}`), delayMs);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err;

      const isRetryable = isRetryableError(err);
      if (!isRetryable || attempt > maxRetries) {
        options.circuitBreaker?.recordFailure();
        throw err;
      }

      const delayMs = calculateJitteredBackoff(attempt, baseBackoffMs, maxBackoffMs);
      incrementMetric("provider.retry", 1, {
        status: "network_error",
      });

      if (options.onRetry) {
        options.onRetry(attempt, err, delayMs);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  options.circuitBreaker?.recordFailure();
  throw lastError || new Error("Exhausted maximum retry attempts without receiving response.");
}

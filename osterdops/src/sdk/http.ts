/**
 * OsterdOps TypeScript SDK — Resilient HTTP Transport Layer
 * Conservative retry backoff, timeout enforcement, request correlation, and safe error normalization.
 */

import {
  OsterdOpsError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  RateLimitError,
  BudgetExceededError,
  NotFoundError,
  ConflictError,
  IdempotencyConflictError,
  EntitlementExceededError,
  ProviderError,
  TimeoutError,
  ServerError,
  NetworkError,
} from "./errors";
import type { OsterdOpsClientOptions } from "./types";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "HEAD" | "OPTIONS";
  path: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  requestId?: string;
  idempotencyKey?: string;
  timeoutMs?: number;
  maxRetries?: number;
  /** Whether the request is safe to retry on transient failure */
  idempotent?: boolean;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  requestId: string;
  latencyMs: number;
  headers: Record<string, string>;
}

export class HttpClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly customHeaders: Record<string, string>;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OsterdOpsClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.OSTERDOPS_API_KEY;
    this.baseUrl = (options.baseUrl || process.env.OSTERDOPS_BASE_URL || "https://api.osterdops.com").replace(
      /\/+$/,
      ""
    );
    this.apiVersion = options.apiVersion || "v1";
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.maxRetries = options.maxRetries ?? 2;
    this.customHeaders = options.headers || {};
    this.fetchImpl = options.fetch || (typeof fetch !== "undefined" ? fetch.bind(globalThis) : (undefined as unknown as typeof fetch));
  }

  /**
   * Generates a request correlation ID.
   */
  private generateRequestId(): string {
    return `sdk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Dispatches an HTTP request with automatic retries, timeout, and typed response envelopes.
   */
  public async request<T = unknown>(options: RequestOptions): Promise<HttpResponse<T>> {
    const method = options.method || "GET";
    const requestId = options.requestId || options.headers?.["x-osterdops-request-id"] || this.generateRequestId();
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    const isIdempotent = options.idempotent ?? (method === "GET" || method === "HEAD" || method === "OPTIONS" || Boolean(options.idempotencyKey));

    // Build complete URL
    let url = `${this.baseUrl}${options.path.startsWith("/") ? "" : "/"}${options.path}`;
    if (options.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes("?") ? "&" : "?") + qs;
      }
    }

    // Build headers
    const reqHeaders: Record<string, string> = {
      "Accept": "application/json",
      "x-osterdops-request-id": requestId,
      "x-api-version": this.apiVersion,
      ...this.customHeaders,
      ...options.headers,
    };

    if (options.idempotencyKey) {
      reqHeaders["Idempotency-Key"] = options.idempotencyKey;
    }

    if (this.apiKey) {
      reqHeaders["Authorization"] = `Bearer ${this.apiKey}`;
      reqHeaders["x-api-key"] = this.apiKey;
    }

    let requestBody: string | undefined;
    if (options.body !== undefined) {
      reqHeaders["Content-Type"] = "application/json";
      requestBody = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      const startTime = Date.now();
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

      try {
        const response = await this.fetchImpl(url, {
          method,
          headers: reqHeaders,
          body: requestBody,
          signal: controller?.signal,
        });

        if (timeoutId) clearTimeout(timeoutId);

        const latencyMs = Date.now() - startTime;
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          responseHeaders[key.toLowerCase()] = val;
        });

        const serverRequestId = responseHeaders["x-osterdops-request-id"] || responseHeaders["x-request-id"] || requestId;

        // Parse response body
        let json: Record<string, unknown> | null = null;
        const text = await response.text();
        if (text) {
          try {
            json = JSON.parse(text);
          } catch {
            // Non-JSON response
          }
        }

        if (response.ok) {
          // Unwrap standard OsterdOps envelope { success: true, data: T } if present
          let data: T;
          if (json && typeof json === "object" && "data" in json && json.success === true) {
            data = json.data as T;
          } else if (json !== null) {
            data = json as unknown as T;
          } else {
            data = {} as T;
          }

          return {
            data,
            status: response.status,
            requestId: serverRequestId,
            latencyMs,
            headers: responseHeaders,
          };
        }

        // Response is NOT ok: construct typed OsterdOpsError
        const errorObj = this.mapHttpError(response.status, json, text, serverRequestId, responseHeaders);

        // Determine if error is transient and retryable
        const isTransientStatus = response.status === 429 || response.status >= 500;
        const shouldRetry = isIdempotent && isTransientStatus && attempt < maxRetries;

        if (shouldRetry) {
          attempt++;
          const retryAfterSec = Number(responseHeaders["retry-after"]);
          const backoffMs = !isNaN(retryAfterSec) && retryAfterSec > 0
            ? retryAfterSec * 1000
            : Math.min(10000, 200 * Math.pow(2, attempt) + Math.random() * 100);

          await this.sleep(backoffMs);
          continue;
        }

        throw errorObj;
      } catch (err: unknown) {
        if (timeoutId) clearTimeout(timeoutId);

        if (err instanceof OsterdOpsError) {
          throw err;
        }

        const isAbort = (err as Error)?.name === "AbortError" || (err as Error)?.message?.includes("aborted");
        const formattedErr = isAbort
          ? new TimeoutError(`Request to OsterdOps timed out after ${timeoutMs}ms.`, { requestId })
          : new NetworkError((err as Error)?.message || "Network communication failed.", { requestId });

        lastError = formattedErr;

        if (isIdempotent && attempt < maxRetries) {
          attempt++;
          const backoffMs = Math.min(8000, 250 * Math.pow(2, attempt) + Math.random() * 100);
          await this.sleep(backoffMs);
          continue;
        }

        throw formattedErr;
      }
    }

    throw lastError || new ServerError("Request failed after retries.", { requestId });
  }

  private mapHttpError(
    status: number,
    json: Record<string, unknown> | null,
    rawText: string,
    requestId: string,
    headers: Record<string, string>
  ): OsterdOpsError {
    const errorBody = json?.error as { code?: string; message?: string; details?: unknown } | undefined;
    const code = errorBody?.code || json?.code as string || (status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : "API_ERROR");
    const message = errorBody?.message || json?.message as string || rawText || `HTTP Error ${status}`;
    const details = errorBody?.details || json?.details;

    const retryAfter = Number(headers["retry-after"]);
    const retryAfterMs = !isNaN(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : undefined;

    const errorDetails = {
      status,
      code,
      requestId,
      retryAfterMs,
      details,
    };

    if (status === 401) {
      return new AuthenticationError(message, errorDetails);
    }
    if (status === 403) {
      if (code === "ENTITLEMENT_EXCEEDED") {
        return new EntitlementExceededError(message, errorDetails);
      }
      return new AuthorizationError(message, errorDetails);
    }
    if (status === 400) {
      return new ValidationError(message, errorDetails);
    }
    if (status === 404) {
      return new NotFoundError(message, errorDetails);
    }
    if (status === 409) {
      if (code === "IDEMPOTENCY_CONFLICT") {
        return new IdempotencyConflictError(message, errorDetails);
      }
      return new ConflictError(message, errorDetails);
    }
    if (status === 429) {
      if (code === "BUDGET_EXCEEDED") {
        return new BudgetExceededError(message, errorDetails);
      }
      return new RateLimitError(message, errorDetails);
    }
    if (status === 502 || code.startsWith("PROVIDER_")) {
      const provider = (details as { provider?: string })?.provider;
      return new ProviderError(message, { ...errorDetails, provider });
    }
    if (status === 504 || code === "TIMEOUT") {
      return new TimeoutError(message, errorDetails);
    }
    if (status >= 500) {
      return new ServerError(message, errorDetails);
    }

    return new OsterdOpsError(message, errorDetails);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

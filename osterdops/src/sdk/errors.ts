/**
 * OsterdOps TypeScript SDK — Typed Error Hierarchy
 * Strictly sanitizes error messages and metadata to prevent secret or prompt leaks.
 */

export interface OsterdOpsErrorDetails {
  status: number;
  code: string;
  requestId?: string;
  retryable?: boolean;
  retryAfterMs?: number;
  details?: unknown;
}

/**
 * Base error class for all OsterdOps SDK exceptions.
 */
export class OsterdOpsError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly requestId?: string;
  public readonly retryable: boolean;
  public readonly retryAfterMs?: number;
  public readonly details?: unknown;

  constructor(message: string, info: OsterdOpsErrorDetails) {
    // Sanitize any raw tokens or secrets if accidentally present in message
    const sanitizedMessage = sanitizeErrorString(message);
    super(sanitizedMessage);
    this.name = "OsterdOpsError";
    this.status = info.status;
    this.code = info.code;
    this.requestId = info.requestId;
    this.retryable = info.retryable ?? false;
    this.retryAfterMs = info.retryAfterMs;
    this.details = info.details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 401 Unauthorized — Invalid, expired, or missing OsterdOps API key.
 */
export class AuthenticationError extends OsterdOpsError {
  constructor(message = "Invalid or expired OsterdOps API key.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 401,
      code: "AUTHENTICATION_FAILED",
      retryable: false,
      ...info,
    });
    this.name = "AuthenticationError";
  }
}

/**
 * 403 Forbidden — Insufficient RBAC permissions or project access denied.
 */
export class AuthorizationError extends OsterdOpsError {
  constructor(message = "Insufficient permissions to perform this operation.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 403,
      code: "AUTHORIZATION_FAILED",
      retryable: false,
      ...info,
    });
    this.name = "AuthorizationError";
  }
}

/**
 * 400 Bad Request — Invalid parameters, missing required fields, or malformed schema.
 */
export class ValidationError extends OsterdOpsError {
  constructor(message = "Invalid request payload or query parameters.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 400,
      code: "VALIDATION_ERROR",
      retryable: false,
      ...info,
    });
    this.name = "ValidationError";
  }
}

/**
 * 429 Rate Limited — Request quota or rate limit exceeded.
 */
export class RateLimitError extends OsterdOpsError {
  constructor(message = "OsterdOps API rate limit exceeded.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 429,
      code: "RATE_LIMITED",
      retryable: true,
      ...info,
    });
    this.name = "RateLimitError";
  }
}

/**
 * 429 Budget Exceeded — Spend limit reached under HARD budget enforcement policy.
 */
export class BudgetExceededError extends OsterdOpsError {
  constructor(message = "Project or organization budget limit exceeded.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 429,
      code: "BUDGET_EXCEEDED",
      retryable: false,
      ...info,
    });
    this.name = "BudgetExceededError";
  }
}

/**
 * 404 Not Found — Resource not found.
 */
export class NotFoundError extends OsterdOpsError {
  constructor(message = "Requested OsterdOps resource not found.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 404,
      code: "NOT_FOUND",
      retryable: false,
      ...info,
    });
    this.name = "NotFoundError";
  }
}

/**
 * 409 Conflict — Resource already exists (e.g. slug collision).
 */
export class ConflictError extends OsterdOpsError {
  constructor(message = "A resource with this identifier already exists.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 409,
      code: "CONFLICT",
      retryable: false,
      ...info,
    });
    this.name = "ConflictError";
  }
}

/**
 * 409 Idempotency Conflict — Same key used with different request body.
 */
export class IdempotencyConflictError extends OsterdOpsError {
  constructor(message = "Idempotency key was previously used with a different request payload.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 409,
      code: "IDEMPOTENCY_CONFLICT",
      retryable: false,
      ...info,
    });
    this.name = "IdempotencyConflictError";
  }
}

/**
 * 403 Entitlement Exceeded — Plan quota or feature limit reached.
 */
export class EntitlementExceededError extends OsterdOpsError {
  constructor(message = "Plan quota or feature limit exceeded. Please upgrade subscription.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 403,
      code: "ENTITLEMENT_EXCEEDED",
      retryable: false,
      ...info,
    });
    this.name = "EntitlementExceededError";
  }
}

/**
 * 502 Upstream AI Provider Error — Upstream AI provider (OpenAI/Anthropic/Gemini/Azure/Bedrock) failure.
 */
export class ProviderError extends OsterdOpsError {
  public readonly provider?: string;

  constructor(message = "Upstream AI provider error occurred.", info?: Partial<OsterdOpsErrorDetails> & { provider?: string }) {
    super(message, {
      status: info?.status || 502,
      code: info?.code || "PROVIDER_ERROR",
      retryable: info?.retryable ?? true,
      ...info,
    });
    this.name = "ProviderError";
    this.provider = info?.provider;
  }
}

/**
 * Request Timeout or Network Abort (504 or fetch timeout)
 */
export class TimeoutError extends OsterdOpsError {
  constructor(message = "Request timed out before receiving a response.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 504,
      code: "TIMEOUT",
      retryable: true,
      ...info,
    });
    this.name = "TimeoutError";
  }
}

/**
 * Network Communication Error (DNS failure, connection reset, offline)
 */
export class NetworkError extends OsterdOpsError {
  constructor(message = "Failed to establish network connection to OsterdOps API.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 0,
      code: "NETWORK_ERROR",
      retryable: true,
      ...info,
    });
    this.name = "NetworkError";
  }
}

/**
 * 500 Internal Server Error
 */
export class ServerError extends OsterdOpsError {
  constructor(message = "An unexpected server error occurred on OsterdOps.", info?: Partial<OsterdOpsErrorDetails>) {
    super(message, {
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      retryable: true,
      ...info,
    });
    this.name = "ServerError";
  }
}

/**
 * Redacts potential secrets, auth tokens, and key hashes from string payloads.
 */
function sanitizeErrorString(str: string): string {
  if (!str) return "";
  return str
    .replace(/osk_(live|test)_[a-zA-Z0-9_-]{8,64}/g, "[REDACTED_API_KEY]")
    .replace(/sk-(ant|proj)-[a-zA-Z0-9_-]{8,64}/g, "[REDACTED_PROVIDER_KEY]")
    .replace(/Bearer\s+[a-zA-Z0-9._-]{10,}/gi, "Bearer [REDACTED_TOKEN]");
}

/**
 * OsterdOps — Standard API Error Engine (Phase 18)
 * Canonical error definitions, typed domain exceptions, and sanitized JSON serializations.
 */

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "BUDGET_EXCEEDED"
  | "ENTITLEMENT_EXCEEDED"
  | "IDEMPOTENCY_CONFLICT"
  | "UNSUPPORTED_VERSION"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
  retryAfterSeconds?: number;
}

export interface StandardErrorEnvelope {
  success: false;
  error: ApiErrorPayload;
}

/**
 * Sanitizes error messages by redacting tokens, keys, and credentials.
 */
function sanitizeErrorMessage(msg: string): string {
  if (!msg) return "";
  return msg
    .replace(/osk_(live|test)_[a-zA-Z0-9_-]{8,64}/g, "[REDACTED_API_KEY]")
    .replace(/sk-(ant|proj)-[a-zA-Z0-9_-]{8,64}/g, "[REDACTED_PROVIDER_KEY]")
    .replace(/Bearer\s+[a-zA-Z0-9._-]{10,}/gi, "Bearer [REDACTED_TOKEN]");
}

/**
 * Base Enterprise API Error Class.
 */
export class StandardApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly requestId?: string;
  public readonly details?: Record<string, unknown>;
  public readonly retryAfterSeconds?: number;

  constructor(
    code: ApiErrorCode,
    message: string,
    statusCode: number,
    options?: {
      requestId?: string;
      details?: Record<string, unknown>;
      retryAfterSeconds?: number;
    }
  ) {
    super(sanitizeErrorMessage(message));
    this.name = "StandardApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.requestId = options?.requestId;
    this.details = options?.details;
    this.retryAfterSeconds = options?.retryAfterSeconds;
  }

  /**
   * Produces the canonical JSON representation of the error.
   */
  toJSON(): StandardErrorEnvelope {
    const errorBody: ApiErrorPayload = {
      code: this.code,
      message: this.message,
    };

    if (this.requestId) {
      errorBody.requestId = this.requestId;
    }

    if (this.details && Object.keys(this.details).length > 0) {
      errorBody.details = this.details;
    }

    if (this.retryAfterSeconds !== undefined) {
      errorBody.retryAfterSeconds = this.retryAfterSeconds;
    }

    return {
      success: false,
      error: errorBody,
    };
  }
}

// -----------------------------------------------------------------------------
// Concrete Domain Errors
// -----------------------------------------------------------------------------

export class BadRequestError extends StandardApiError {
  constructor(message = "Invalid request payload or parameters", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("BAD_REQUEST", message, 400, options);
  }
}

export class UnauthorizedError extends StandardApiError {
  constructor(message = "Authentication required or invalid credentials", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("UNAUTHORIZED", message, 401, options);
  }
}

export class ForbiddenError extends StandardApiError {
  constructor(message = "Insufficient permissions to perform this operation", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("FORBIDDEN", message, 403, options);
  }
}

export class NotFoundError extends StandardApiError {
  constructor(message = "The requested resource was not found", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("NOT_FOUND", message, 404, options);
  }
}

export class ConflictError extends StandardApiError {
  constructor(message = "Resource state conflict occurred", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("CONFLICT", message, 409, options);
  }
}

export class ValidationError extends StandardApiError {
  constructor(message = "Validation failed for request parameters", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("VALIDATION_ERROR", message, 400, options);
  }
}

export class RateLimitedError extends StandardApiError {
  constructor(message = "Rate limit exceeded. Please apply exponential backoff.", options?: { requestId?: string; details?: Record<string, unknown>; retryAfterSeconds?: number }) {
    super("RATE_LIMITED", message, 429, options);
  }
}

export class BudgetExceededError extends StandardApiError {
  constructor(message = "Monthly spend ceiling exceeded under HARD budget enforcement.", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("BUDGET_EXCEEDED", message, 429, options);
  }
}

export class EntitlementExceededError extends StandardApiError {
  constructor(message = "Plan quota or feature limit exceeded. Please upgrade subscription.", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("ENTITLEMENT_EXCEEDED", message, 403, options);
  }
}

export class IdempotencyConflictError extends StandardApiError {
  constructor(message = "Idempotency key was previously used with a different request payload.", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("IDEMPOTENCY_CONFLICT", message, 409, options);
  }
}

export class UnsupportedVersionError extends StandardApiError {
  constructor(message = "The requested API version is not supported.", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("UNSUPPORTED_VERSION", message, 400, options);
  }
}

export class ServiceUnavailableError extends StandardApiError {
  constructor(message = "Service is temporarily unavailable. Please retry shortly.", options?: { requestId?: string; details?: Record<string, unknown>; retryAfterSeconds?: number }) {
    super("SERVICE_UNAVAILABLE", message, 503, options);
  }
}

export class InternalServerError extends StandardApiError {
  constructor(message = "An internal server error occurred.", options?: { requestId?: string; details?: Record<string, unknown> }) {
    super("INTERNAL_ERROR", message, 500, options);
  }
}

/**
 * Unit Tests — Standard API Error Engine & Sanitization
 */

import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitedError,
  BudgetExceededError,
  EntitlementExceededError,
  IdempotencyConflictError,
  UnsupportedVersionError,
  ServiceUnavailableError,
  InternalServerError,
} from "@/lib/api/errors";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runApiErrorsTests() {
  // 1. Status code and error code mapping
  const badReq = new BadRequestError("Invalid payload", { requestId: "req_001" });
  assert(badReq.statusCode === 400, "BadRequestError must have status 400.");
  assert(badReq.code === "BAD_REQUEST", "BadRequestError must have code BAD_REQUEST.");
  assert(badReq.requestId === "req_001", "Request ID must be attached.");

  const unauth = new UnauthorizedError("Bad key", { requestId: "req_002" });
  assert(unauth.statusCode === 401, "UnauthorizedError must have status 401.");

  const forbidden = new ForbiddenError("Forbidden action");
  assert(forbidden.statusCode === 403, "ForbiddenError must have status 403.");

  const notFound = new NotFoundError("Project not found");
  assert(notFound.statusCode === 404, "NotFoundError must have status 404.");

  const conflict = new ConflictError("Slug collision");
  assert(conflict.statusCode === 409, "ConflictError must have status 409.");

  const valErr = new ValidationError("Field required");
  assert(valErr.statusCode === 400, "ValidationError must have status 400.");

  const rateLimit = new RateLimitedError("Too many calls", { retryAfterSeconds: 10 });
  assert(rateLimit.statusCode === 429, "RateLimitedError must have status 429.");
  assert(rateLimit.retryAfterSeconds === 10, "RetryAfter must be set.");

  const budgetErr = new BudgetExceededError("Spend cap reached");
  assert(budgetErr.statusCode === 429, "BudgetExceededError must have status 429.");

  const entitlementErr = new EntitlementExceededError("Feature not in plan");
  assert(entitlementErr.statusCode === 403, "EntitlementExceededError must have status 403.");

  const idempConflict = new IdempotencyConflictError("Payload mismatch");
  assert(idempConflict.statusCode === 409, "IdempotencyConflictError must have status 409.");

  const unsuppVersion = new UnsupportedVersionError("v99 not supported");
  assert(unsuppVersion.statusCode === 400, "UnsupportedVersionError must have status 400.");

  const svcUnavail = new ServiceUnavailableError("Outage", { retryAfterSeconds: 30 });
  assert(svcUnavail.statusCode === 503, "ServiceUnavailableError must have status 503.");

  const internalErr = new InternalServerError("Crash");
  assert(internalErr.statusCode === 500, "InternalServerError must have status 500.");

  // 2. Canonical toJSON serialization
  const serialized = badReq.toJSON();
  assert(serialized.success === false, "Serialized envelope must have success=false.");
  assert(serialized.error.code === "BAD_REQUEST", "Code must match.");
  assert(serialized.error.requestId === "req_001", "RequestId must match.");

  // 3. Secret sanitization in error message
  const leakErr = new BadRequestError("Error with osk_live_1234567890abcdef and sk-proj-1234567890abcdef");
  assert(!leakErr.message.includes("osk_live_1234567890abcdef"), "Must redact OsterdOps secret.");
  assert(!leakErr.message.includes("sk-proj-1234567890abcdef"), "Must redact provider secret.");
  assert(leakErr.message.includes("[REDACTED_API_KEY]"), "Must replace with placeholder.");
}

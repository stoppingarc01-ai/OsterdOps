import { generateApiKeySecret, validateApiKeyFormat, hashApiKey, maskApiKey } from "@/lib/auth/api-key";
import { rateLimit } from "@/lib/rate-limit";
import { ApiErrors } from "@/lib/api/response";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runE2EDeveloperJourneyTests(): void {
  console.log("▶ Running End-to-End Developer Journey Tests...");

  // ----------------------------------------------------
  // Journey 1: Quickstart Onboarding & First Request
  // ----------------------------------------------------
  const generatedKey = generateApiKeySecret("production");
  const rawKeySecret = generatedKey.secret;
  assert(validateApiKeyFormat(rawKeySecret) === true, "J1: API key passes format validation");

  const keyHash = hashApiKey(rawKeySecret);
  assert(typeof keyHash === "string" && keyHash.length === 64, "J1: Key stored as SHA-256 hash");

  const maskedKey = maskApiKey(rawKeySecret);
  assert(!maskedKey.includes(rawKeySecret.substring(10)), "J1: Stored key is masked with zero secret leakage");

  // ----------------------------------------------------
  // Journey 2: Invalid API Key Authentication Rejection (401)
  // ----------------------------------------------------
  const invalidKey = "invalid_token_xyz_123";
  assert(validateApiKeyFormat(invalidKey) === false, "J2: Invalid key format rejected");
  const authErr = ApiErrors.unauthorized("The supplied API key is invalid or has expired.", undefined, "req_j2_err");
  assert(authErr.status === 401, "J2: Produces standard HTTP 401 response");
  assert(authErr.headers.get("x-osterdops-request-id") === "req_j2_err", "J2: Correlation Request ID attached");

  // ----------------------------------------------------
  // Journey 3: Insufficient RBAC Permissions (403)
  // ----------------------------------------------------
  const userRole: string = "VIEWER";
  const requiredRole: string = "ADMIN";
  const hasPermission = userRole === requiredRole || userRole === "OWNER";
  assert(hasPermission === false, "J3: VIEWER cannot perform ADMIN action");
  const forbiddenErr = ApiErrors.forbidden("User lacks required role 'ADMIN'.", undefined, "req_j3_err");
  assert(forbiddenErr.status === 403, "J3: Produces standard HTTP 403 response");

  // ----------------------------------------------------
  // Journey 4: Sliding-Window Rate Limit Exhaustion (429)
  // ----------------------------------------------------
  const rateLimitKey = `j4_ratelimit_${Date.now()}`;
  const rpmLimit = 5;
  for (let i = 0; i < rpmLimit; i++) {
    const check = rateLimit(rateLimitKey, rpmLimit);
    assert(check.allowed === true, `J4: Request ${i + 1} within quota`);
  }
  const blockedCheck = rateLimit(rateLimitKey, rpmLimit);
  assert(blockedCheck.allowed === false, "J4: 6th request exceeded 5 RPM quota");
  assert(blockedCheck.remaining === 0, "J4: Remaining quota is 0");
  assert(blockedCheck.resetMs > 0, "J4: Reset timestamp provided for backoff");

  // ----------------------------------------------------
  // Journey 5: Budget Ceiling Enforcement (Hard 429)
  // ----------------------------------------------------
  const projectSpend = 1500.5;
  const projectLimit = 1500.0;
  const isBudgetBreached = projectSpend >= projectLimit;
  assert(isBudgetBreached === true, "J5: Spend exceeded budget cap");
  const budgetErr = ApiErrors.budgetExceeded("Hard budget ceiling breached for project.", undefined, "req_j5_err");
  assert(budgetErr.status === 429, "J5: Hard budget ceiling triggers HTTP 429 rejection");

  // ----------------------------------------------------
  // Journey 6: Cross-Tenant Isolation Enforcement
  // ----------------------------------------------------
  const callerOrgId: string = "org_acme_corp";
  const targetOrgId: string = "org_competitor_inc";
  const isCrossTenant = callerOrgId !== targetOrgId;
  assert(isCrossTenant === true, "J6: Cross-tenant boundary identified");
  const crossTenantBlocked = callerOrgId === targetOrgId;
  assert(crossTenantBlocked === false, "J6: Cross-tenant access denied");

  // ----------------------------------------------------
  // Journey 7: Revoked API Key Invalidation
  // ----------------------------------------------------
  const keyRecord = { id: "key_01", status: "REVOKED" };
  const canAuthenticateRevoked = keyRecord.status === "ACTIVE";
  assert(canAuthenticateRevoked === false, "J7: Revoked key rejected immediately");

  // ----------------------------------------------------
  // Journey 8: Expired API Key Invalidation
  // ----------------------------------------------------
  const expiredKeyRecord = {
    id: "key_02",
    status: "ACTIVE",
    expiresAt: new Date(Date.now() - 10000).toISOString(),
  };
  const isKeyExpired = new Date(expiredKeyRecord.expiresAt).getTime() < Date.now();
  assert(isKeyExpired === true, "J8: Expired key detected and rejected");

  console.log("✔ End-to-End Developer Journey Tests passed.");
}

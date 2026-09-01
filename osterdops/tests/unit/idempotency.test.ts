/**
 * Unit Tests — Enterprise Idempotency Engine & Collision Detection
 */

import {
  extractIdempotencyKey,
  computeRequestFingerprint,
  checkIdempotency,
  saveIdempotencyResult,
  clearIdempotencyCache,
} from "@/lib/api/idempotency";
import { IdempotencyConflictError } from "@/lib/api/errors";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runIdempotencyTests() {
  clearIdempotencyCache();

  // 1. Header extraction
  const headers = new Headers();
  headers.set("Idempotency-Key", "idemp_test_001");
  assert(extractIdempotencyKey(headers) === "idemp_test_001", "Must extract Idempotency-Key.");

  const customObj = { "x-idempotency-key": "idemp_custom_002" };
  assert(extractIdempotencyKey(customObj) === "idemp_custom_002", "Must extract x-idempotency-key.");

  // 2. Deterministic fingerprinting
  const orgId = "org_idemp_tenant_1";
  const endpoint = "/api/v1/projects";
  const body1 = { name: "Project Alpha", spendLimitMonthly: 100 };
  const body2 = { name: "Project Beta", spendLimitMonthly: 200 };

  const hash1a = computeRequestFingerprint(orgId, endpoint, body1);
  const hash1b = computeRequestFingerprint(orgId, endpoint, body1);
  const hash2 = computeRequestFingerprint(orgId, endpoint, body2);

  assert(hash1a === hash1b, "Fingerprint for identical payload must be equal.");
  assert(hash1a !== hash2, "Fingerprint for different payload must differ.");

  // 3. First execution -> record starts as processing
  const key = "key_test_alpha";
  const state1 = await checkIdempotency(orgId, endpoint, key, body1);
  assert(state1.replayed === false, "First request must not be replayed.");

  // Save successful response
  await saveIdempotencyResult(orgId, endpoint, key, 201, { id: "proj_created_123", name: "Project Alpha" });

  // 4. Duplicate request with identical payload -> replayed!
  const state2 = await checkIdempotency(orgId, endpoint, key, body1);
  assert(state2.replayed === true, "Duplicate request with identical payload must be replayed.");
  assert(state2.record?.statusCode === 201, "Replayed record status must be 201.");

  // 5. Duplicate request with DIFFERENT payload -> IdempotencyConflictError (409)
  let threwConflict = false;
  try {
    await checkIdempotency(orgId, endpoint, key, body2);
  } catch (err) {
    threwConflict = true;
    assert(err instanceof IdempotencyConflictError, "Must throw IdempotencyConflictError on payload mismatch.");
  }
  assert(threwConflict, "Must throw on idempotency key collision.");

  // 6. Tenant isolation: Same key under different organization must not collide
  const otherOrgId = "org_idemp_tenant_2";
  const stateOtherOrg = await checkIdempotency(otherOrgId, endpoint, key, body1);
  assert(stateOtherOrg.replayed === false, "Other tenant must not be affected by key in first tenant.");
}

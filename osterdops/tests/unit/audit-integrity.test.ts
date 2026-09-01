/**
 * OsterdOps — Phase 15: Tamper-Evident Audit Log Integrity Unit Tests
 */

import {
  GENESIS_HASH,
  computeAuditRecordHash,
  verifyAuditChain,
} from "@/lib/security/audit-integrity";
import type { TamperEvidentAuditRecord } from "@/types";

export function testAuditChainIntegrity() {
  const salt = "test_audit_secret_salt";
  const orgId = "org_audit_test";

  // 1. Build a valid 3-record chain
  const r1Base = {
    id: "aud_1",
    organizationId: orgId,
    actorId: "usr_alice",
    action: "API_KEY_CREATED",
    resourceType: "apiKey",
    resourceId: "key_1",
    timestamp: "2026-08-29T10:00:00.000Z",
    result: "SUCCESS" as const,
    sequenceNumber: 1,
    previousHash: GENESIS_HASH,
  };
  const r1: TamperEvidentAuditRecord = {
    ...r1Base,
    currentHash: computeAuditRecordHash(GENESIS_HASH, r1Base, salt),
  };

  const r2Base = {
    id: "aud_2",
    organizationId: orgId,
    actorId: "usr_alice",
    action: "BUDGET_CREATED",
    resourceType: "budget",
    resourceId: "bud_1",
    timestamp: "2026-08-29T10:05:00.000Z",
    result: "SUCCESS" as const,
    sequenceNumber: 2,
    previousHash: r1.currentHash,
  };
  const r2: TamperEvidentAuditRecord = {
    ...r2Base,
    currentHash: computeAuditRecordHash(r1.currentHash, r2Base, salt),
  };

  const r3Base = {
    id: "aud_3",
    organizationId: orgId,
    actorId: "usr_bob",
    action: "SECURITY_CONFIGURATION_CHANGED",
    resourceType: "securitySettings",
    resourceId: "security",
    timestamp: "2026-08-29T10:10:00.000Z",
    result: "SUCCESS" as const,
    sequenceNumber: 3,
    previousHash: r2.currentHash,
  };
  const r3: TamperEvidentAuditRecord = {
    ...r3Base,
    currentHash: computeAuditRecordHash(r2.currentHash, r3Base, salt),
  };

  const validChain = [r1, r2, r3];

  // Verify valid chain
  const validResult = verifyAuditChain(validChain, salt);
  if (!validResult.valid || validResult.tamperedRecordIds.length > 0) {
    throw new Error(`Valid audit chain was rejected: ${validResult.details}`);
  }

  // 2. Tamper test: Modify record #2 action without updating hash
  const tamperedR2 = {
    ...r2,
    action: "MALICIOUS_UNAUTHORIZED_ACTION",
  };
  const tamperedChain = [r1, tamperedR2, r3];
  const tamperedResult = verifyAuditChain(tamperedChain, salt);

  if (tamperedResult.valid || !tamperedResult.tamperedRecordIds.includes("aud_2")) {
    throw new Error("Tampered audit record was not detected.");
  }

  // 3. Deletion test: Remove record #2 (break chain between r1 and r3)
  const brokenChain = [r1, r3];
  const brokenResult = verifyAuditChain(brokenChain, salt);

  if (brokenResult.valid || !brokenResult.tamperedRecordIds.includes("aud_3")) {
    throw new Error("Deleted audit record / broken chain was not detected.");
  }
}

export function runAuditIntegrityTests() {
  testAuditChainIntegrity();
}

/**
 * OsterdOps — Cryptographic Audit Log Integrity & Hash Chaining (Phase 15)
 * Implements tamper-evident audit records using deterministic SHA-256 hash chaining.
 */

import crypto from "crypto";
import type { TamperEvidentAuditRecord, AuditVerificationResult } from "@/types";

export const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Deterministically serializes record fields for canonical hashing.
 */
export function canonicalizeAuditPayload(record: Partial<TamperEvidentAuditRecord>): string {
  const fields = {
    id: record.id || "",
    organizationId: record.organizationId || "",
    actorId: record.actorId || "",
    action: record.action || "",
    resourceType: record.resourceType || "",
    resourceId: record.resourceId || "",
    timestamp: record.timestamp || "",
    requestId: record.requestId || "",
    result: record.result || "SUCCESS",
    reasonCode: record.reasonCode || "",
    sequenceNumber: record.sequenceNumber || 1,
    details: record.details || {},
  };

  return JSON.stringify(fields, Object.keys(fields).sort());
}

/**
 * Computes the cryptographic currentHash for an audit record linked to previousHash.
 */
export function computeAuditRecordHash(
  previousHash: string,
  record: Partial<TamperEvidentAuditRecord>,
  salt?: string
): string {
  const canonical = canonicalizeAuditPayload(record);
  const secret = salt || process.env.ENCRYPTION_KEY || "osterdops_audit_chain_salt_2026";
  return crypto
    .createHmac("sha256", secret)
    .update(`${previousHash}:${canonical}`)
    .digest("hex");
}

/**
 * Verifies an ordered array of audit records to detect modifications, deletions, or broken chains.
 */
export function verifyAuditChain(
  records: TamperEvidentAuditRecord[],
  salt?: string
): AuditVerificationResult {
  if (records.length === 0) {
    return {
      valid: true,
      totalRecords: 0,
      tamperedRecordIds: [],
      details: "Audit log chain is empty and valid.",
    };
  }

  const tamperedRecordIds: string[] = [];
  let brokenChainIndex: number | undefined;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const expectedPrevHash = i === 0 ? GENESIS_HASH : records[i - 1].currentHash;

    // 1. Check previous hash link
    if (record.previousHash !== expectedPrevHash) {
      tamperedRecordIds.push(record.id);
      if (brokenChainIndex === undefined) brokenChainIndex = i;
      continue;
    }

    // 2. Recompute current hash
    const computedHash = computeAuditRecordHash(record.previousHash, record, salt);
    if (record.currentHash !== computedHash) {
      tamperedRecordIds.push(record.id);
      if (brokenChainIndex === undefined) brokenChainIndex = i;
    }
  }

  const isValid = tamperedRecordIds.length === 0;

  return {
    valid: isValid,
    totalRecords: records.length,
    tamperedRecordIds,
    brokenChainIndex,
    details: isValid
      ? `Audit chain of ${records.length} records is intact and mathematically valid.`
      : `Audit chain integrity failure detected in ${tamperedRecordIds.length} records.`,
  };
}

/**
 * OsterdOps — Phase 15: Data Retention Policy Unit Tests
 */

import {
  getRetentionPolicy,
  evaluateRetentionEligibility,
} from "@/lib/security/retention";

export function testDataRetentionEngine() {
  // 1. Policy inspection
  const billingPolicy = getRetentionPolicy("BILLING");
  if (!billingPolicy.legalHold || !billingPolicy.protectedFromDeletion || billingPolicy.retentionDays !== 2555) {
    throw new Error("BILLING retention policy must have 7-year legal hold and deletion protection.");
  }

  const auditPolicy = getRetentionPolicy("AUDIT");
  if (!auditPolicy.protectedFromDeletion || auditPolicy.retentionDays !== 1095) {
    throw new Error("AUDIT retention policy must have 3-year deletion protection.");
  }

  // 2. Evaluation on protected category (never eligible for automatic deletion)
  const now = new Date("2026-08-29T10:00:00.000Z");
  const oldBillingCreated = "2015-01-01T00:00:00.000Z";
  const billingEval = evaluateRetentionEligibility("BILLING", "inv_123", oldBillingCreated, now);
  if (billingEval.eligibleForDeletion) {
    throw new Error("Protected BILLING record must never be marked eligible for generic deletion.");
  }

  // 3. Evaluation on operational category (eligible after 90 days)
  const oldOperational = "2026-01-01T00:00:00.000Z"; // ~240 days old
  const opEval = evaluateRetentionEligibility("OPERATIONAL", "log_123", oldOperational, now);
  if (!opEval.eligibleForDeletion) {
    throw new Error("Operational record older than 90 days should be eligible for deletion.");
  }

  const recentOperational = "2026-08-20T00:00:00.000Z"; // 9 days old
  const recentOpEval = evaluateRetentionEligibility("OPERATIONAL", "log_456", recentOperational, now);
  if (recentOpEval.eligibleForDeletion) {
    throw new Error("Recent operational record should NOT be eligible for deletion.");
  }
}

export function runRetentionTests() {
  testDataRetentionEngine();
}

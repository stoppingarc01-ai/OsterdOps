/**
 * OsterdOps — Enterprise Data Retention Engine (Phase 15)
 * Configures deterministic data retention rules and deletion protection across compliance categories.
 */

import type { RetentionCategory, RetentionPolicy, RetentionEvaluationResult } from "@/types";

export const DEFAULT_RETENTION_POLICIES: Record<RetentionCategory, RetentionPolicy> = {
  SECURITY: {
    category: "SECURITY",
    retentionDays: 365,
    legalHold: false,
    protectedFromDeletion: true,
  },
  OPERATIONAL: {
    category: "OPERATIONAL",
    retentionDays: 90,
    legalHold: false,
    protectedFromDeletion: false,
  },
  ANALYTICS: {
    category: "ANALYTICS",
    retentionDays: 730,
    legalHold: false,
    protectedFromDeletion: false,
  },
  BILLING: {
    category: "BILLING",
    retentionDays: 2555, // 7-year financial & statutory compliance
    legalHold: true,
    protectedFromDeletion: true,
  },
  AUDIT: {
    category: "AUDIT",
    retentionDays: 1095, // 3-year immutable compliance audit window
    legalHold: false,
    protectedFromDeletion: true,
  },
  TEMPORARY: {
    category: "TEMPORARY",
    retentionDays: 14,
    legalHold: false,
    protectedFromDeletion: false,
  },
};

export function getRetentionPolicy(category: RetentionCategory): RetentionPolicy {
  return DEFAULT_RETENTION_POLICIES[category] || DEFAULT_RETENTION_POLICIES.OPERATIONAL;
}

export function evaluateRetentionEligibility(
  category: RetentionCategory,
  recordId: string,
  createdAtIso: string,
  referenceDate = new Date()
): RetentionEvaluationResult {
  const policy = getRetentionPolicy(category);
  const createdDate = new Date(createdAtIso);
  const ageMs = referenceDate.getTime() - createdDate.getTime();
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

  // Protected legal/financial records can never be deleted via generic retention sweep
  if (policy.legalHold || policy.protectedFromDeletion) {
    return {
      category,
      recordId,
      createdAt: createdAtIso,
      ageDays,
      eligibleForDeletion: false,
      reason: `Category '${category}' is under statutory protection / legal retention hold.`,
    };
  }

  const eligible = ageDays >= policy.retentionDays;

  return {
    category,
    recordId,
    createdAt: createdAtIso,
    ageDays,
    eligibleForDeletion: eligible,
    reason: eligible
      ? `Record age (${ageDays} days) exceeds retention threshold (${policy.retentionDays} days).`
      : `Record age (${ageDays} days) is within retention threshold (${policy.retentionDays} days).`,
  };
}

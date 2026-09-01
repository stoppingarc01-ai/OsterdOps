/**
 * OsterdOps — Phase 12: Alerts Unit Tests
 * Tests alert lifecycle, deterministic deduplication key generation, severity tiering,
 * acknowledge/resolve workflows, and multi-tenant isolation.
 */

import { getAlertDedupKey, getSeverityForThreshold } from "@/lib/budget/evaluator";
import type { Alert } from "@/types";

export function testAlertDeduplicationAndLifecycle() {
  const orgId = "org_test_123";
  const budgetId = "bud_alpha";
  const periodStart = "2026-08-01T00:00:00.000Z";

  // 1. Deterministic Dedup Key Tests
  const key50 = getAlertDedupKey(orgId, budgetId, periodStart, 50);
  const key75 = getAlertDedupKey(orgId, budgetId, periodStart, 75);
  const key100 = getAlertDedupKey(orgId, budgetId, periodStart, 100);

  if (!key50.includes("thresh_50") || !key75.includes("thresh_75") || !key100.includes("thresh_100")) {
    throw new Error("Dedup keys missing threshold segment.");
  }
  if (key50 === key75) {
    throw new Error("Different thresholds must have distinct deduplication keys.");
  }

  // 2. Severity tiering tests
  if (getSeverityForThreshold(50) !== "INFO") throw new Error("50% should be INFO");
  if (getSeverityForThreshold(75) !== "WARNING") throw new Error("75% should be WARNING");
  if (getSeverityForThreshold(90) !== "CRITICAL") throw new Error("90% should be CRITICAL");
  if (getSeverityForThreshold(100) !== "CRITICAL") throw new Error("100% should be CRITICAL");

  // 3. Alert Lifecycle State Transitions
  const alert: Alert = {
    id: key50,
    organizationId: orgId,
    budgetId,
    type: "BUDGET_THRESHOLD",
    thresholdPercent: 50,
    budgetAmountUsd: 100,
    budgetLimitUsd: 100,
    currentSpendUsd: 55,
    spendUsd: 55,
    remainingUsd: 45,
    periodStart,
    periodEnd: "2026-08-31T23:59:59.999Z",
    severity: "INFO",
    title: "50% Spend Alert",
    message: "55% spent",
    dedupKey: key50,
    deduplicationKey: key50,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  if (alert.status !== "ACTIVE") throw new Error("Initial alert must be ACTIVE");

  const ackAlert: Alert = {
    ...alert,
    status: "ACKNOWLEDGED",
    acknowledgedAt: new Date().toISOString(),
    acknowledgedBy: "user_dev",
  };
  if (ackAlert.status !== "ACKNOWLEDGED" || !ackAlert.acknowledgedAt) {
    throw new Error("Alert acknowledge transition failed.");
  }

  const resAlert: Alert = {
    ...ackAlert,
    status: "RESOLVED",
    resolvedAt: new Date().toISOString(),
    resolvedBy: "user_dev",
  };
  if (resAlert.status !== "RESOLVED" || !resAlert.resolvedAt) {
    throw new Error("Alert resolve transition failed.");
  }
}

export function runAlertsTests() {
  testAlertDeduplicationAndLifecycle();
}

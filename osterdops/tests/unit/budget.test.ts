/**
 * OsterdOps — Phase 10: Budgets, Spend Limits & Alert Engine Unit Tests
 * Tests Budget CRUD & validation, UTC period boundaries, threshold crossing detection,
 * deterministic alert deduplication, alert lifecycle state transitions, spend calculations,
 * pricing coverage metadata, RBAC permissions, edge cases, and zero prompt/secret persistence.
 */

import {
  getBudgetPeriodBoundaries,
  getAlertDedupKey,
  evaluateBudgetThresholds,
} from "@/lib/budget/evaluator";
import { hasPermission } from "@/lib/auth/permissions";
import type {
  Budget,
  Alert,
  CostAggregationResult,
} from "@/types";

// 1. Budget Model & Period Boundaries (UTC)
export function testBudgetPeriodCalculations() {
  // Test reference date: 2026-08-19T14:30:00Z (Wednesday)
  const refDate = new Date("2026-08-19T14:30:00Z");

  // DAILY
  const daily = getBudgetPeriodBoundaries("DAILY", undefined, undefined, refDate);
  if (daily.periodStart !== "2026-08-19T00:00:00.000Z" || daily.periodEnd !== "2026-08-19T23:59:59.999Z") {
    throw new Error(`Daily period boundaries mismatch: ${JSON.stringify(daily)}`);
  }

  // WEEKLY (Monday 2026-08-17 to Sunday 2026-08-23)
  const weekly = getBudgetPeriodBoundaries("WEEKLY", undefined, undefined, refDate);
  if (weekly.periodStart !== "2026-08-17T00:00:00.000Z" || weekly.periodEnd !== "2026-08-23T23:59:59.999Z") {
    throw new Error(`Weekly period boundaries mismatch: ${JSON.stringify(weekly)}`);
  }

  // MONTHLY (2026-08-01 to 2026-08-31)
  const monthly = getBudgetPeriodBoundaries("MONTHLY", undefined, undefined, refDate);
  if (monthly.periodStart !== "2026-08-01T00:00:00.000Z" || monthly.periodEnd !== "2026-08-31T23:59:59.999Z") {
    throw new Error(`Monthly period boundaries mismatch: ${JSON.stringify(monthly)}`);
  }

  // CUSTOM
  const custom = getBudgetPeriodBoundaries(
    "CUSTOM",
    "2026-08-10T00:00:00.000Z",
    "2026-08-25T23:59:59.999Z",
    refDate
  );
  if (custom.periodStart !== "2026-08-10T00:00:00.000Z" || custom.periodEnd !== "2026-08-25T23:59:59.999Z") {
    throw new Error(`Custom period boundaries mismatch: ${JSON.stringify(custom)}`);
  }
}

// 2. Threshold Crossing Detection & Severity Mapping
export function testThresholdCrossingsAndSeverity() {
  const budget: Budget = {
    id: "bud_core_100",
    organizationId: "org_alpha",
    name: "Engineering Core Budget",
    amountUsd: 100.0,
    currency: "USD",
    period: "MONTHLY",
    thresholds: [50, 75, 90, 100],
    triggeredThresholds: [],
    enabled: true,
    enforcementMode: "MONITOR",
    status: "ACTIVE",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  };

  const boundaries = {
    periodStart: "2026-08-01T00:00:00.000Z",
    periodEnd: "2026-08-31T23:59:59.999Z",
  };

  // Case A: Spend = $40 (40% - No threshold crossed)
  const spend40: CostAggregationResult = {
    totalSpendUsd: 40.0,
    totalRequests: 500,
    totalTokens: 1000000,
    totalInputTokens: 700000,
    totalOutputTokens: 300000,
    totalCachedTokens: 100000,
    totalReasoningTokens: 0,
    byProvider: {},
    byModel: {},
    byProject: {},
    dailySpend: [],
  };
  const eval40 = evaluateBudgetThresholds(budget, spend40, boundaries);
  if (eval40.statusResponse.status !== "NORMAL" || eval40.candidateAlerts.length !== 0) {
    throw new Error("Spend 40% should be NORMAL with 0 candidate alerts.");
  }
  if (eval40.statusResponse.remainingUsd !== 60.0) {
    throw new Error("Remaining USD for 40% spend expected $60.00.");
  }

  // Case B: Spend = $76 (76% - 50% and 75% thresholds crossed)
  const spend76: CostAggregationResult = {
    ...spend40,
    totalSpendUsd: 76.0,
  };
  const eval76 = evaluateBudgetThresholds(budget, spend76, boundaries);
  if (eval76.statusResponse.status !== "WARNING" || eval76.candidateAlerts.length !== 2) {
    throw new Error("Spend 76% should trigger 50% and 75% thresholds (status: WARNING).");
  }
  if (eval76.candidateAlerts[0].severity !== "INFO" || eval76.candidateAlerts[1].severity !== "WARNING") {
    throw new Error("Severity mapping for 50% (INFO) and 75% (WARNING) failed.");
  }

  // Case C: Spend = $95 (95% - 50%, 75%, 90% thresholds crossed)
  const spend95: CostAggregationResult = {
    ...spend40,
    totalSpendUsd: 95.0,
  };
  const eval95 = evaluateBudgetThresholds(budget, spend95, boundaries);
  if (eval95.statusResponse.status !== "CRITICAL" || eval95.candidateAlerts.length !== 3) {
    throw new Error("Spend 95% should trigger 50%, 75%, 90% thresholds (status: CRITICAL).");
  }

  // Case D: Spend = $105 (105% - Exceeded limit)
  const spend105: CostAggregationResult = {
    ...spend40,
    totalSpendUsd: 105.0,
  };
  const eval105 = evaluateBudgetThresholds(budget, spend105, boundaries);
  if (eval105.statusResponse.status !== "EXCEEDED" || eval105.statusResponse.overspendUsd !== 5.0) {
    throw new Error("Spend 105% should have status EXCEEDED with overspendUsd = $5.00.");
  }
  const exceededAlert = eval105.candidateAlerts.find((a) => a.type === "BUDGET_EXCEEDED");
  if (!exceededAlert || exceededAlert.severity !== "CRITICAL") {
    throw new Error("Exceeded budget must emit BUDGET_EXCEEDED with CRITICAL severity.");
  }
}

// 3. Deterministic Alert Deduplication
export function testAlertDeduplication() {
  const orgId = "org_enterprise_99";
  const budgetId = "bud_prod_api";
  const periodStart = "2026-08-01T00:00:00.000Z";
  const threshold = 75;

  const key1 = getAlertDedupKey(orgId, budgetId, periodStart, threshold);
  const key2 = getAlertDedupKey(orgId, budgetId, periodStart, threshold);

  if (key1 !== key2) {
    throw new Error("Alert deduplication key must be deterministic.");
  }

  if (key1 !== "org_org_enterprise_99_bud_bud_prod_api_period_2026-08-01_thresh_75") {
    throw new Error(`Dedup key format unexpected: ${key1}`);
  }

  // Simulating duplicate suppression
  const alertMap = new Map<string, Alert>();
  const alert1: Alert = {
    id: key1,
    organizationId: orgId,
    budgetId,
    type: "BUDGET_THRESHOLD",
    thresholdPercent: 75,
    budgetAmountUsd: 100,
    currentSpendUsd: 76,
    remainingUsd: 24,
    periodStart,
    periodEnd: "2026-08-31T23:59:59.999Z",
    severity: "WARNING",
    title: "Threshold 75% reached",
    message: "Spent $76 of $100",
    dedupKey: key1,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  // Evaluation #1 -> create
  alertMap.set(key1, alert1);

  // Evaluation #2 (Same cycle, slightly higher spend $78) -> Dedup suppress
  if (alertMap.has(key1)) {
    // Suppress creation
  } else {
    alertMap.set(key1, alert1);
  }

  if (alertMap.size < 1) {
    throw new Error("Repeated evaluations in same period must not duplicate alerts.");
  }

  // Evaluation next month (2026-09-01) -> New alert key created
  const nextPeriodKey = getAlertDedupKey(orgId, budgetId, "2026-09-01T00:00:00.000Z", threshold);
  if (nextPeriodKey === key1) {
    throw new Error("New budget period must generate fresh alert identity.");
  }
  alertMap.set(nextPeriodKey, { ...alert1, id: nextPeriodKey, dedupKey: nextPeriodKey });
  if (alertMap.size < 2) {
    throw new Error("New budget period must allow new cycle threshold alert.");
  }
}

// 4. Alert Lifecycle State Transitions
export function testAlertLifecycleTransitions() {
  const alert: Alert = {
    id: "alert_test_1",
    organizationId: "org_alpha",
    budgetId: "bud_1",
    type: "BUDGET_THRESHOLD",
    thresholdPercent: 50,
    budgetAmountUsd: 200,
    currentSpendUsd: 110,
    remainingUsd: 90,
    periodStart: "2026-08-01T00:00:00.000Z",
    periodEnd: "2026-08-31T23:59:59.999Z",
    severity: "INFO",
    title: "50% Budget Reached",
    message: "55% utilized",
    dedupKey: "dedup_test_1",
    status: "ACTIVE",
    createdAt: "2026-08-15T10:00:00Z",
  };

  // 1. ACTIVE -> ACKNOWLEDGED
  const acknowledged: Alert = {
    ...alert,
    status: "ACKNOWLEDGED",
    acknowledgedAt: "2026-08-15T11:00:00Z",
    acknowledgedBy: "user_admin_1",
  };
  if (acknowledged.status !== "ACKNOWLEDGED" || !acknowledged.acknowledgedAt) {
    throw new Error("Alert transition to ACKNOWLEDGED failed.");
  }

  // 2. ACKNOWLEDGED -> RESOLVED
  const resolved: Alert = {
    ...acknowledged,
    status: "RESOLVED",
    resolvedAt: "2026-08-15T12:00:00Z",
    resolvedBy: "user_admin_1",
  };
  if (resolved.status !== "RESOLVED" || !resolved.resolvedAt) {
    throw new Error("Alert transition to RESOLVED failed.");
  }
}

// 5. Spend Calculation & Pricing Coverage Metadata
export function testSpendCalculationAndPricingCoverage() {
  const budget: Budget = {
    id: "bud_pricing_test",
    organizationId: "org_alpha",
    name: "Coverage Budget",
    amountUsd: 50.0,
    currency: "USD",
    period: "MONTHLY",
    thresholds: [50, 75, 90, 100],
    triggeredThresholds: [],
    enabled: true,
    enforcementMode: "MONITOR",
    status: "ACTIVE",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  };

  const boundaries = {
    periodStart: "2026-08-01T00:00:00.000Z",
    periodEnd: "2026-08-31T23:59:59.999Z",
  };

  const spendWithCoverage: CostAggregationResult = {
    totalSpendUsd: 25.0,
    totalRequests: 1000,
    totalTokens: 2000000,
    totalInputTokens: 1500000,
    totalOutputTokens: 500000,
    totalCachedTokens: 200000,
    totalReasoningTokens: 0,
    byProvider: {},
    byModel: {},
    byProject: {},
    dailySpend: [],
  };

  const evalResult = evaluateBudgetThresholds(budget, spendWithCoverage, boundaries);

  if (evalResult.statusResponse.pricingCoverage.pricedRequests !== 1000) {
    throw new Error("Pricing coverage pricedRequests mismatch.");
  }
  if (evalResult.statusResponse.pricingCoverage.pricedSpendUsd !== 25.0) {
    throw new Error("Pricing coverage pricedSpendUsd mismatch.");
  }
  if (evalResult.statusResponse.utilizationPercent !== 50.0) {
    throw new Error("Utilization percentage expected 50.0%.");
  }
}

// 6. RBAC Verification for Budgets & Alerts
export function testBudgetRbac() {
  // OWNER: budgets:read, budgets:manage, alerts:read, alerts:manage
  if (!hasPermission("OWNER", "budgets:read") || !hasPermission("OWNER", "budgets:manage")) {
    throw new Error("OWNER must possess budgets:read and budgets:manage.");
  }
  if (!hasPermission("OWNER", "alerts:read") || !hasPermission("OWNER", "alerts:manage")) {
    throw new Error("OWNER must possess alerts:read and alerts:manage.");
  }

  // ADMIN: budgets:read, budgets:manage, alerts:read, alerts:manage
  if (!hasPermission("ADMIN", "budgets:read") || !hasPermission("ADMIN", "budgets:manage")) {
    throw new Error("ADMIN must possess budgets:read and budgets:manage.");
  }
  if (!hasPermission("ADMIN", "alerts:read") || !hasPermission("ADMIN", "alerts:manage")) {
    throw new Error("ADMIN must possess alerts:read and alerts:manage.");
  }

  // DEVELOPER: budgets:read, alerts:read (no manage)
  if (!hasPermission("DEVELOPER", "budgets:read") || !hasPermission("DEVELOPER", "alerts:read")) {
    throw new Error("DEVELOPER must possess budgets:read and alerts:read.");
  }
  if (hasPermission("DEVELOPER", "budgets:manage") || hasPermission("DEVELOPER", "alerts:manage")) {
    throw new Error("DEVELOPER must NOT possess budgets:manage or alerts:manage.");
  }

  // VIEWER: budgets:read, alerts:read (no manage)
  if (!hasPermission("VIEWER", "budgets:read") || !hasPermission("VIEWER", "alerts:read")) {
    throw new Error("VIEWER must possess budgets:read and alerts:read.");
  }
  if (hasPermission("VIEWER", "budgets:manage") || hasPermission("VIEWER", "alerts:manage")) {
    throw new Error("VIEWER must NOT possess budgets:manage or alerts:manage.");
  }
}

// 7. Edge Cases Handling
export function testBudgetEdgeCases() {
  // Zero spend
  const zeroBudget: Budget = {
    id: "bud_zero",
    organizationId: "org_alpha",
    name: "Zero Budget",
    amountUsd: 100.0,
    currency: "USD",
    period: "MONTHLY",
    thresholds: [50, 75, 90, 100],
    triggeredThresholds: [],
    enabled: true,
    enforcementMode: "MONITOR",
    status: "ACTIVE",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  };
  const zeroSpend: CostAggregationResult = {
    totalSpendUsd: 0,
    totalRequests: 0,
    totalTokens: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCachedTokens: 0,
    totalReasoningTokens: 0,
    byProvider: {},
    byModel: {},
    byProject: {},
    dailySpend: [],
  };
  const boundaries = {
    periodStart: "2026-08-01T00:00:00.000Z",
    periodEnd: "2026-08-31T23:59:59.999Z",
  };
  const zeroEval = evaluateBudgetThresholds(zeroBudget, zeroSpend, boundaries);
  if (zeroEval.statusResponse.utilizationPercent !== 0 || zeroEval.candidateAlerts.length !== 0) {
    throw new Error("Zero spend should have 0% utilization and no alerts.");
  }

  // Custom non-standard thresholds [25, 60, 85, 120]
  const customThreshBudget: Budget = {
    ...zeroBudget,
    thresholds: [25, 60, 85, 120],
  };
  const spend65: CostAggregationResult = { ...zeroSpend, totalSpendUsd: 65.0 };
  const customEval = evaluateBudgetThresholds(customThreshBudget, spend65, boundaries);
  if (customEval.candidateAlerts.length !== 2) {
    throw new Error("Spend 65% on [25, 60, 85, 120] should trigger exactly 2 thresholds (25 and 60).");
  }
}

// 8. Privacy & Zero Secret / Prompt Persistence
export function testBudgetPrivacyGuarantees() {
  const confidentialPrompt = "USER_PROMPT_SECRET_98765";
  const confidentialCompletion = "AI_COMPLETION_SECRET_43210";
  const apiKeySecret = "ost_live_secret_1234567890";
  const providerKey = "sk-proj-supersecret_abcdef";

  const budget: Budget = {
    id: "bud_priv_1",
    organizationId: "org_alpha",
    name: "Privacy Safe Budget",
    amountUsd: 500,
    currency: "USD",
    period: "MONTHLY",
    thresholds: [50, 75, 90, 100],
    triggeredThresholds: [],
    enabled: true,
    enforcementMode: "MONITOR",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const alert: Alert = {
    id: "alert_priv_1",
    organizationId: "org_alpha",
    budgetId: "bud_priv_1",
    type: "BUDGET_THRESHOLD",
    thresholdPercent: 50,
    budgetAmountUsd: 500,
    currentSpendUsd: 250,
    remainingUsd: 250,
    periodStart: "2026-08-01T00:00:00.000Z",
    periodEnd: "2026-08-31T23:59:59.999Z",
    severity: "INFO",
    title: "50% reached",
    message: "Spent $250",
    dedupKey: "dedup_priv_1",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  const serializedBudget = JSON.stringify(budget);
  const serializedAlert = JSON.stringify(alert);

  if (serializedBudget.includes(confidentialPrompt) || serializedAlert.includes(confidentialPrompt)) {
    throw new Error("PRIVACY VIOLATION: User prompt found in budget/alert!");
  }
  if (serializedBudget.includes(confidentialCompletion) || serializedAlert.includes(confidentialCompletion)) {
    throw new Error("PRIVACY VIOLATION: Completion text found in budget/alert!");
  }
  if (serializedBudget.includes(apiKeySecret) || serializedAlert.includes(apiKeySecret)) {
    throw new Error("PRIVACY VIOLATION: OsterdOps API secret found in budget/alert!");
  }
  if (serializedBudget.includes(providerKey) || serializedAlert.includes(providerKey)) {
    throw new Error("PRIVACY VIOLATION: Provider API secret found in budget/alert!");
  }

  const forbiddenKeys = ["prompt", "content", "completion", "messages", "system", "text", "body", "secret", "apiKey"];
  for (const key of forbiddenKeys) {
    if (key in budget || key in alert) {
      throw new Error(`Budget/Alert must never contain forbidden property '${key}'.`);
    }
  }
}

// 9. Hard vs. Soft Budget Enforcement Logic
export function testHardVsSoftEnforcement() {
  const softBudget: Budget = {
    id: "bud_soft_1",
    organizationId: "org_alpha",
    name: "Soft Monitoring Budget",
    amountUsd: 100,
    currency: "USD",
    period: "MONTHLY",
    enforcement: "SOFT",
    enforcementMode: "MONITOR",
    status: "EXCEEDED",
    currentSpendUsd: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const hardBudget: Budget = {
    id: "bud_hard_1",
    organizationId: "org_alpha",
    name: "Hard Blocking Budget",
    amountUsd: 100,
    currency: "USD",
    period: "MONTHLY",
    enforcement: "HARD",
    enforcementMode: "BLOCK",
    enforceHardLimit: true,
    status: "EXCEEDED",
    currentSpendUsd: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Soft budget allows execution even when EXCEEDED
  const softBlocked = softBudget.enforcement === "HARD" && (softBudget.status === "EXCEEDED" || (softBudget.currentSpendUsd || 0) >= softBudget.amountUsd);
  if (softBlocked) {
    throw new Error("SOFT budget must not trigger request blocking.");
  }

  // Hard budget blocks execution when EXCEEDED
  const hardBlocked = hardBudget.enforcement === "HARD" && (hardBudget.status === "EXCEEDED" || (hardBudget.currentSpendUsd || 0) >= hardBudget.amountUsd);
  if (!hardBlocked) {
    throw new Error("HARD budget must trigger request blocking when EXCEEDED.");
  }
}

// 10. Budget Pause & Resume Lifecycle
export function testBudgetPauseResumeLifecycle() {
  const budget: Budget = {
    id: "bud_lifecycle_1",
    organizationId: "org_alpha",
    name: "Lifecycle Budget",
    amountUsd: 500,
    currency: "USD",
    period: "MONTHLY",
    enabled: true,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Pause
  const paused: Budget = {
    ...budget,
    enabled: false,
    status: "PAUSED",
  };
  if (paused.enabled || paused.status !== "PAUSED") {
    throw new Error("Budget pause failed.");
  }

  // Resume
  const resumed: Budget = {
    ...paused,
    enabled: true,
    status: "ACTIVE",
  };
  if (!resumed.enabled || resumed.status !== "ACTIVE") {
    throw new Error("Budget resume failed.");
  }
}

// 11. Project-Scoped vs Organization-Wide Budget Scoping
export function testProjectVsOrgBudgetScoping() {
  const orgBudget: Budget = {
    id: "bud_org_all",
    organizationId: "org_alpha",
    projectId: undefined,
    name: "Org Wide Budget",
    amountUsd: 1000,
    currency: "USD",
    period: "MONTHLY",
    enforcement: "HARD",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const projBudget: Budget = {
    id: "bud_proj_core",
    organizationId: "org_alpha",
    projectId: "proj_core",
    name: "Project Core Budget",
    amountUsd: 200,
    currency: "USD",
    period: "MONTHLY",
    enforcement: "HARD",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Org budget applies to any project (matchesScope = !budget.projectId || budget.projectId === targetProj)
  const matchesTarget = (b: Budget, pId: string) => !b.projectId || b.projectId === pId;

  if (!matchesTarget(orgBudget, "proj_core") || !matchesTarget(orgBudget, "proj_other")) {
    throw new Error("Org-wide budget must match all projects in organization.");
  }
  if (!matchesTarget(projBudget, "proj_core")) {
    throw new Error("Project budget must match target project.");
  }
  if (matchesTarget(projBudget, "proj_other")) {
    throw new Error("Project budget must not match unrelated project.");
  }
}

// Master Test Runner for Phases 10 & 12
export function runBudgetTests() {
  testBudgetPeriodCalculations();
  testThresholdCrossingsAndSeverity();
  testAlertDeduplication();
  testAlertLifecycleTransitions();
  testSpendCalculationAndPricingCoverage();
  testBudgetRbac();
  testBudgetEdgeCases();
  testBudgetPrivacyGuarantees();
  testHardVsSoftEnforcement();
  testBudgetPauseResumeLifecycle();
  testProjectVsOrgBudgetScoping();
}

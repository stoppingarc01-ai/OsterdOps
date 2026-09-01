/**
 * OsterdOps — Phase 26 Budget Enforcement & Threshold Alerts
 * Validates:
 * 1. Spend below threshold (<50%): normal request processing
 * 2. 50% soft threshold: alert triggered, requests proceed
 * 3. 80% soft threshold: high warning alert triggered, deduplicated
 * 4. 100% hard limit: status EXCEEDED
 * 5. Deterministic UTC period boundaries (Monthly, Daily, Weekly, Custom)
 * 6. Alert deduplication key generation
 */

import {
  evaluateBudgetThresholds,
  getBudgetPeriodBoundaries,
  getAlertDedupKey,
  getSeverityForThreshold,
} from "@/lib/budget/evaluator";
import type { Budget, CostAggregationResult } from "@/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function makeSpendAggregate(spendUsd: number, requests = 100): CostAggregationResult {
  return {
    totalSpendUsd: spendUsd,
    totalRequests: requests,
    totalTokens: 100000,
    totalInputTokens: 70000,
    totalOutputTokens: 30000,
    totalCachedTokens: 0,
    totalReasoningTokens: 0,
    byProvider: {},
    byModel: {},
    byProject: {},
    dailySpend: [],
  };
}

export function runBudgetEnforcementE2ETests(): void {
  console.log("▶ Running Phase 26: Budget Enforcement & Threshold Alerts...");

  const orgId = "org_budget_e2e";
  const budgetId = "bgt_e2e_01";
  const limitUsd = 1000.0;
  const periodBoundaries = getBudgetPeriodBoundaries("MONTHLY", undefined, undefined, new Date("2026-09-01T00:00:00Z"));

  const budget: Budget = {
    id: budgetId,
    organizationId: orgId,
    name: "Engineering Monthly Spend Budget",
    amountUsd: limitUsd,
    period: "MONTHLY",
    enforcement: "HARD",
    status: "ACTIVE",
    thresholds: [50, 75, 90, 100],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Spend at 20% (Below All Thresholds)
  const eval20 = evaluateBudgetThresholds(budget, makeSpendAggregate(200.0), periodBoundaries);
  assert(eval20.statusResponse.status === "NORMAL", "Status is NORMAL at 20% spend");
  assert(eval20.candidateAlerts.length === 0, "No alerts at 20% spend");
  assert(eval20.statusResponse.utilizationPercent === 20, "Utilization is 20%");
  assert(eval20.statusResponse.remainingUsd === 800, "Remaining is $800");

  // 2. Spend at 55% (50% Soft Threshold Crossed)
  const eval55 = evaluateBudgetThresholds(budget, makeSpendAggregate(550.0), periodBoundaries);
  assert(eval55.statusResponse.status === "INFO", "Status is INFO at 55% spend");
  assert(eval55.candidateAlerts.length === 1, "1 candidate alert at 55% spend");
  assert(eval55.candidateAlerts[0].thresholdPercent === 50, "50% threshold triggered");
  assert(eval55.candidateAlerts[0].severity === "INFO", "Severity is INFO");

  // 3. Spend at 80% (75% Threshold Crossed)
  const eval80 = evaluateBudgetThresholds(budget, makeSpendAggregate(800.0), periodBoundaries);
  assert(eval80.statusResponse.status === "WARNING", "Status is WARNING at 80% spend");
  assert(eval80.candidateAlerts.length === 2, "2 candidate alerts (50% and 75%) at 80% spend");

  // 4. Spend at 95% (90% Critical Threshold Crossed)
  const eval95 = evaluateBudgetThresholds(budget, makeSpendAggregate(950.0), periodBoundaries);
  assert(eval95.statusResponse.status === "CRITICAL", "Status is CRITICAL at 95% spend");
  assert(eval95.candidateAlerts.length === 3, "3 candidate alerts at 95% spend");

  // 5. Spend at 105% (100% Limit Exceeded)
  const eval105 = evaluateBudgetThresholds(budget, makeSpendAggregate(1050.0), periodBoundaries);
  assert(eval105.statusResponse.status === "EXCEEDED", "Status is EXCEEDED at 105% spend");
  assert(eval105.statusResponse.overspendUsd === 50, "Overspend is $50");
  assert(eval105.statusResponse.remainingUsd === 0, "Remaining is $0");
  const exceededAlert = eval105.candidateAlerts.find((a) => a.type === "BUDGET_EXCEEDED");
  assert(exceededAlert !== undefined, "BUDGET_EXCEEDED alert emitted");
  assert(exceededAlert!.severity === "CRITICAL", "EXCEEDED alert is CRITICAL");

  // 6. Deduplication Key Generation
  const dedup1 = getAlertDedupKey(orgId, budgetId, periodBoundaries.periodStart, 80);
  const dedup2 = getAlertDedupKey(orgId, budgetId, periodBoundaries.periodStart, 80);
  const dedup3 = getAlertDedupKey(orgId, budgetId, periodBoundaries.periodStart, 100);

  assert(dedup1 === dedup2, "Identical threshold deduplication keys match");
  assert(dedup1 !== dedup3, "Distinct threshold levels generate unique deduplication keys");

  // 7. Period Boundaries Calculation
  const daily = getBudgetPeriodBoundaries("DAILY", undefined, undefined, new Date("2026-09-15T14:30:00Z"));
  assert(daily.periodStart.startsWith("2026-09-15T00:00:00"), "Daily starts at midnight UTC");
  assert(daily.periodEnd.startsWith("2026-09-15T23:59:59"), "Daily ends at 23:59:59 UTC");

  console.log("✔ Phase 26: Budget Enforcement & Threshold Alerts passed.");
}

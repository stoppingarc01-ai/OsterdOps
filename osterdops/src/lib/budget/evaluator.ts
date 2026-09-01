/**
 * OsterdOps — Budget & Threshold Evaluation Engine
 * Calculates deterministic UTC period boundaries, evaluates utilization against Phase 9 spend aggregates,
 * and generates deduplicated alert payloads with severity rankings.
 */

import type {
  Budget,
  BudgetPeriod,
  AlertSeverity,
  BudgetStatusResponse,
  BudgetThresholdItem,
  CostAggregationResult,
} from "@/types";

export interface PeriodBoundaries {
  periodStart: string; // ISO 8601 UTC
  periodEnd: string;   // ISO 8601 UTC
}

/**
 * Calculates deterministic UTC period boundaries for a budget period.
 */
export function getBudgetPeriodBoundaries(
  period: BudgetPeriod,
  customStart?: string,
  customEnd?: string,
  referenceDate: Date = new Date()
): PeriodBoundaries {
  const norm = String(period).toUpperCase();

  if (norm === "CUSTOM") {
    const start = customStart ? new Date(customStart).toISOString() : referenceDate.toISOString();
    const end = customEnd ? new Date(customEnd).toISOString() : new Date(Date.UTC(referenceDate.getUTCFullYear() + 1, referenceDate.getUTCMonth(), referenceDate.getUTCDate())).toISOString();
    return { periodStart: start, periodEnd: end };
  }

  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();
  const date = referenceDate.getUTCDate();

  if (norm === "DAILY") {
    const start = new Date(Date.UTC(year, month, date, 0, 0, 0, 0)).toISOString();
    const end = new Date(Date.UTC(year, month, date, 23, 59, 59, 999)).toISOString();
    return { periodStart: start, periodEnd: end };
  }

  if (norm === "WEEKLY") {
    const dayOfWeek = referenceDate.getUTCDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = (dayOfWeek + 6) % 7; // Days since Monday
    const monday = new Date(Date.UTC(year, month, date - diffToMonday, 0, 0, 0, 0));
    const sunday = new Date(Date.UTC(year, month, date - diffToMonday + 6, 23, 59, 59, 999));
    return {
      periodStart: monday.toISOString(),
      periodEnd: sunday.toISOString(),
    };
  }

  // Default: MONTHLY
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)).toISOString();
  const lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString();
  return { periodStart: start, periodEnd: lastDay };
}

/**
 * Maps threshold percentage to severity tier.
 */
export function getSeverityForThreshold(thresholdPercent: number): AlertSeverity {
  if (thresholdPercent >= 90) return "CRITICAL";
  if (thresholdPercent >= 75) return "WARNING";
  return "INFO";
}

/**
 * Constructs a deterministic deduplication key for budget threshold alerts.
 */
export function getAlertDedupKey(
  orgId: string,
  budgetId: string,
  periodStart: string,
  thresholdPercent: number
): string {
  const datePart = periodStart.slice(0, 10);
  return `org_${orgId}_bud_${budgetId}_period_${datePart}_thresh_${thresholdPercent}`;
}

export interface CandidateAlert {
  type: "BUDGET_THRESHOLD" | "BUDGET_EXCEEDED";
  thresholdPercent: number;
  severity: AlertSeverity;
  title: string;
  message: string;
  dedupKey: string;
  budgetAmountUsd: number;
  currentSpendUsd: number;
  remainingUsd: number;
  overspendUsd: number;
}

export interface BudgetEvaluationResult {
  statusResponse: BudgetStatusResponse;
  candidateAlerts: CandidateAlert[];
  newlyCrossedThresholds: number[];
}

/**
 * Evaluates a budget against authoritative Cost Engine aggregations.
 */
export function evaluateBudgetThresholds(
  budget: Budget,
  spendAggregate: CostAggregationResult,
  periodBoundaries: PeriodBoundaries
): BudgetEvaluationResult {
  const amountUsd = Math.max(0, Number(budget.amountUsd) || 0);
  const currentSpendUsd = Math.round((spendAggregate.totalSpendUsd || 0) * 100_000_000) / 100_000_000;

  const utilizationPercent = amountUsd > 0
    ? Math.round(((currentSpendUsd / amountUsd) * 100) * 100) / 100
    : 0;

  const remainingUsd = Math.max(0, Math.round((amountUsd - currentSpendUsd) * 100_000_000) / 100_000_000);
  const overspendUsd = Math.max(0, Math.round((currentSpendUsd - amountUsd) * 100_000_000) / 100_000_000);

  // Status computation
  let status: "NORMAL" | "INFO" | "WARNING" | "CRITICAL" | "EXCEEDED" = "NORMAL";
  if (currentSpendUsd >= amountUsd && amountUsd > 0) {
    status = "EXCEEDED";
  } else if (utilizationPercent >= 90) {
    status = "CRITICAL";
  } else if (utilizationPercent >= 75) {
    status = "WARNING";
  } else if (utilizationPercent >= 50) {
    status = "INFO";
  }

  // Parse and sort thresholds
  const rawThresholds = budget.thresholds || budget.alertThresholds || [50, 75, 90, 100];
  const distinctThresholds = Array.from(
    new Set(rawThresholds.filter((t) => typeof t === "number" && t > 0 && t <= 200))
  ).sort((a, b) => a - b);

  const thresholdItems: BudgetThresholdItem[] = [];
  const candidateAlerts: CandidateAlert[] = [];
  const newlyCrossedThresholds: number[] = [];

  for (const percent of distinctThresholds) {
    const isTriggered = utilizationPercent >= percent;
    const severity = getSeverityForThreshold(percent);

    thresholdItems.push({
      percent,
      triggered: isTriggered,
      severity,
    });

    if (isTriggered) {
      newlyCrossedThresholds.push(percent);
      const isExceeded = percent >= 100;
      const type = isExceeded ? "BUDGET_EXCEEDED" : "BUDGET_THRESHOLD";
      const dedupKey = getAlertDedupKey(budget.organizationId, budget.id, periodBoundaries.periodStart, percent);

      const targetLabel = budget.projectId ? `Project Budget '${budget.name}'` : `Organization Budget '${budget.name}'`;
      const title = isExceeded
        ? `Budget Exceeded: ${targetLabel} has exceeded limit ($${currentSpendUsd.toFixed(2)} / $${amountUsd.toFixed(2)})`
        : `Budget Alert: ${targetLabel} reached ${percent}% threshold ($${currentSpendUsd.toFixed(2)} / $${amountUsd.toFixed(2)})`;

      const message = `${targetLabel} utilization reached ${utilizationPercent.toFixed(1)}% ($${currentSpendUsd.toFixed(2)} of $${amountUsd.toFixed(2)}) for period starting ${periodBoundaries.periodStart.slice(0, 10)}.`;

      candidateAlerts.push({
        type,
        thresholdPercent: percent,
        severity: isExceeded ? "CRITICAL" : severity,
        title,
        message,
        dedupKey,
        budgetAmountUsd: amountUsd,
        currentSpendUsd,
        remainingUsd,
        overspendUsd,
      });
    }
  }

  const statusResponse: BudgetStatusResponse = {
    budgetId: budget.id,
    budgetName: budget.name,
    organizationId: budget.organizationId,
    projectId: budget.projectId,
    amountUsd,
    currentSpendUsd,
    remainingUsd,
    overspendUsd,
    utilizationPercent,
    status,
    period: budget.period,
    periodStart: periodBoundaries.periodStart,
    periodEnd: periodBoundaries.periodEnd,
    pricingCoverage: {
      pricedRequests: spendAggregate.totalRequests,
      unpricedRequests: 0,
      pricedSpendUsd: currentSpendUsd,
    },
    thresholds: thresholdItems,
    activeAlertsCount: candidateAlerts.length,
  };

  return {
    statusResponse,
    candidateAlerts,
    newlyCrossedThresholds,
  };
}

/**
 * OsterdOps — Precise Financial Billing Calculator (Phase 13)
 * Pure financial calculations using exact integer-cents arithmetic to eliminate floating-point rounding errors.
 */

import { getBillingPlan } from "./plans";
import type {
  BillingPlan,
  BillingInterval,
  BillingUsageSummary,
  CostAggregationResult,
  UsageAggregationResult,
} from "@/types";

/**
 * Calculates the recurring base subscription price for a plan and billing interval.
 */
export function calculateBasePrice(plan: BillingPlan, interval: BillingInterval): number {
  const norm = interval.toUpperCase();
  return norm === "ANNUAL" ? plan.annualPriceUsd : plan.monthlyPriceUsd;
}

/**
 * Calculates token overage and applicable fees beyond included plan quota.
 */
export function calculateUsageOverage(
  plan: BillingPlan,
  totalTokens: number,
  _totalProviderSpendUsd: number
): { overageTokens: number; overageSpendUsd: number } {
  if (!plan.overageEnabled || plan.overageRatePerMillionTokensUsd <= 0) {
    return { overageTokens: 0, overageSpendUsd: 0 };
  }

  const overageTokens = Math.max(0, totalTokens - plan.includedTokens);
  if (overageTokens === 0) {
    return { overageTokens: 0, overageSpendUsd: 0 };
  }

  // Integer cents arithmetic: (overageTokens * rate * 100) / 1,000,000
  const overageCents = Math.round(
    (overageTokens / 1_000_000) * plan.overageRatePerMillionTokensUsd * 100
  );

  return {
    overageTokens,
    overageSpendUsd: overageCents / 100,
  };
}

/**
 * Computes subtotal, credit application, and final invoice total in integer cents.
 */
export function calculateInvoiceTotal(
  basePriceUsd: number,
  overageSpendUsd: number,
  creditsUsd: number = 0
): { subtotalUsd: number; creditsUsd: number; totalUsd: number } {
  const baseCents = Math.max(0, Math.round(basePriceUsd * 100));
  const overageCents = Math.max(0, Math.round(overageSpendUsd * 100));
  const subtotalCents = baseCents + overageCents;

  const rawCreditCents = Math.max(0, Math.round(creditsUsd * 100));
  // Credits cannot exceed subtotal
  const appliedCreditCents = Math.min(subtotalCents, rawCreditCents);
  const totalCents = Math.max(0, subtotalCents - appliedCreditCents);

  return {
    subtotalUsd: subtotalCents / 100,
    creditsUsd: appliedCreditCents / 100,
    totalUsd: totalCents / 100,
  };
}

/**
 * Normalizes aggregated usage and spend into a unified BillingUsageSummary.
 */
export function buildBillingUsageSummary(
  planId: string,
  usageAggregate: UsageAggregationResult,
  spendAggregate: CostAggregationResult
): BillingUsageSummary {
  const plan = getBillingPlan(planId);
  const totalTokens = usageAggregate.totalTokens || 0;
  const overage = calculateUsageOverage(plan, totalTokens, spendAggregate.totalSpendUsd || 0);

  // Derive pricing coverage status
  let coverageStatus: "FULL" | "PARTIAL" | "UNAVAILABLE" = "FULL";
  if (usageAggregate.totalRequests > 0) {
    if (spendAggregate.totalSpendUsd === 0 && usageAggregate.totalTokens > 0) {
      coverageStatus = "UNAVAILABLE";
    }
  }

  const estimatedBillableUsd = plan.monthlyPriceUsd + overage.overageSpendUsd;

  return {
    totalRequests: usageAggregate.totalRequests || 0,
    totalTokens,
    inputTokens: usageAggregate.totalInputTokens || 0,
    outputTokens: usageAggregate.totalOutputTokens || 0,
    cachedTokens: usageAggregate.totalCachedTokens || 0,
    reasoningTokens: usageAggregate.totalReasoningTokens || 0,
    totalProviderSpendUsd: spendAggregate.totalSpendUsd || 0,
    includedTokens: plan.includedTokens,
    overageTokens: overage.overageTokens,
    overageSpendUsd: overage.overageSpendUsd,
    estimatedBillableUsd: Math.round(estimatedBillableUsd * 100) / 100,
    pricingCoverageStatus: coverageStatus,
  };
}

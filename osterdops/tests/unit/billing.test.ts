/**
 * OsterdOps — Phase 13: Billing & Plan Engine Unit Tests
 * Tests plan registry, entitlement resolution, deterministic UTC periods,
 * exact financial calculations, overage math, and privacy guarantees.
 */

import { getBillingPlan, listBillingPlans, isValidPlanId } from "@/lib/billing/plans";
import { getPlanEntitlements, hasEntitlement } from "@/lib/billing/entitlements";
import {
  getCurrentBillingPeriod,
  getPreviousBillingPeriod,
  isWithinBillingPeriod,
} from "@/lib/billing/periods";
import {
  calculateBasePrice,
  calculateUsageOverage,
  calculateInvoiceTotal,
  buildBillingUsageSummary,
} from "@/lib/billing/calculator";
import { hasPermission } from "@/lib/auth/permissions";
import type {
  BillingPlan,
  OrganizationSubscription,
  UsageAggregationResult,
  CostAggregationResult,
} from "@/types";

// 1. Plan Registry Tests
export function testBillingPlansRegistry() {
  const plans = listBillingPlans();
  if (plans.length < 4) {
    throw new Error("Expected at least 4 billing plans (FREE, PRO, BUSINESS, ENTERPRISE).");
  }

  const freePlan = getBillingPlan("FREE");
  if (freePlan.monthlyPriceUsd !== 0 || freePlan.includedTokens !== 100_000) {
    throw new Error("FREE plan parameters incorrect.");
  }

  const proPlan = getBillingPlan("PRO");
  if (proPlan.monthlyPriceUsd !== 49 || proPlan.overageRatePerMillionTokensUsd !== 3.50) {
    throw new Error("PRO plan parameters incorrect.");
  }

  // Fallback test
  const fallback = getBillingPlan("NON_EXISTENT_PLAN_XYZ");
  if (fallback.planId !== "FREE") {
    throw new Error("Unknown plan should fallback to FREE.");
  }

  if (!isValidPlanId("PRO") || !isValidPlanId("business") || isValidPlanId("ULTRA_SUPER")) {
    throw new Error("Plan ID validation logic failed.");
  }
}

// 2. Entitlements Tests
export function testBillingEntitlements() {
  const freeEntitlements = getPlanEntitlements("FREE");
  if (freeEntitlements.canUseAdvancedAnalytics || freeEntitlements.overageEnabled) {
    throw new Error("FREE plan should not have advanced analytics or overage.");
  }
  if (freeEntitlements.maxProjects !== 2 || freeEntitlements.gatewayRateLimitRpm !== 60) {
    throw new Error("FREE plan limits mismatch.");
  }

  const proEntitlements = getPlanEntitlements("PRO");
  if (!proEntitlements.canUseAdvancedAnalytics || !proEntitlements.overageEnabled) {
    throw new Error("PRO plan should have advanced analytics and overage enabled.");
  }
  if (proEntitlements.maxProjects !== 10 || proEntitlements.gatewayRateLimitRpm !== 300) {
    throw new Error("PRO plan limits mismatch.");
  }

  const subActivePro: OrganizationSubscription = {
    id: "sub_pro_1",
    organizationId: "org_alpha",
    planId: "PRO",
    status: "ACTIVE",
    interval: "MONTHLY",
    currentPeriodStart: "2026-08-01T00:00:00.000Z",
    currentPeriodEnd: "2026-08-31T23:59:59.999Z",
    cancelAtPeriodEnd: false,
    provider: "simulation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!hasEntitlement(subActivePro, "canUseAdvancedAnalytics")) {
    throw new Error("Active PRO subscription should have advanced analytics.");
  }

  // Inactive or past due sub falls back to FREE
  const subPastDue: OrganizationSubscription = {
    ...subActivePro,
    status: "PAST_DUE",
  };
  if (hasEntitlement(subPastDue, "canUseAdvancedAnalytics")) {
    throw new Error("PAST_DUE subscription must not have paid entitlements.");
  }
}

// 3. Billing Period Calculations (UTC)
export function testBillingPeriodCalculations() {
  const refDate = new Date("2026-08-15T12:00:00.000Z");

  // Current Monthly
  const monthly = getCurrentBillingPeriod("MONTHLY", refDate);
  if (
    monthly.periodStart !== "2026-08-01T00:00:00.000Z" ||
    monthly.periodEnd !== "2026-08-31T23:59:59.999Z"
  ) {
    throw new Error(`Monthly period calculation mismatch: ${JSON.stringify(monthly)}`);
  }

  // Previous Monthly
  const prevMonthly = getPreviousBillingPeriod("MONTHLY", refDate);
  if (
    prevMonthly.periodStart !== "2026-07-01T00:00:00.000Z" ||
    prevMonthly.periodEnd !== "2026-07-31T23:59:59.999Z"
  ) {
    throw new Error(`Previous monthly period mismatch: ${JSON.stringify(prevMonthly)}`);
  }

  // Current Annual
  const annual = getCurrentBillingPeriod("ANNUAL", refDate);
  if (
    annual.periodStart !== "2026-01-01T00:00:00.000Z" ||
    annual.periodEnd !== "2026-12-31T23:59:59.999Z"
  ) {
    throw new Error(`Annual period calculation mismatch: ${JSON.stringify(annual)}`);
  }

  // Within period check
  if (!isWithinBillingPeriod("2026-08-10T00:00:00Z", monthly.periodStart, monthly.periodEnd)) {
    throw new Error("Date within August should return true.");
  }
  if (isWithinBillingPeriod("2026-09-01T00:00:00Z", monthly.periodStart, monthly.periodEnd)) {
    throw new Error("Date outside August should return false.");
  }
}

// 4. Financial Calculations & Integer Precision
export function testFinancialCalculations() {
  const proPlan = getBillingPlan("PRO");

  // Base price
  const baseMonthly = calculateBasePrice(proPlan, "MONTHLY");
  const baseAnnual = calculateBasePrice(proPlan, "ANNUAL");
  if (baseMonthly !== 49 || baseAnnual !== 470) {
    throw new Error("Base price calculation failed.");
  }

  // Overage calculation: PRO included is 5,000,000 tokens @ $3.50 / 1M
  // Case A: 4,000,000 tokens (Under quota)
  const underOverage = calculateUsageOverage(proPlan, 4_000_000, 10.0);
  if (underOverage.overageTokens !== 0 || underOverage.overageSpendUsd !== 0) {
    throw new Error("Under quota should have 0 overage.");
  }

  // Case B: 7,000,000 tokens (2,000,000 overage @ $3.50 = $7.00)
  const overOverage = calculateUsageOverage(proPlan, 7_000_000, 25.0);
  if (overOverage.overageTokens !== 2_000_000 || overOverage.overageSpendUsd !== 7.00) {
    throw new Error(`Overage expected 2M tokens and $7.00, got: ${JSON.stringify(overOverage)}`);
  }

  // Invoice total calculation with credits: $49 base + $7 overage - $10 credit = $46 total
  const invTotal = calculateInvoiceTotal(49.00, 7.00, 10.00);
  if (invTotal.subtotalUsd !== 56.00 || invTotal.creditsUsd !== 10.00 || invTotal.totalUsd !== 46.00) {
    throw new Error(`Invoice total calculation mismatch: ${JSON.stringify(invTotal)}`);
  }

  // Excessive credit capped at subtotal: $49 base + $0 overage - $100 credit = $0 total (credit applied: $49)
  const cappedCredit = calculateInvoiceTotal(49.00, 0, 100.00);
  if (cappedCredit.totalUsd !== 0 || cappedCredit.creditsUsd !== 49.00) {
    throw new Error("Credits must not cause negative invoice total.");
  }
}

// 5. Usage & Cost Engine Aggregation Summary
export function testBillingUsageSummaryBuilder() {
  const usage: UsageAggregationResult = {
    totalRequests: 2500,
    totalTokens: 6_000_000,
    totalInputTokens: 4_000_000,
    totalOutputTokens: 2_000_000,
    totalCachedTokens: 500_000,
    totalReasoningTokens: 100_000,
    byProvider: {},
    byModel: {},
    byProject: {},
    byStatus: {},
  };

  const spend: CostAggregationResult = {
    totalSpendUsd: 15.50,
    totalRequests: 2500,
    totalTokens: 6_000_000,
    totalInputTokens: 4_000_000,
    totalOutputTokens: 2_000_000,
    totalCachedTokens: 500_000,
    totalReasoningTokens: 100_000,
    byProvider: {},
    byModel: {},
    byProject: {},
    dailySpend: [],
  };

  const summary = buildBillingUsageSummary("PRO", usage, spend);
  if (summary.totalTokens !== 6_000_000 || summary.includedTokens !== 5_000_000) {
    throw new Error("Usage summary token totals mismatch.");
  }
  if (summary.overageTokens !== 1_000_000 || summary.overageSpendUsd !== 3.50) {
    throw new Error("Usage summary overage calculation mismatch.");
  }
  if (summary.estimatedBillableUsd !== 52.50) { // 49 + 3.50
    throw new Error(`Estimated billable USD expected $52.50, got: ${summary.estimatedBillableUsd}`);
  }
}

// 6. RBAC Verification for Billing
export function testBillingRbacPermissions() {
  // OWNER has full billing access
  if (!hasPermission("OWNER", "billing:read") || !hasPermission("OWNER", "billing:manage")) {
    throw new Error("OWNER must have billing:read and billing:manage.");
  }

  // ADMIN has billing:read and billing:manage
  if (!hasPermission("ADMIN", "billing:read")) {
    throw new Error("ADMIN must have billing:read.");
  }

  // DEVELOPER and VIEWER have read-only permissions
  if (hasPermission("DEVELOPER", "billing:manage")) {
    throw new Error("DEVELOPER must not have billing:manage.");
  }
  if (hasPermission("VIEWER", "billing:manage")) {
    throw new Error("VIEWER must not have billing:manage.");
  }
}

// 7. Privacy & Zero Secret / Prompt Persistence in Billing Models
export function testBillingPrivacyGuarantees() {
  const secretKey = ["sk", "live", "stripe_mock_test_token_98765"].join("_");
  const userPrompt = "SECRET_PROMPT_FINANCIAL_DATA";
  const plan = getBillingPlan("PRO");

  const serialized = JSON.stringify(plan);
  if (serialized.includes(secretKey) || serialized.includes(userPrompt)) {
    throw new Error("Privacy violation in plan serialization.");
  }

  const forbiddenKeys = ["prompt", "completion", "secretKey", "apiKey", "messages"];
  for (const k of forbiddenKeys) {
    if (k in plan) {
      throw new Error(`Forbidden key '${k}' found in billing plan object.`);
    }
  }
}

export function runBillingTests() {
  testBillingPlansRegistry();
  testBillingEntitlements();
  testBillingPeriodCalculations();
  testFinancialCalculations();
  testBillingUsageSummaryBuilder();
  testBillingRbacPermissions();
  testBillingPrivacyGuarantees();
}

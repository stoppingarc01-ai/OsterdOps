/**
 * OsterdOps — Centralized Versioned Billing Plans Registry (Phase 13)
 * Pure plan configuration and entitlement specifications with zero I/O side-effects.
 */

import type { BillingPlan, BillingPlanId } from "@/types";

export const BILLING_PLANS: Record<string, BillingPlan> = {
  FREE: {
    planId: "FREE",
    displayName: "Free",
    description: "Essential AI gateway and cost tracking for developers.",
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    includedTokens: 100_000,
    includedRequests: 1_000,
    includedProjects: 2,
    includedMembers: 2,
    gatewayRateLimitRpm: 60,
    analyticsAccess: true,
    budgetAccess: true,
    advancedAnalytics: false,
    auditLogAccess: false,
    apiAccess: true,
    overageEnabled: false,
    overageRatePerMillionTokensUsd: 0,
    features: [
      "2 Projects",
      "2 Team Members",
      "100k Monthly Included Tokens",
      "Standard Gateway",
      "Basic Analytics",
    ],
  },
  PRO: {
    planId: "PRO",
    displayName: "Pro",
    description: "Advanced spending controls, alerts, and performance metrics for growing teams.",
    monthlyPriceUsd: 49,
    annualPriceUsd: 470,
    includedTokens: 5_000_000,
    includedRequests: 50_000,
    includedProjects: 10,
    includedMembers: 10,
    gatewayRateLimitRpm: 300,
    analyticsAccess: true,
    budgetAccess: true,
    advancedAnalytics: true,
    auditLogAccess: true,
    apiAccess: true,
    overageEnabled: true,
    overageRatePerMillionTokensUsd: 3.50,
    features: [
      "10 Projects",
      "10 Team Members",
      "5M Monthly Included Tokens",
      "Hard Budget Enforcement",
      "Advanced Analytics & Latency Percentiles",
      "Audit Logs",
      "Token Overage Coverage ($3.50 / 1M tokens)",
    ],
  },
  BUSINESS: {
    planId: "BUSINESS",
    displayName: "Business",
    description: "High-throughput routing, multi-project governance, and enterprise-grade observability.",
    monthlyPriceUsd: 199,
    annualPriceUsd: 1910,
    includedTokens: 25_000_000,
    includedRequests: 250_000,
    includedProjects: 50,
    includedMembers: 50,
    gatewayRateLimitRpm: 1200,
    analyticsAccess: true,
    budgetAccess: true,
    advancedAnalytics: true,
    auditLogAccess: true,
    apiAccess: true,
    overageEnabled: true,
    overageRatePerMillionTokensUsd: 2.50,
    features: [
      "50 Projects",
      "50 Team Members",
      "25M Monthly Included Tokens",
      "High-Throughput Gateway (1200 RPM)",
      "Multi-Channel Webhook Notifications",
      "Full Audit Log History",
      "Token Overage Coverage ($2.50 / 1M tokens)",
    ],
  },
  ENTERPRISE: {
    planId: "ENTERPRISE",
    displayName: "Enterprise",
    description: "Custom limits, SLA guarantees, dedicated infrastructure, and tailored routing.",
    monthlyPriceUsd: 999,
    annualPriceUsd: 9590,
    includedTokens: 200_000_000,
    includedRequests: 2_000_000,
    includedProjects: 1000,
    includedMembers: 1000,
    gatewayRateLimitRpm: 6000,
    analyticsAccess: true,
    budgetAccess: true,
    advancedAnalytics: true,
    auditLogAccess: true,
    apiAccess: true,
    overageEnabled: true,
    overageRatePerMillionTokensUsd: 1.50,
    features: [
      "Unlimited Projects & Members",
      "200M Monthly Included Tokens",
      "Enterprise Gateway (6000 RPM)",
      "24/7 Priority SLA",
      "Custom Provider Agreements",
      "SSO & Custom Invoicing",
      "Token Overage Coverage ($1.50 / 1M tokens)",
    ],
  },
};

/**
 * Resolves a plan by ID with safe fallback to FREE.
 */
export function getBillingPlan(rawPlanId?: string): BillingPlan {
  if (!rawPlanId) return BILLING_PLANS.FREE;
  const normalizedKey = rawPlanId.trim().toUpperCase();
  return BILLING_PLANS[normalizedKey] || BILLING_PLANS.FREE;
}

/**
 * Lists all active billing plans.
 */
export function listBillingPlans(): BillingPlan[] {
  return Object.values(BILLING_PLANS);
}

/**
 * Validates whether a plan ID is recognized.
 */
export function isValidPlanId(planId: string): planId is BillingPlanId {
  const norm = planId.trim().toUpperCase();
  return norm in BILLING_PLANS;
}

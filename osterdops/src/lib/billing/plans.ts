/**
 * OsterdOps — Centralized Versioned Billing Plans & Entitlements Registry
 * Defines multi-tier pricing structures, rate limits, feature flags, and enforcement helpers.
 */

import type { BillingPlan, BillingPlanId } from "@/types";

/* =========================================================================
   1. Multi-Tier Subscription Engine (Developer, Growth, Scale, Enterprise)
   ========================================================================= */

export type PlanTier = "free" | "growth" | "scale" | "enterprise";

export interface PlanFeatureDefinition {
  id: PlanTier;
  name: string;
  priceMonthly: number | "custom";
  description: string;
  badge?: string;
  limits: {
    monthlyRequestLimit: number; // e.g., 50_000, 500_000, 2_500_000, Infinity
    maxProviderConnections: number; // e.g., 3, 10, 50, Infinity
    maxProjects: number; // e.g., 1, 5, 20, Infinity
  };
  features: {
    autoDowngradeEnabled: boolean; // Dynamic model fallback
    runawayLoopBreaker: boolean; // 30s agent freeze
    semanticCaching: boolean; // Vector cache
    zeroDataRetentionToggle: boolean; // ZDR toggle
    customEgressIp: boolean; // Dedicated NAT / VPC
    prioritySupport: boolean;
    slaGuarantee: string; // "Best Effort", "99.9%", "99.95%", "99.99% Financial Backed"
  };
}

export const PRICING_PLANS: Record<PlanTier, PlanFeatureDefinition> = {
  free: {
    id: "free",
    name: "Developer",
    priceMonthly: 0,
    description: "For solo developers and prototypes.",
    limits: {
      monthlyRequestLimit: 50_000,
      maxProviderConnections: 3,
      maxProjects: 1,
    },
    features: {
      autoDowngradeEnabled: false,
      runawayLoopBreaker: true,
      semanticCaching: false,
      zeroDataRetentionToggle: false,
      customEgressIp: false,
      prioritySupport: false,
      slaGuarantee: "Best Effort",
    },
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 49,
    description: "For startups scaling production agents.",
    badge: "Most Popular",
    limits: {
      monthlyRequestLimit: 500_000,
      maxProviderConnections: 10,
      maxProjects: 5,
    },
    features: {
      autoDowngradeEnabled: true,
      runawayLoopBreaker: true,
      semanticCaching: true,
      zeroDataRetentionToggle: false,
      customEgressIp: false,
      prioritySupport: true,
      slaGuarantee: "99.9%",
    },
  },
  scale: {
    id: "scale",
    name: "Scale",
    priceMonthly: 159,
    description: "For high-throughput AI fleets requiring active FinOps.",
    limits: {
      monthlyRequestLimit: 2_500_000,
      maxProviderConnections: 50,
      maxProjects: 20,
    },
    features: {
      autoDowngradeEnabled: true,
      runawayLoopBreaker: true,
      semanticCaching: true,
      zeroDataRetentionToggle: true,
      customEgressIp: false,
      prioritySupport: true,
      slaGuarantee: "99.95%",
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: "custom",
    description: "Custom VPC deployment, unlimited throughput, and bespoke SLAs.",
    limits: {
      monthlyRequestLimit: Number.MAX_SAFE_INTEGER,
      maxProviderConnections: Number.MAX_SAFE_INTEGER,
      maxProjects: Number.MAX_SAFE_INTEGER,
    },
    features: {
      autoDowngradeEnabled: true,
      runawayLoopBreaker: true,
      semanticCaching: true,
      zeroDataRetentionToggle: true,
      customEgressIp: true,
      prioritySupport: true,
      slaGuarantee: "99.99% Financial Backed",
    },
  },
};

/**
 * Normalizes raw plan ID or tier string into a valid PlanTier.
 */
export function normalizePlanTier(rawTier?: string | null): PlanTier {
  if (!rawTier) return "free";
  const lower = rawTier.toLowerCase().trim();
  if (lower === "developer" || lower === "free" || lower === "starter") return "free";
  if (lower === "growth" || lower === "pro") return "growth";
  if (lower === "scale" || lower === "business") return "scale";
  if (lower === "enterprise" || lower === "custom") return "enterprise";
  return "free";
}

/**
 * Resolves full plan definition by tier with safe fallback to free.
 */
export function getPricingPlan(tier?: string | null): PlanFeatureDefinition {
  const normalized = normalizePlanTier(tier);
  return PRICING_PLANS[normalized];
}

/**
 * Evaluates whether a given tier has access to a specific boolean feature flag.
 */
export function canAccessFeature(
  tier: string | null | undefined,
  feature: keyof PlanFeatureDefinition["features"]
): boolean {
  const plan = getPricingPlan(tier);
  const val = plan.features[feature];
  return typeof val === "boolean" ? val : Boolean(val);
}

/**
 * Checks if current usage is strictly within the plan's allocated limit.
 */
export function isWithinLimit(
  tier: string | null | undefined,
  limitKey: keyof PlanFeatureDefinition["limits"],
  currentUsage: number
): boolean {
  const plan = getPricingPlan(tier);
  const maxLimit = plan.limits[limitKey];
  return currentUsage < maxLimit;
}

/* =========================================================================
   2. Backward Compatibility Registry for Legacy Billing Pipelines (Phase 13)
   ========================================================================= */

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
      "1 Project",
      "2 Team Members",
      "50k Monthly Requests",
      "Standard Gateway",
      "Runaway Loop Breaker",
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
    overageRatePerMillionTokensUsd: 3.5,
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
    overageRatePerMillionTokensUsd: 2.5,
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
    description: "Custom VPC deployment, unlimited throughput, and bespoke SLAs.",
    monthlyPriceUsd: 999,
    annualPriceUsd: 9590,
    includedTokens: 200_000_000,
    includedRequests: 10_000_000,
    includedProjects: 1000,
    includedMembers: 1000,
    gatewayRateLimitRpm: 6000,
    analyticsAccess: true,
    budgetAccess: true,
    advancedAnalytics: true,
    auditLogAccess: true,
    apiAccess: true,
    overageEnabled: true,
    overageRatePerMillionTokensUsd: 1.5,
    features: [
      "Unlimited Projects & Connections",
      "Dedicated VPC / Custom Egress IP",
      "99.99% Financial Backed SLA",
      "SOC2 & HIPAA BAA Legal Guarantee",
    ],
  },
};

/**
 * Resolves a plan by ID with safe fallback to FREE.
 */
export function getBillingPlan(rawPlanId?: string): BillingPlan {
  if (!rawPlanId) return BILLING_PLANS.FREE;
  const normalizedKey = rawPlanId.trim().toUpperCase();
  if (normalizedKey === "GROWTH") return BILLING_PLANS.PRO;
  if (normalizedKey === "SCALE") return BILLING_PLANS.BUSINESS;
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
  return norm in BILLING_PLANS || norm === "GROWTH" || norm === "SCALE";
}

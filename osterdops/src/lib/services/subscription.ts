/**
 * OsterdOps — Runtime Subscription Entitlements & Governance Engine
 *
 * Enforces live database entitlements and gateway limits dynamically
 * across Free, Pro, and Enterprise subscription tiers.
 */

import "server-only";
import {
  PlanEntitlements,
  PLAN_LIMITS,
} from "@/types/subscription";
import { getOrganizationById } from "./organization.service";
import { listOrganizationApiKeys } from "./api-key.service";

export { PLAN_LIMITS };
export type { PlanEntitlements };

/**
 * Normalizes any legacy or marketing plan tier string to one of the 3 canonical entitlement tiers:
 * "free" | "pro" | "enterprise"
 */
export function normalizeEntitlementTier(
  plan?: string | null
): "free" | "pro" | "enterprise" {
  if (!plan) return "free";
  const normalized = plan.toLowerCase().trim();

  if (normalized === "enterprise") {
    return "enterprise";
  }

  if (
    normalized === "pro" ||
    normalized === "growth" ||
    normalized === "scale" ||
    normalized === "starter" ||
    normalized === "team"
  ) {
    return "pro";
  }

  return "free";
}

/**
 * Returns the active PlanEntitlements for a given tier or plan name.
 */
export function getPlanEntitlements(
  tierOrPlan?: string | null
): PlanEntitlements {
  const canonicalTier = normalizeEntitlementTier(tierOrPlan);
  return PLAN_LIMITS[canonicalTier];
}

/**
 * Retrieves the live PlanEntitlements for an organization from the database.
 */
export async function getOrganizationEntitlements(
  orgId: string
): Promise<PlanEntitlements> {
  const org = await getOrganizationById(orgId);
  const tier = (org?.planTier || org?.plan) as string | undefined;
  return getPlanEntitlements(tier);
}

export interface OrganizationUsageMetrics {
  activeKeys: number;
  requestsThisMonth: number;
  maxGatewayKeys: number;
  monthlyRequestQuota: number;
  rateLimitPerMinute: number;
  logRetentionDays: number;
  canUseCircuitBreaker: boolean;
  canUseCustomFallbacks: boolean;
  canExportAuditLogs: boolean;
  allowedProviders: string[];
  tier: "free" | "pro" | "enterprise";
  entitlements: PlanEntitlements;
}

/**
 * Computes live usage metrics and entitlement limits for an organization.
 */
export async function getOrganizationUsageMetrics(
  orgId: string
): Promise<OrganizationUsageMetrics> {
  const org = await getOrganizationById(orgId);
  const rawTier = (org?.planTier || org?.plan) as string | undefined;
  const tier = normalizeEntitlementTier(rawTier);
  const entitlements = PLAN_LIMITS[tier];

  // Count active API keys
  let activeKeys = 0;
  try {
    const allKeys = await listOrganizationApiKeys(orgId);
    activeKeys = allKeys.filter((k) => {
      const st = String(k.status || "").toLowerCase();
      return st !== "revoked" && st !== "expired";
    }).length;
  } catch (err) {
    console.warn(`[OsterdOps Entitlements] Failed to count keys for org ${orgId}:`, err);
  }

  const requestsThisMonth = Number(
    (org as unknown as Record<string, unknown>)?.currentPeriodRequests || 0
  );

  return {
    activeKeys,
    requestsThisMonth,
    maxGatewayKeys: entitlements.maxGatewayKeys,
    monthlyRequestQuota: entitlements.monthlyRequestQuota,
    rateLimitPerMinute: entitlements.rateLimitPerMinute,
    logRetentionDays: entitlements.logRetentionDays,
    canUseCircuitBreaker: entitlements.canUseCircuitBreaker,
    canUseCustomFallbacks: entitlements.canUseCustomFallbacks,
    canExportAuditLogs: entitlements.canExportAuditLogs,
    allowedProviders: entitlements.allowedProviders,
    tier,
    entitlements,
  };
}

/**
 * Validates whether the organization is allowed to create a new Gateway API key.
 * If activeKeys >= maxGatewayKeys, blocks creation.
 */
export async function checkCanCreateKey(
  orgId: string
): Promise<{
  allowed: boolean;
  activeKeys: number;
  maxGatewayKeys: number;
  tier: "free" | "pro" | "enterprise";
  message?: string;
}> {
  const metrics = await getOrganizationUsageMetrics(orgId);

  if (metrics.activeKeys >= metrics.maxGatewayKeys) {
    const msg =
      metrics.tier === "free"
        ? "Free tier allows up to 3 keys. Upgrade to Pro for more."
        : `Key limit reached (${metrics.maxGatewayKeys} max keys on ${metrics.tier.toUpperCase()}). Upgrade your plan to create more keys.`;

    return {
      allowed: false,
      activeKeys: metrics.activeKeys,
      maxGatewayKeys: metrics.maxGatewayKeys,
      tier: metrics.tier,
      message: msg,
    };
  }

  return {
    allowed: true,
    activeKeys: metrics.activeKeys,
    maxGatewayKeys: metrics.maxGatewayKeys,
    tier: metrics.tier,
  };
}

/**
 * Validates whether the organization has remaining monthly request quota.
 */
export async function checkGatewayQuota(
  orgId: string,
  currentRequests?: number
): Promise<{
  allowed: boolean;
  currentMonthRequests: number;
  monthlyRequestQuota: number;
  tier: "free" | "pro" | "enterprise";
  error?: string;
  message?: string;
}> {
  const org = await getOrganizationById(orgId);
  const rawTier = (org?.planTier || org?.plan) as string | undefined;
  const tier = normalizeEntitlementTier(rawTier);
  const entitlements = PLAN_LIMITS[tier];

  const requests =
    currentRequests !== undefined
      ? currentRequests
      : Number((org as unknown as Record<string, unknown>)?.currentPeriodRequests || 0);

  if (requests >= entitlements.monthlyRequestQuota) {
    return {
      allowed: false,
      currentMonthRequests: requests,
      monthlyRequestQuota: entitlements.monthlyRequestQuota,
      tier,
      error: "MONTHLY_QUOTA_EXCEEDED",
      message: "Upgrade to Pro to increase limit.",
    };
  }

  return {
    allowed: true,
    currentMonthRequests: requests,
    monthlyRequestQuota: entitlements.monthlyRequestQuota,
    tier,
  };
}

/**
 * Checks if a given AI provider is permitted under the active subscription tier.
 */
export function isProviderAllowed(
  tierOrPlan: string | undefined | null,
  provider: string
): boolean {
  const entitlements = getPlanEntitlements(tierOrPlan);
  if (entitlements.allowedProviders.includes("*")) {
    return true;
  }
  const cleanProvider = provider.toLowerCase().trim();
  return entitlements.allowedProviders.some(
    (p) => p.toLowerCase() === cleanProvider
  );
}

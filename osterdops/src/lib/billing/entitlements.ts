/**
 * OsterdOps — Billing Entitlements Engine (Phase 13)
 * Pure entitlement resolvers and server-side organization subscription validation.
 */

import { getBillingPlan } from "./plans";
import type { BillingEntitlement, OrganizationSubscription } from "@/types";

/**
 * Derives entitlement limits and feature flags directly from a Plan.
 */
export function getPlanEntitlements(planId?: string): BillingEntitlement {
  const plan = getBillingPlan(planId);

  return {
    maxProjects: plan.includedProjects,
    maxMembers: plan.includedMembers,
    includedTokens: plan.includedTokens,
    includedRequests: plan.includedRequests,
    gatewayRateLimitRpm: plan.gatewayRateLimitRpm,
    canUseAnalytics: plan.analyticsAccess,
    canUseBudgets: plan.budgetAccess,
    canUseAdvancedAnalytics: plan.advancedAnalytics,
    canUseAuditLogs: plan.auditLogAccess,
    canCreateApiKeys: plan.apiAccess,
    overageEnabled: plan.overageEnabled,
  };
}

/**
 * Evaluates whether an active subscription contains a specific boolean entitlement.
 */
export function hasEntitlement(
  subscription: OrganizationSubscription | null | undefined,
  entitlement: keyof BillingEntitlement
): boolean {
  // If subscription is PAST_DUE or CANCELED or UNPAID, falls back to FREE entitlements
  const status = String(subscription?.status || "ACTIVE").toUpperCase();
  const isActive = status === "ACTIVE" || status === "TRIALING";
  const planId = isActive ? subscription?.planId : "FREE";
  const entitlements = getPlanEntitlements(planId);

  const value = entitlements[entitlement];
  return typeof value === "boolean" ? value : Boolean(value);
}

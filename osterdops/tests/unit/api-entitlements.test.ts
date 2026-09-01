/**
 * Unit Tests — Plan Entitlement Resolution & Enforcement
 */

import { getPlanEntitlements, hasEntitlement } from "@/lib/billing/entitlements";
import { EntitlementExceededError } from "@/lib/api/errors";
import type { OrganizationSubscription } from "@/types";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runApiEntitlementsTests() {
  // 1. Plan limits verification
  const freeLimits = getPlanEntitlements("FREE");
  assert(freeLimits.maxProjects === 2, "Free plan max projects must be 2.");
  assert(freeLimits.gatewayRateLimitRpm === 60, "Free plan rate limit must be 60 RPM.");

  const proLimits = getPlanEntitlements("PRO");
  assert(proLimits.maxProjects === 10, "Pro plan max projects must be 10.");
  assert(proLimits.gatewayRateLimitRpm === 300, "Pro plan rate limit must be 300 RPM.");

  const busLimits = getPlanEntitlements("BUSINESS");
  assert(busLimits.maxProjects === 50, "Business plan max projects must be 50.");
  assert(busLimits.gatewayRateLimitRpm === 1200, "Business plan rate limit must be 1200 RPM.");

  // 2. Active subscription entitlement checks
  const activeProSub: OrganizationSubscription = {
    id: "sub_test_123",
    organizationId: "org_test",
    planId: "PRO",
    status: "ACTIVE",
    interval: "MONTHLY",
    cancelAtPeriodEnd: false,
    provider: "simulation",
    currentPeriodStart: "2026-08-01T00:00:00Z",
    currentPeriodEnd: "2026-09-01T00:00:00Z",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  };

  assert(hasEntitlement(activeProSub, "canUseAuditLogs") === true, "Pro plan must have audit log access.");

  // 3. Inactive/canceled subscription falls back to Free
  const canceledSub: OrganizationSubscription = {
    ...activeProSub,
    status: "CANCELED",
  };

  assert(hasEntitlement(canceledSub, "canUseAuditLogs") === false, "Canceled sub must fallback to Free (no audit logs).");

  // 4. EntitlementExceededError instantiation
  const err = new EntitlementExceededError("Project limit reached for Free tier", {
    details: { limit: 2, current: 2, plan: "FREE" },
  });
  assert(err.statusCode === 403, "Entitlement error must have status 403.");
  assert(err.code === "ENTITLEMENT_EXCEEDED", "Error code must be ENTITLEMENT_EXCEEDED.");
}

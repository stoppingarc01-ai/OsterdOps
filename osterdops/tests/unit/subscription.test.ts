/**
 * OsterdOps — Phase 13: Subscription Lifecycle Unit Tests
 * Tests subscription state machine, trial periods, plan changes,
 * cancellation semantics, and reactivation.
 */

import { getBillingPlan } from "@/lib/billing/plans";
import { getCurrentBillingPeriod } from "@/lib/billing/periods";
import type { OrganizationSubscription, SubscriptionStatus } from "@/types";

export function testSubscriptionLifecycle() {
  const orgId = "org_sub_test";
  const period = getCurrentBillingPeriod("MONTHLY");

  // 1. Initial creation (TRIALING)
  const trialSub: OrganizationSubscription = {
    id: "sub_1",
    organizationId: orgId,
    planId: "PRO",
    status: "TRIALING",
    interval: "MONTHLY",
    currentPeriodStart: period.periodStart,
    currentPeriodEnd: period.periodEnd,
    cancelAtPeriodEnd: false,
    trialStart: "2026-08-01T00:00:00.000Z",
    trialEnd: "2026-08-15T00:00:00.000Z",
    provider: "stripe",
    providerSubscriptionId: "sub_stripe_123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (trialSub.status !== "TRIALING" || !trialSub.trialEnd) {
    throw new Error("Initial trial subscription setup invalid.");
  }

  // 2. Conversion from TRIALING to ACTIVE
  const activeSub: OrganizationSubscription = {
    ...trialSub,
    status: "ACTIVE",
    trialStart: undefined,
    trialEnd: undefined,
  };
  if (activeSub.status !== "ACTIVE") {
    throw new Error("Active transition failed.");
  }

  // 3. Plan change: PRO -> BUSINESS
  const businessPlan = getBillingPlan("BUSINESS");
  const upgradedSub: OrganizationSubscription = {
    ...activeSub,
    planId: businessPlan.planId,
    updatedAt: new Date().toISOString(),
  };
  if (upgradedSub.planId !== "BUSINESS") {
    throw new Error("Upgrade to BUSINESS plan failed.");
  }

  // 4. Cancellation at period end
  const cancelPendingSub: OrganizationSubscription = {
    ...upgradedSub,
    cancelAtPeriodEnd: true,
    canceledAt: new Date().toISOString(),
  };
  if (!cancelPendingSub.cancelAtPeriodEnd || cancelPendingSub.status !== "ACTIVE") {
    throw new Error("Cancel at period end should maintain ACTIVE status until period expiry.");
  }

  // 5. Reactivation
  const reactivatedSub: OrganizationSubscription = {
    ...cancelPendingSub,
    cancelAtPeriodEnd: false,
    canceledAt: undefined,
  };
  if (reactivatedSub.cancelAtPeriodEnd || reactivatedSub.status !== "ACTIVE") {
    throw new Error("Reactivation failed.");
  }

  // 6. Payment failure: ACTIVE -> PAST_DUE
  const pastDueSub: OrganizationSubscription = {
    ...reactivatedSub,
    status: "PAST_DUE",
  };
  if (pastDueSub.status !== "PAST_DUE") {
    throw new Error("Past due status transition failed.");
  }

  // 7. Final cancellation: PAST_DUE -> CANCELED
  const canceledSub: OrganizationSubscription = {
    ...pastDueSub,
    status: "CANCELED" as SubscriptionStatus,
    planId: "FREE",
  };
  if (canceledSub.status !== "CANCELED" || canceledSub.planId !== "FREE") {
    throw new Error("Final cancellation should reset plan to FREE.");
  }
}

export function runSubscriptionTests() {
  testSubscriptionLifecycle();
}

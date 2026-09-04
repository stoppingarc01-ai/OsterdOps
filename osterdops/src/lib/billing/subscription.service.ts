/**
 * OsterdOps — Organization Subscription Service (Phase 13)
 * Manages organization subscription lifecycles under:
 * organizations/{organizationId}/billing/subscription
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { getCurrentBillingPeriod } from "./periods";
import { getBillingPlan, isValidPlanId } from "./plans";
import { recordAuditLog } from "@/lib/services/audit.service";
import type {
  OrganizationSubscription,
  BillingPlanId,
  BillingInterval,
  SubscriptionStatus,
} from "@/types";

export interface CreateSubscriptionParams {
  planId: BillingPlanId;
  interval?: BillingInterval;
  provider?: "stripe" | "simulation";
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  trialDays?: number;
}

function sanitizeSubscription(
  docId: string,
  orgId: string,
  data: Record<string, unknown>
): OrganizationSubscription {
  const toDateString = (val: unknown): string => {
    if (!val) return new Date().toISOString();
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date().toISOString();
  };

  const rawPlanId = String(data.planId || "TRIAL").toUpperCase();
  const plan = getBillingPlan(rawPlanId);

  const rawStatus = String(data.status || "TRIALING").toUpperCase();
  const status: SubscriptionStatus = (
    rawStatus === "ACTIVE" ? "ACTIVE" :
    rawStatus === "PAST_DUE" ? "PAST_DUE" :
    rawStatus === "CANCELED" ? "CANCELED" :
    rawStatus === "INCOMPLETE" ? "INCOMPLETE" :
    rawStatus === "UNPAID" ? "UNPAID" :
    rawStatus === "EXPIRED" ? "EXPIRED" : "TRIALING"
  ) as SubscriptionStatus;

  const rawInterval = String(data.interval || "MONTHLY").toUpperCase();
  const interval: BillingInterval = rawInterval === "ANNUAL" ? "ANNUAL" : "MONTHLY";

  const period = getCurrentBillingPeriod(interval);

  return {
    id: docId,
    organizationId: orgId,
    planId: plan.planId,
    status,
    interval,
    currentPeriodStart: data.currentPeriodStart ? String(data.currentPeriodStart) : period.periodStart,
    currentPeriodEnd: data.currentPeriodEnd ? String(data.currentPeriodEnd) : period.periodEnd,
    cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
    canceledAt: data.canceledAt ? toDateString(data.canceledAt) : undefined,
    trialStart: data.trialStart ? toDateString(data.trialStart) : undefined,
    trialEnd: data.trialEnd ? toDateString(data.trialEnd) : undefined,
    provider: (data.provider as "stripe" | "simulation") || "simulation",
    providerCustomerId: data.providerCustomerId ? String(data.providerCustomerId) : undefined,
    providerSubscriptionId: data.providerSubscriptionId ? String(data.providerSubscriptionId) : undefined,
    createdAt: toDateString(data.createdAt),
    updatedAt: toDateString(data.updatedAt),
  };
}

/**
 * Returns the active subscription or defaults to a free tier subscription.
 */
export async function getSubscription(orgId: string): Promise<OrganizationSubscription> {
  const db = getAdminFirestore();
  const doc = await db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("subscription")
    .get();

  if (!doc.exists) {
    const period = getCurrentBillingPeriod("MONTHLY");
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      id: `sub_${orgId}_trial`,
      organizationId: orgId,
      planId: "TRIAL",
      status: "TRIALING",
      interval: "MONTHLY",
      currentPeriodStart: period.periodStart,
      currentPeriodEnd: period.periodEnd,
      trialStart: now.toISOString(),
      trialEnd: trialEnd.toISOString(),
      cancelAtPeriodEnd: false,
      provider: "simulation",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  return sanitizeSubscription(doc.id, orgId, doc.data() || {});
}

/**
 * Creates or overwrites an organization's subscription.
 */
export async function createSubscription(
  orgId: string,
  params: CreateSubscriptionParams,
  actorId?: string
): Promise<OrganizationSubscription> {
  const planId = isValidPlanId(params.planId) ? params.planId.toUpperCase() as BillingPlanId : "TRIAL";
  const interval = (params.interval?.toUpperCase() === "ANNUAL" ? "ANNUAL" : "MONTHLY") as BillingInterval;
  const period = getCurrentBillingPeriod(interval);

  const db = getAdminFirestore();
  const subRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("subscription");

  const now = FieldValue.serverTimestamp();
  const docId = params.providerSubscriptionId || `sub_${orgId}_${Date.now()}`;

  let trialStart: string | null = null;
  let trialEnd: string | null = null;
  let initialStatus: SubscriptionStatus = "ACTIVE";

  if (params.trialDays && params.trialDays > 0) {
    initialStatus = "TRIALING";
    const tStart = new Date();
    const tEnd = new Date();
    tEnd.setUTCDate(tEnd.getUTCDate() + params.trialDays);
    trialStart = tStart.toISOString();
    trialEnd = tEnd.toISOString();
  }

  const payload: Record<string, unknown> = {
    id: docId,
    organizationId: orgId,
    planId,
    status: initialStatus,
    interval,
    currentPeriodStart: period.periodStart,
    currentPeriodEnd: period.periodEnd,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    trialStart,
    trialEnd,
    provider: params.provider || "simulation",
    providerCustomerId: params.providerCustomerId || null,
    providerSubscriptionId: params.providerSubscriptionId || null,
    createdAt: now,
    updatedAt: now,
  };

  await subRef.set(payload);

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "SUBSCRIPTION_CREATED",
      resourceType: "subscription",
      resourceId: docId,
      details: { planId, interval, status: initialStatus },
    });
  }

  return sanitizeSubscription(docId, orgId, {
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Changes subscription plan or billing interval.
 */
export async function changePlan(
  orgId: string,
  newPlanId: BillingPlanId,
  interval?: BillingInterval,
  actorId?: string
): Promise<OrganizationSubscription> {
  const plan = getBillingPlan(newPlanId);
  const current = await getSubscription(orgId);
  const targetInterval = interval ? (interval.toUpperCase() === "ANNUAL" ? "ANNUAL" : "MONTHLY") : current.interval;

  const db = getAdminFirestore();
  const subRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("subscription");

  const period = getCurrentBillingPeriod(targetInterval);
  const now = FieldValue.serverTimestamp();

  const updates: Record<string, unknown> = {
    planId: plan.planId,
    interval: targetInterval,
    status: "ACTIVE",
    cancelAtPeriodEnd: false,
    canceledAt: null,
    currentPeriodStart: period.periodStart,
    currentPeriodEnd: period.periodEnd,
    updatedAt: now,
  };

  await subRef.set(updates, { merge: true });

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "SUBSCRIPTION_PLAN_CHANGED",
      resourceType: "subscription",
      resourceId: current.id,
      details: { oldPlan: current.planId, newPlan: plan.planId, interval: targetInterval },
    });
  }

  return getSubscription(orgId);
}

/**
 * Cancels a subscription (at period end or immediately).
 */
export async function cancelSubscription(
  orgId: string,
  immediate: boolean = false,
  actorId?: string
): Promise<OrganizationSubscription> {
  const current = await getSubscription(orgId);
  const db = getAdminFirestore();
  const subRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("subscription");

  const now = FieldValue.serverTimestamp();
  const updates: Record<string, unknown> = {
    cancelAtPeriodEnd: true,
    canceledAt: now,
    updatedAt: now,
  };

  if (immediate) {
    updates.status = "CANCELED";
    updates.planId = "TRIAL";
  }

  await subRef.set(updates, { merge: true });

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "SUBSCRIPTION_CANCELED",
      resourceType: "subscription",
      resourceId: current.id,
      details: { immediate, previousPlan: current.planId },
    });
  }

  return getSubscription(orgId);
}

/**
 * Reactivates a subscription pending cancellation.
 */
export async function reactivateSubscription(
  orgId: string,
  actorId?: string
): Promise<OrganizationSubscription> {
  const current = await getSubscription(orgId);
  const db = getAdminFirestore();
  const subRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("subscription");

  const now = FieldValue.serverTimestamp();
  const updates: Record<string, unknown> = {
    cancelAtPeriodEnd: false,
    canceledAt: null,
    status: "ACTIVE",
    updatedAt: now,
  };

  await subRef.set(updates, { merge: true });

  if (actorId) {
    await recordAuditLog({
      organizationId: orgId,
      actorId,
      action: "SUBSCRIPTION_REACTIVATED",
      resourceType: "subscription",
      resourceId: current.id,
      details: { planId: current.planId },
    });
  }

  return getSubscription(orgId);
}

/**
 * Synchronizes incoming subscription data from a payment provider webhook.
 */
export async function syncSubscription(
  orgId: string,
  providerData: Partial<OrganizationSubscription>
): Promise<OrganizationSubscription> {
  const db = getAdminFirestore();
  const subRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("billing")
    .doc("subscription");

  const updates: Record<string, unknown> = {
    ...providerData,
    updatedAt: FieldValue.serverTimestamp(),
  };

  await subRef.set(updates, { merge: true });
  return getSubscription(orgId);
}

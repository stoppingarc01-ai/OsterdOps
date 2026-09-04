/**
 * OsterdOps — Subscription Gating & Access Control Engine
 * Enforces strict 7-day free trial expiration and RFC 7807 403 paywall responses.
 */

import { NextResponse } from "next/server";
import { getSubscription } from "./subscription.service";
import { getUserById } from "@/lib/services/user.service";
import type { SubscriptionAccessResult, UserSubscriptionMetadata } from "@/types/subscription";
import type { AuthenticatedUser } from "@/lib/auth/server";
import type { User } from "@/types";

export const SUBSCRIPTION_REQUIRED_MESSAGE =
  "Your 7-day free trial has expired. Upgrade your plan to continue using OsterdOps Firewall & Telemetry.";

/**
 * Checks subscription status for an organization and/or user.
 * Returns access status, trial days remaining, and plan ID.
 */
export async function checkSubscriptionAccess(
  orgId?: string | null,
  user?: AuthenticatedUser | User | null
): Promise<SubscriptionAccessResult> {
  const now = Date.now();

  // 1. If organization ID is provided, check organization subscription
  if (orgId) {
    try {
      const sub = await getSubscription(orgId);
      const rawStatus = String(sub.status || "").toLowerCase();

      // Active paid subscription
      if (rawStatus === "active") {
        return {
          hasAccess: true,
          isTrial: false,
          isExpired: false,
          daysRemaining: Infinity,
          planId: sub.planId,
          status: "active",
        };
      }

      // Trial subscription
      if (rawStatus === "trialing") {
        const trialEndStr = sub.trialEnd || sub.currentPeriodEnd;
        const endMs = trialEndStr ? new Date(trialEndStr).getTime() : now;
        const isExpired = now > endMs;
        const daysRemaining = Math.max(0, Math.ceil((endMs - now) / (1000 * 60 * 60 * 24)));

        if (isExpired) {
          return {
            hasAccess: false,
            isTrial: true,
            isExpired: true,
            daysRemaining: 0,
            planId: sub.planId,
            status: "expired",
            reason: SUBSCRIPTION_REQUIRED_MESSAGE,
          };
        }

        return {
          hasAccess: true,
          isTrial: true,
          isExpired: false,
          daysRemaining,
          planId: sub.planId,
          status: "trialing",
        };
      }

      // Other statuses (canceled, past_due, unpaid, expired)
      return {
        hasAccess: false,
        isTrial: false,
        isExpired: true,
        daysRemaining: 0,
        planId: sub.planId,
        status: rawStatus,
        reason: SUBSCRIPTION_REQUIRED_MESSAGE,
      };
    } catch (err) {
      console.warn("[OsterdOps Access] Failed to fetch organization subscription:", err);
    }
  }

  // 2. If user is provided, check user-level subscription metadata
  if (user) {
    let subMeta: UserSubscriptionMetadata | undefined = (user as User).subscription;

    if (!subMeta && "uid" in user && user.uid) {
      const userProfile = await getUserById(user.uid);
      if (userProfile?.subscription) {
        subMeta = userProfile.subscription;
      }
    }

    if (subMeta) {
      const status = subMeta.status.toLowerCase();
      if (status === "active") {
        return {
          hasAccess: true,
          isTrial: false,
          isExpired: false,
          daysRemaining: Infinity,
          planId: subMeta.planId || "pro",
          status: "active",
        };
      }

      if (status === "trialing") {
        const endMs = new Date(subMeta.trialEndsAt).getTime();
        const isExpired = now > endMs;
        const daysRemaining = Math.max(0, Math.ceil((endMs - now) / (1000 * 60 * 60 * 24)));

        if (isExpired) {
          return {
            hasAccess: false,
            isTrial: true,
            isExpired: true,
            daysRemaining: 0,
            planId: subMeta.planId || "trial-7d",
            status: "expired",
            reason: SUBSCRIPTION_REQUIRED_MESSAGE,
          };
        }

        return {
          hasAccess: true,
          isTrial: true,
          isExpired: false,
          daysRemaining,
          planId: subMeta.planId || "trial-7d",
          status: "trialing",
        };
      }

      return {
        hasAccess: false,
        isTrial: false,
        isExpired: true,
        daysRemaining: 0,
        planId: subMeta.planId || "trial-7d",
        status,
        reason: SUBSCRIPTION_REQUIRED_MESSAGE,
      };
    }
  }

  // Fallback: Default to active trial for simulated or local development users without explicit doc
  return {
    hasAccess: true,
    isTrial: true,
    isExpired: false,
    daysRemaining: 7,
    planId: "trial-7d",
    status: "trialing",
  };
}

/**
 * Creates an RFC 7807 problem details HTTP 403 Forbidden response.
 */
export function createSubscriptionRequiredResponse(customMessage?: string): NextResponse {
  const message = customMessage || SUBSCRIPTION_REQUIRED_MESSAGE;
  return NextResponse.json(
    {
      type: "https://osterdops.com/errors/subscription-required",
      title: "Subscription Required",
      status: 403,
      detail: message,
      error: {
        code: "SUBSCRIPTION_REQUIRED",
        message,
      },
    },
    {
      status: 403,
      headers: {
        "Content-Type": "application/problem+json; charset=utf-8",
      },
    }
  );
}

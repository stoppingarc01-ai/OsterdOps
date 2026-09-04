"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import type { SubscriptionAccessResult } from "@/types/subscription";

/**
 * Hook to evaluate whether the current workspace/user has active subscription or valid trial access.
 * Returns { hasAccess, isTrial, daysRemaining, isExpired, planId, status }.
 */
export function useSubscriptionAccess(): SubscriptionAccessResult {
  const { userProfile, currentOrg } = useAuth();
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    // 1. Check current organization status
    if (currentOrg) {
      const orgStatus = (currentOrg.status || "").toLowerCase();
      const planTier = (currentOrg.planTier || currentOrg.plan || "trial").toLowerCase();

      if (orgStatus === "active" && planTier !== "trial") {
        return {
          hasAccess: true,
          isTrial: false,
          isExpired: false,
          daysRemaining: Infinity,
          planId: planTier,
          status: "active",
        };
      }

      if (orgStatus === "suspended" || orgStatus === "canceled") {
        return {
          hasAccess: false,
          isTrial: false,
          isExpired: true,
          daysRemaining: 0,
          planId: planTier,
          status: orgStatus,
          reason: "Organization subscription is suspended or canceled.",
        };
      }
    }

    // 2. Check user-level subscription metadata
    const sub = userProfile?.subscription;
    if (sub) {
      const status = (sub.status || "").toLowerCase();

      if (status === "active") {
        return {
          hasAccess: true,
          isTrial: false,
          isExpired: false,
          daysRemaining: Infinity,
          planId: sub.planId || "pro",
          status: "active",
        };
      }

      if (status === "trialing") {
        const endMs = new Date(sub.trialEndsAt).getTime();
        const isExpired = currentTime > endMs;
        const daysRemaining = Math.max(0, Math.ceil((endMs - currentTime) / (1000 * 60 * 60 * 24)));

        return {
          hasAccess: !isExpired,
          isTrial: true,
          isExpired,
          daysRemaining,
          planId: sub.planId || "trial-7d",
          status: isExpired ? "expired" : "trialing",
          reason: isExpired ? "Your 7-day free trial has expired." : undefined,
        };
      }

      return {
        hasAccess: false,
        isTrial: false,
        isExpired: true,
        daysRemaining: 0,
        planId: sub.planId || "trial-7d",
        status,
        reason: "Active subscription required.",
      };
    }

    // Default: If newly registered or waiting for metadata, grant initial trial access
    return {
      hasAccess: true,
      isTrial: true,
      isExpired: false,
      daysRemaining: 7,
      planId: "trial-7d",
      status: "trialing",
    };
  }, [userProfile, currentOrg, currentTime]);
}

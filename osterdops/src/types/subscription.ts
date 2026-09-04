/**
 * OsterdOps — Subscription & Monetization Domain Types
 * Strict 7-Day Free Trial and subscription gating definitions.
 */

export type TrialStatus = "trialing" | "expired" | "converted";

export interface UserSubscriptionMetadata {
  status: "trialing" | "active" | "past_due" | "canceled" | "expired";
  trialStartsAt: string; // ISO Date
  trialEndsAt: string;   // ISO Date (startsAt + 7 days)
  planId: string;        // 'trial-7d' | 'growth' | 'scale' | 'enterprise'
  isActive: boolean;
}

export interface SubscriptionAccessResult {
  hasAccess: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  planId: string;
  status: string;
  reason?: string;
}

export const TRIAL_CONFIG = {
  durationDays: 7,
  requestLimit: 1_000,
  tokenLimit: 50_000,
  planId: "trial-7d",
} as const;

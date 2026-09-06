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

export interface PlanEntitlements {
  tier: "free" | "pro" | "enterprise";
  maxGatewayKeys: number;
  monthlyRequestQuota: number;
  rateLimitPerMinute: number;
  logRetentionDays: number;
  canUseCircuitBreaker: boolean;
  canUseCustomFallbacks: boolean;
  canExportAuditLogs: boolean;
  allowedProviders: string[]; // e.g. ["gemini", "openai"] vs ["all"]
}

export const PLAN_LIMITS: Record<"free" | "pro" | "enterprise", PlanEntitlements> = {
  free: {
    tier: "free",
    maxGatewayKeys: 3,
    monthlyRequestQuota: 10_000,
    rateLimitPerMinute: 60,
    logRetentionDays: 3,
    canUseCircuitBreaker: false,
    canUseCustomFallbacks: false,
    canExportAuditLogs: false,
    allowedProviders: ["openai", "gemini", "groq"],
  },
  pro: {
    tier: "pro",
    maxGatewayKeys: 25,
    monthlyRequestQuota: 500_000,
    rateLimitPerMinute: 600,
    logRetentionDays: 30,
    canUseCircuitBreaker: true,
    canUseCustomFallbacks: true,
    canExportAuditLogs: true,
    allowedProviders: ["*"], // all providers including Anthropic Opus/Sonnet
  },
  enterprise: {
    tier: "enterprise",
    maxGatewayKeys: 1000,
    monthlyRequestQuota: 10_000_000,
    rateLimitPerMinute: 5000,
    logRetentionDays: 365,
    canUseCircuitBreaker: true,
    canUseCustomFallbacks: true,
    canExportAuditLogs: true,
    allowedProviders: ["*"],
  },
};


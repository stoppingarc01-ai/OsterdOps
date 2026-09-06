/**
 * OsterdOps — Organization Settings Schema
 * Authoritative data structure for company profile, AI gateway finops controls, and alert webhooks.
 */

export interface OrganizationSettings {
  orgId: string;
  // 1. Company Profile & Billing
  companyName: string;
  billingEmail: string;
  taxId?: string; // GSTIN / VAT
  billingAddress: string;
  country: string;

  // 2. Gateway Controls
  defaultModel: string; // e.g. "claude-3-7-sonnet" or "gpt-4o"
  requestTimeoutSeconds: number; // default 30s
  enableCircuitBreaker: boolean;
  enableRunawayLoopGuard: boolean;
  hardBudgetCapUsd: number;
  rateLimitDebugMode?: boolean;
  hardQuotaEnforcement?: boolean;
  telemetryRetentionDays?: number; // 30, 60, 90, 180, 365

  // 3. Preferences Grid & System Switches
  timezone?: string;
  language?: string;
  dateFormat?: string; // e.g. "DD MMM, YYYY"
  darkMode?: boolean;
  emailNotifications?: boolean;
  productUpdates?: boolean;

  // 4. Notifications & Alerts
  alertEmail: string;
  slackWebhookUrl?: string;
  notifyRunawayLoop?: boolean;
  notify80Percent?: boolean;
  notify100Percent?: boolean;
  notifyWeeklyDigest?: boolean;
  notifyProviderFailover?: boolean;

  updatedAt: string;

  // Workspace Policy Compatibility
  mfaEnforced?: boolean;
  ipWhitelist?: string[];
  allowedModels?: string[];
  spendLimitNotificationEmails?: string[];
}

/**
 * Returns sensible default settings for an organization.
 */
export function getDefaultOrganizationSettings(
  orgId: string,
  companyName?: string,
  billingEmail?: string
): OrganizationSettings {
  return {
    orgId,
    companyName: companyName?.trim() || "OsterdOps AI Corp",
    billingEmail: billingEmail?.trim() || "billing@osterdops.com",
    taxId: "",
    billingAddress: "100 Enterprise Way, Suite 400, San Francisco, CA 94107",
    country: "United States",
    defaultModel: "claude-3-7-sonnet",
    requestTimeoutSeconds: 30,
    enableCircuitBreaker: true,
    enableRunawayLoopGuard: true,
    hardBudgetCapUsd: 1000,
    rateLimitDebugMode: false,
    hardQuotaEnforcement: true,
    telemetryRetentionDays: 90,
    timezone: "UTC (Coordinated Universal Time)",
    language: "en-US (English)",
    dateFormat: "DD MMM, YYYY",
    darkMode: true,
    emailNotifications: true,
    productUpdates: false,
    alertEmail: billingEmail?.trim() || "alerts@osterdops.com",
    slackWebhookUrl: "",
    notifyRunawayLoop: true,
    notify80Percent: true,
    notify100Percent: true,
    notifyWeeklyDigest: true,
    notifyProviderFailover: true,
    updatedAt: new Date().toISOString(),
  };
}

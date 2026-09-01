/**
 * OsterdOps — Core Backend & Domain Data Models
 * Type definitions matching the Cloud Firestore schema and gateway runtime.
 */

import type { Timestamp } from "firebase/firestore";

/* ============================================================
   1. Role-Based Access Control (RBAC) & Organization
   ============================================================ */

export type OrganizationRole = "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";

export type MembershipStatus = "active" | "invited" | "suspended";

export type OrganizationPlan = "starter" | "team" | "enterprise";

export type OrganizationStatus = "active" | "suspended" | "trialing";

export interface OrganizationSettings {
  mfaEnforced?: boolean;
  ipWhitelist?: string[];
  allowedModels?: string[];
  defaultModel?: string;
  spendLimitNotificationEmails?: string[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: OrganizationPlan;
  status: OrganizationStatus;
  spendLimitUsd?: number;
  currentPeriodSpendUsd: number;
  currentPeriodStart: Timestamp | string;
  settings: OrganizationSettings;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface OrganizationMember {
  userId: string;
  email: string;
  displayName: string;
  role: OrganizationRole;
  status: MembershipStatus;
  invitedBy?: string;
  joinedAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

/* ============================================================
   2. Projects & API Keys
   ============================================================ */

export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "active" | "archived" | "suspended";

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  status: ProjectStatus;
  createdBy?: string;
  spendLimitMonthly?: number;
  currentMonthSpend?: number;
  totalRequests?: number;
  totalTokens?: number;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export type ApiKeyEnvironment = "production" | "staging" | "development";

export type ApiKeyStatus = "active" | "revoked" | "expired";

export interface ApiKey {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  keyPrefix: string; // e.g. "ost_live_••••94f2"
  keyHash: string;   // SHA-256 hash
  environment: ApiKeyEnvironment;
  status: ApiKeyStatus;
  scopes?: string[]; // Fine-grained API key scopes
  createdBy: string;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  lastUsedAt?: Timestamp | string;
  expiresAt?: Timestamp | string;
}

/** Result when creating a new API key - plaintext key is returned ONLY once */
export interface GeneratedApiKeyResponse {
  key: ApiKey;
  secret: string; // Full unmasked plaintext secret: "osk_live_..."
}

/* ============================================================
   3. Provider Connections
   ============================================================ */

export type AIProvider = "openai" | "anthropic" | "gemini" | "azure" | "bedrock";

export type ProviderConnectionStatus =
  | "active"
  | "invalid"
  | "rate_limited"
  | "disabled"
  | "validation_failed"
  | "unvalidated";

export interface ProviderConnection {
  id: string;
  organizationId: string;
  projectId?: string; // Optional project association
  provider: AIProvider;
  name: string;
  displayName?: string;
  status: ProviderConnectionStatus;
  encryptedKey: string; // AES-256-GCM ciphertext (redacted from client responses)
  keyIv: string;        // Initialization vector (redacted from client responses)
  keyTag: string;       // GCM auth tag (redacted from client responses)
  maskedKey: string;    // Safe preview e.g. "sk-proj-••••49a1"
  customBaseUrl?: string;
  createdBy?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  lastValidatedAt?: Timestamp | string;
  lastUsedAt?: Timestamp | string;
}

/* ============================================================
   4. Budgets & Governance (Phases 10 & 12)
   ============================================================ */

export type BudgetPeriod =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "CUSTOM"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "custom";

export type BudgetStatus =
  | "ACTIVE"
  | "PAUSED"
  | "EXCEEDED"
  | "ARCHIVED"
  | "EXPIRED"
  | "active"
  | "paused"
  | "exceeded"
  | "expired";

export type EnforcementType = "SOFT" | "HARD";
export type EnforcementMode = "MONITOR" | "BLOCK" | EnforcementType;

export type BudgetThresholdLevel = number;

export interface Budget {
  id: string;
  organizationId: string;
  projectId?: string; // If undefined, applies to entire organization
  name: string;
  description?: string;
  amountUsd: number;
  limitUsd?: number; // Phase 12 alias to amountUsd
  currentSpendUsd?: number;
  currency?: string; // Default: "USD"
  period: BudgetPeriod;
  periodStart?: string; // ISO 8601
  periodEnd?: string;   // ISO 8601
  currentPeriodStart?: string; // Phase 12 alias
  currentPeriodEnd?: string;   // Phase 12 alias
  thresholds?: number[];
  warningThresholds?: number[]; // Phase 12 alias
  alertThresholds?: BudgetThresholdLevel[];
  triggeredThresholds?: BudgetThresholdLevel[];
  enabled?: boolean;
  enforcement?: EnforcementType; // "SOFT" | "HARD"
  enforcementMode?: EnforcementMode;
  enforceHardLimit?: boolean; // Legacy flag mapped to enforcementMode
  status: BudgetStatus;
  createdBy?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface BudgetPricingCoverage {
  pricedRequests: number;
  unpricedRequests: number;
  pricedSpendUsd: number;
}

export interface BudgetThresholdItem {
  percent: number;
  triggered: boolean;
  severity: AlertSeverity;
}

export interface BudgetStatusResponse {
  budgetId: string;
  budgetName: string;
  organizationId: string;
  projectId?: string;
  amountUsd: number;
  limitUsd?: number;
  currentSpendUsd: number;
  remainingUsd: number;
  overspendUsd: number;
  utilizationPercent: number;
  status: "NORMAL" | "INFO" | "WARNING" | "CRITICAL" | "EXCEEDED";
  period: BudgetPeriod;
  periodStart: string;
  periodEnd: string;
  pricingCoverage: BudgetPricingCoverage;
  thresholds: BudgetThresholdItem[];
  activeAlertsCount: number;
}

export interface BudgetEnforcementResult {
  allowed: boolean;
  reason?: string;
  budgetId?: string;
  limitUsd?: number;
  currentSpendUsd?: number;
  enforcement?: EnforcementType;
}

/* ============================================================
   5. Alerts & Notifications (Phases 10 & 12)
   ============================================================ */

export type AlertType =
  | "BUDGET_THRESHOLD"
  | "BUDGET_EXCEEDED"
  | "SPEND_SPIKE"
  | "PROVIDER_ERROR_SPIKE"
  | "ANOMALY";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type AlertStatus =
  | "ACTIVE"
  | "ACKNOWLEDGED"
  | "RESOLVED"
  | "active"
  | "acknowledged"
  | "resolved";

export interface Alert {
  id: string;
  organizationId: string;
  projectId?: string;
  budgetId?: string;
  type: AlertType;
  thresholdPercent?: number;
  budgetAmountUsd?: number;
  budgetLimitUsd?: number; // Phase 12 alias
  currentSpendUsd?: number;
  spendUsd?: number; // Phase 12 alias
  remainingUsd?: number;
  overspendUsd?: number;
  periodStart?: string;
  periodEnd?: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  dedupKey: string;
  deduplicationKey?: string; // Phase 12 alias
  status: AlertStatus;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  acknowledgedAt?: Timestamp | string;
  resolvedAt?: Timestamp | string;
  acknowledgedBy?: string;
  resolvedBy?: string;
}

export interface AlertFilterOptions {
  budgetId?: string;
  projectId?: string;
  severity?: AlertSeverity;
  status?: AlertStatus;
  type?: AlertType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface NotificationPreferences {
  organizationId: string;
  userId: string;
  budgetThresholdAlerts: boolean;
  budgetExceededAlerts: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  emailRecipient?: string;
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
  updatedAt: string;
}

/* ============================================================
   6. Gateway Telemetry & Usage Tracking
   ============================================================ */

export type CostCalculationType = "calculated" | "provider-reported" | "estimated";

export type UsageRequestStatus = "SUCCESS" | "ERROR" | "TIMEOUT" | "RATE_LIMITED";

export interface UsageRecord {
  id: string; // Document ID (matches requestId for idempotency)
  requestId: string;
  organizationId: string;
  projectId: string;
  apiKeyId: string;
  provider: AIProvider | string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
  costUsd?: number;
  costType?: CostCalculationType;
  latencyMs: number;
  statusCode: number;
  status: UsageRequestStatus;
  errorCode?: string;
  timestamp: Timestamp | string;
  datePartition: string; // "YYYY-MM-DD"
}

export interface UsageFilterOptions {
  projectId?: string;
  provider?: string;
  model?: string;
  apiKeyId?: string;
  status?: UsageRequestStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface UsageAggregationGroup {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
}

export interface UsageAggregationResult {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCachedTokens: number;
  totalReasoningTokens: number;
  byProvider: Record<string, UsageAggregationGroup>;
  byModel: Record<string, UsageAggregationGroup>;
  byProject: Record<string, UsageAggregationGroup>;
  byStatus: Record<string, number>;
}

/* ============================================================
   7. Cost Engine & Financial Tracking (Phase 9)
   ============================================================ */

export type PricingStatus = "AVAILABLE" | "UNAVAILABLE";

export interface CostRecord {
  id: string; // Document ID (matches usageId/requestId)
  usageId: string;
  requestId: string;
  organizationId: string;
  projectId: string;
  apiKeyId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  inputCostUsd: number | null;
  outputCostUsd: number | null;
  cachedInputCostUsd: number | null;
  reasoningCostUsd: number | null;
  totalCostUsd: number | null;
  pricingVersion: string;
  pricingEffectiveAt: string;
  pricingStatus: PricingStatus;
  unavailableReason?: string;
  timestamp: Timestamp | string;
  datePartition: string; // "YYYY-MM-DD"
}

export interface CostFilterOptions {
  projectId?: string;
  provider?: string;
  model?: string;
  apiKeyId?: string;
  pricingStatus?: PricingStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface CostSpendGroup {
  spendUsd: number;
  requests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
}

export interface CostDailySpend {
  date: string;
  spendUsd: number;
  requests: number;
  tokens: number;
}

export interface CostAggregationResult {
  totalSpendUsd: number;
  totalRequests: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCachedTokens: number;
  totalReasoningTokens: number;
  byProvider: Record<string, CostSpendGroup>;
  byModel: Record<string, CostSpendGroup>;
  byProject: Record<string, CostSpendGroup>;
  dailySpend: CostDailySpend[];
}

/* ============================================================
   8. Analytics, Observability & Metrics Engine (Phase 11)
   ============================================================ */

export type AnalyticsTimeRange = "24h" | "7d" | "30d" | "90d" | "custom";

export interface LatencyPercentiles {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  avg: number;
  min: number;
  max: number;
}

export interface AnalyticsKpiSummary {
  totalSpendUsd: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCachedTokens: number;
  totalReasoningTokens: number;
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  successRatePercent: number;
  errorRatePercent: number;
  averageLatencyMs: number;
  latencyPercentiles: LatencyPercentiles;
  totalCacheSavingsUsd: number;
  cacheHitRatePercent: number;
}

export interface ProviderAnalyticsGroup {
  provider: string;
  spendUsd: number;
  requests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  averageLatencyMs: number;
  errorRatePercent: number;
  percentageOfSpend: number;
}

export interface ModelAnalyticsGroup {
  model: string;
  provider: string;
  spendUsd: number;
  requests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  averageLatencyMs: number;
  latencyPercentiles: LatencyPercentiles;
  errorRatePercent: number;
  cacheHitRatePercent: number;
  cacheSavingsUsd: number;
  percentageOfSpend: number;
}

export interface ProjectAnalyticsGroup {
  projectId: string;
  projectName: string;
  spendUsd: number;
  requests: number;
  totalTokens: number;
  averageLatencyMs: number;
  errorRatePercent: number;
  percentageOfSpend: number;
}

export interface ApiKeyAnalyticsGroup {
  apiKeyId: string;
  name?: string;
  projectId: string;
  spendUsd: number;
  requests: number;
  totalTokens: number;
  errorRatePercent: number;
}

export interface TimeSeriesMetricPoint {
  date: string;
  spendUsd: number;
  requests: number;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  averageLatencyMs: number;
  errorCount: number;
}

export interface AnalyticsOverviewResponse {
  organizationId: string;
  projectId?: string;
  timeRange: AnalyticsTimeRange;
  startDate: string;
  endDate: string;
  kpis: AnalyticsKpiSummary;
  byProvider: ProviderAnalyticsGroup[];
  byModel: ModelAnalyticsGroup[];
  byProject: ProjectAnalyticsGroup[];
  byApiKey: ApiKeyAnalyticsGroup[];
  byStatusCode: Record<string, number>;
  timeSeries: TimeSeriesMetricPoint[];
}

export interface AnalyticsFilterOptions {
  projectId?: string;
  provider?: string;
  model?: string;
  apiKeyId?: string;
  timeRange?: AnalyticsTimeRange;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/* ============================================================
   9. Audit Logs
   ============================================================ */

export interface AuditLog {
  id: string;
  organizationId: string;
  actorId: string;
  actorEmail?: string;
  action: string; // e.g. "project.created", "apiKey.revoked", "budget.updated"
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp | string;
}

/* ============================================================
   10. Optimization Recommendations
   ============================================================ */

export type RecommendationType =
  | "MODEL_DOWNGRADE"
  | "PROMPT_CACHING"
  | "REDUNDANT_REQUESTS"
  | "RATE_OPTIMIZATION";

export type RecommendationStatus = "active" | "applied" | "dismissed";

export interface OptimizationRecommendation {
  id: string;
  organizationId: string;
  projectId?: string;
  type: RecommendationType;
  title: string;
  description: string;
  currentModel?: string;
  recommendedModel?: string;
  estimatedMonthlySavingsUsd: number;
  confidenceScore: number; // 0.0 - 1.0
  status: RecommendationStatus;
  createdAt: Timestamp | string;
}

/* ============================================================
   11. Billing, Subscriptions & Revenue Engine (Phase 13)
   ============================================================ */

export type BillingPlanId =
  | "FREE"
  | "PRO"
  | "BUSINESS"
  | "ENTERPRISE"
  | "free"
  | "pro"
  | "business"
  | "enterprise";

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "UNPAID"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid";

export type InvoiceStatus =
  | "DRAFT"
  | "OPEN"
  | "PAID"
  | "VOID"
  | "UNCOLLECTIBLE"
  | "FAILED"
  | "draft"
  | "open"
  | "paid"
  | "void"
  | "uncollectible"
  | "failed";

export type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELED"
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "canceled";

export type BillingInterval = "MONTHLY" | "ANNUAL" | "monthly" | "annual";

export interface BillingPlan {
  planId: BillingPlanId;
  displayName: string;
  description: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  includedTokens: number;
  includedRequests: number;
  includedProjects: number;
  includedMembers: number;
  gatewayRateLimitRpm: number;
  analyticsAccess: boolean;
  budgetAccess: boolean;
  advancedAnalytics: boolean;
  auditLogAccess: boolean;
  apiAccess: boolean;
  overageEnabled: boolean;
  overageRatePerMillionTokensUsd: number;
  features: string[];
}

export interface BillingEntitlement {
  maxProjects: number;
  maxMembers: number;
  includedTokens: number;
  includedRequests: number;
  gatewayRateLimitRpm: number;
  canUseAnalytics: boolean;
  canUseBudgets: boolean;
  canUseAdvancedAnalytics: boolean;
  canUseAuditLogs: boolean;
  canCreateApiKeys: boolean;
  overageEnabled: boolean;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  planId: BillingPlanId;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  provider: "stripe" | "simulation";
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface BillingCustomer {
  id: string;
  organizationId: string;
  email: string;
  currency: string;
  provider: "stripe" | "simulation";
  providerCustomerId: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export type InvoiceLineItemType = "SUBSCRIPTION" | "OVERAGE" | "ADJUSTMENT" | "CREDIT";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceUsd: number;
  amountUsd: number;
  type: InvoiceLineItemType;
  metadata?: Record<string, unknown>;
}

export interface Invoice {
  id: string;
  organizationId: string;
  subscriptionId?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  currency: string;
  subtotalUsd: number;
  creditsUsd: number;
  totalUsd: number;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  provider: "stripe" | "simulation";
  providerInvoiceId?: string;
  createdAt: Timestamp | string;
  finalizedAt?: Timestamp | string;
  paidAt?: Timestamp | string;
  voidedAt?: Timestamp | string;
}

export interface BillingUsageSummary {
  totalRequests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  totalProviderSpendUsd: number;
  includedTokens: number;
  overageTokens: number;
  overageSpendUsd: number;
  estimatedBillableUsd: number;
  pricingCoverageStatus: "FULL" | "PARTIAL" | "UNAVAILABLE";
}

export interface BillingSummaryResponse {
  organizationId: string;
  customer?: BillingCustomer | null;
  subscription: OrganizationSubscription;
  plan: BillingPlan;
  entitlements: BillingEntitlement;
  billingPeriod: {
    periodStart: string;
    periodEnd: string;
    interval: BillingInterval;
  };
  basePriceUsd: number;
  usageSummary: BillingUsageSummary;
  estimatedTotalUsd: number;
  lastInvoice?: Invoice | null;
  outstandingBalanceUsd: number;
  nextBillingDate: string;
}

export interface BillingFilterOptions {
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface BillingCheckoutParams {
  organizationId: string;
  planId: BillingPlanId;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}

export interface BillingCheckoutResult {
  sessionId: string;
  url: string;
  provider: "stripe" | "simulation";
}

/* ============================================================
   12. Security Hardening, Compliance & Enterprise Trust (Phase 15)
   ============================================================ */

export type SecurityEventType =
  | "AUTH_SUCCESS"
  | "AUTH_FAILURE"
  | "SESSION_REVOKED"
  | "API_KEY_CREATED"
  | "API_KEY_ROTATED"
  | "API_KEY_REVOKED"
  | "API_KEY_EXPIRED"
  | "API_KEY_AUTH_FAILED"
  | "PERMISSION_DENIED"
  | "CROSS_TENANT_ACCESS_BLOCKED"
  | "RATE_LIMIT_TRIGGERED"
  | "SUSPICIOUS_REQUEST"
  | "BUDGET_REQUEST_BLOCKED"
  | "BILLING_SECURITY_EVENT"
  | "WEBHOOK_SIGNATURE_FAILURE"
  | "SECURITY_CONFIGURATION_CHANGED";

export type SecurityEventSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  organizationId: string;
  actorId?: string;
  targetResourceType?: string;
  targetResourceId?: string;
  ipHash?: string;
  userAgentSnippet?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface TamperEvidentAuditRecord {
  id: string;
  organizationId: string;
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  requestId?: string;
  result: "SUCCESS" | "FAILURE" | "DENIED";
  reasonCode?: string;
  details?: Record<string, unknown>;
  previousHash: string;
  currentHash: string;
  sequenceNumber: number;
}

export interface AuditVerificationResult {
  valid: boolean;
  totalRecords: number;
  tamperedRecordIds: string[];
  brokenChainIndex?: number;
  details: string;
}

export type RetentionCategory =
  | "SECURITY"
  | "OPERATIONAL"
  | "ANALYTICS"
  | "BILLING"
  | "AUDIT"
  | "TEMPORARY";

export interface RetentionPolicy {
  category: RetentionCategory;
  retentionDays: number;
  legalHold: boolean;
  protectedFromDeletion: boolean;
}

export interface RetentionEvaluationResult {
  category: RetentionCategory;
  recordId: string;
  createdAt: string;
  ageDays: number;
  eligibleForDeletion: boolean;
  reason: string;
}

export interface PrivacyExportManifest {
  exportId: string;
  organizationId: string;
  requestedBy: string;
  generatedAt: string;
  categories: string[];
  data: {
    organization: Record<string, unknown>;
    members: Array<Record<string, unknown>>;
    projects: Array<Record<string, unknown>>;
    apiKeysMetadata: Array<Record<string, unknown>>;
    usageSummary: Record<string, unknown>;
    costSummary: Record<string, unknown>;
    alerts: Array<Record<string, unknown>>;
    notificationsPreferences: Record<string, unknown>;
    auditEvents: Array<Record<string, unknown>>;
  };
  checksum: string;
}

export type DeletionRequestStatus =
  | "REQUESTED"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "PROCESSING"
  | "COMPLETED"
  | "REJECTED";

export interface PrivacyDeletionRequest {
  id: string;
  organizationId: string;
  requestedBy: string;
  status: DeletionRequestStatus;
  reason: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  completedAt?: string;
  retainedCategories: RetentionCategory[];
  notes?: string;
}

export interface OrganizationSecuritySettings {
  organizationId: string;
  sessionTimeoutMinutes: number;
  enforceApiKeyExpiration: boolean;
  defaultApiKeyExpiryDays: number;
  allowedOrigins: string[];
  securityAlertThresholds: {
    authFailureCount: number;
    apiKeyFailureCount: number;
    rateLimitBlockCount: number;
  };
  retentionOverrides?: Partial<Record<RetentionCategory, number>>;
  updatedAt: string;
  updatedBy?: string;
}

export type SecurityPostureStatus = "PASS" | "WARN" | "FAIL" | "NOT_CONFIGURED";

export interface SecurityPostureCheck {
  name: string;
  category: string;
  status: SecurityPostureStatus;
  description: string;
  details?: string;
}

export interface SecurityPostureReport {
  overallStatus: "PASS" | "WARN" | "FAIL";
  evaluatedAt: string;
  environment: string;
  checks: SecurityPostureCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
}

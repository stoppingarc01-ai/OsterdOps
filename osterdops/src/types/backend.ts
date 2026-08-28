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

export type ProjectStatus = "active" | "archived" | "suspended";

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  spendLimitMonthly?: number;
  currentMonthSpend: number;
  totalRequests: number;
  totalTokens: number;
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
  keyPrefix: string; // e.g. "osk_live_••••94f2"
  keyHash: string;   // SHA-256 hash
  environment: ApiKeyEnvironment;
  status: ApiKeyStatus;
  createdBy: string;
  createdAt: Timestamp | string;
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

export type ProviderConnectionStatus = "active" | "invalid" | "rate_limited" | "disabled";

export interface ProviderConnection {
  id: string;
  organizationId: string;
  provider: AIProvider;
  name: string;
  status: ProviderConnectionStatus;
  encryptedKey: string; // AES-256-GCM ciphertext
  keyIv: string;        // Initialization vector
  keyTag: string;       // GCM auth tag
  maskedKey: string;    // e.g. "sk-proj-••••49a1"
  customBaseUrl?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

/* ============================================================
   4. Budgets & Governance
   ============================================================ */

export type BudgetPeriod = "daily" | "weekly" | "monthly" | "quarterly";

export type BudgetStatus = "active" | "paused" | "exceeded";

export type BudgetThresholdLevel = 50 | 75 | 80 | 90 | 100;

export interface Budget {
  id: string;
  organizationId: string;
  projectId?: string; // If undefined, applies to entire organization
  name: string;
  amountUsd: number;
  period: BudgetPeriod;
  alertThresholds: BudgetThresholdLevel[];
  triggeredThresholds: BudgetThresholdLevel[];
  enforceHardLimit: boolean; // Rejects gateway calls with HTTP 429 when 100% is reached
  status: BudgetStatus;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

/* ============================================================
   5. Alerts & Notifications
   ============================================================ */

export type AlertType =
  | "BUDGET_THRESHOLD"
  | "BUDGET_EXCEEDED"
  | "SPEND_SPIKE"
  | "PROVIDER_ERROR_SPIKE"
  | "ANOMALY";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  organizationId: string;
  projectId?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  dedupKey: string;
  status: AlertStatus;
  createdAt: Timestamp | string;
}

/* ============================================================
   6. Gateway Telemetry & Usage Tracking
   ============================================================ */

export type CostCalculationType = "calculated" | "provider-reported" | "estimated";

export interface UsageRecord {
  id: string; // requestId
  organizationId: string;
  projectId: string;
  apiKeyId: string;
  provider: AIProvider | string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  costType: CostCalculationType;
  latencyMs: number;
  statusCode: number;
  errorCode?: string;
  timestamp: Timestamp | string;
  datePartition: string; // "YYYY-MM-DD"
}

/* ============================================================
   7. Audit Logs
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
   8. Optimization Recommendations
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

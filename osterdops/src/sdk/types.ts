export interface OsterdOpsClientOptions {
  /** OsterdOps Project API Key (defaults to process.env.OSTERDOPS_API_KEY) */
  apiKey?: string;
  /** Base URL for the OsterdOps API (defaults to process.env.OSTERDOPS_BASE_URL or https://api.osterdops.com) */
  baseUrl?: string;
  /** API Version to target (default: "v1") */
  apiVersion?: string;
  /** Request timeout in milliseconds (default: 30000ms) */
  timeoutMs?: number;
  /** Maximum number of retry attempts for safe transient failures (default: 2) */
  maxRetries?: number;
  /** Additional custom headers to include with every request */
  headers?: Record<string, string>;
  /** Optional custom fetch implementation */
  fetch?: typeof fetch;
}

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
}

export type AIProvider = "openai" | "anthropic" | "gemini" | "azure" | "bedrock" | "meta" | "groq" | "mistral" | "kimi" | "moonshot" | "custom";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool" | "developer";
  content: string;
  name?: string;
}

export interface ChatCompletionParams {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  max_tokens?: number;
  topP?: number;
  top_p?: number;
  stream?: boolean;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  provider?: AIProvider;
  requestId?: string;
  [key: string]: unknown;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  provider: AIProvider;
  model: string;
  output: {
    role: "assistant";
    content: string;
  };
  usage: TokenUsage | null;
  finishReason: string;
  latencyMs: number;
  costUsd?: number;
  cacheSavingsUsd?: number;
}

export interface ProjectData {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  status: "ACTIVE" | "ARCHIVED" | "active" | "archived" | "suspended";
  spendLimitMonthly?: number;
  currentMonthSpend?: number;
  totalRequests?: number;
  totalTokens?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectParams {
  name: string;
  slug?: string;
  description?: string;
  spendLimitMonthly?: number;
  organizationId?: string;
}

export interface UpdateProjectParams {
  name?: string;
  description?: string;
  spendLimitMonthly?: number;
  status?: "ACTIVE" | "ARCHIVED";
}

export type ApiKeyEnvironment = "production" | "staging" | "development";

export interface ApiKeyData {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  keyPrefix: string;
  environment: ApiKeyEnvironment;
  status: "active" | "revoked" | "expired";
  createdBy: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

export interface GeneratedApiKeyData extends ApiKeyData {
  /** The plaintext API key secret. Returned EXACTLY ONCE upon creation. */
  secret: string;
}

export interface CreateApiKeyParams {
  name: string;
  environment?: ApiKeyEnvironment;
  expiresAt?: string;
}

export interface UsageSummaryParams {
  organizationId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  granularity?: "hour" | "day" | "month";
}

export interface UsageData {
  totalRequests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalCostUsd: number;
  periodStart?: string;
  periodEnd?: string;
  byProvider?: Record<string, { requests: number; tokens: number; costUsd: number }>;
  byModel?: Record<string, { requests: number; tokens: number; costUsd: number }>;
}

export interface CostSummaryData {
  organizationId: string;
  projectId?: string;
  totalCostUsd: number;
  budgetCapUsd?: number;
  currency: string;
  period: string;
  breakdown: Array<{
    provider: string;
    model: string;
    costUsd: number;
    tokens: number;
    requests: number;
  }>;
}

export interface AnalyticsOverviewData {
  totalRequests: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  cacheHitRatePercent: number;
  errorRatePercent: number;
  timeseries: Array<{
    timestamp: string;
    requests: number;
    costUsd: number;
    avgLatencyMs: number;
  }>;
}

export interface BudgetData {
  id: string;
  organizationId: string;
  projectId?: string;
  name: string;
  description?: string;
  amountUsd: number;
  currentSpendUsd?: number;
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM" | "daily" | "weekly" | "monthly" | "quarterly" | "custom";
  thresholds?: number[];
  enforcement?: "SOFT" | "HARD";
  enforcementMode?: "MONITOR" | "BLOCK" | "SOFT" | "HARD";
  status: "ACTIVE" | "PAUSED" | "EXCEEDED" | "ARCHIVED" | "EXPIRED" | "active" | "paused" | "exceeded" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetParams {
  name: string;
  amountUsd: number;
  period: "daily" | "weekly" | "monthly" | "quarterly";
  projectId?: string;
  thresholds?: number[];
  enforcementMode?: "MONITOR" | "BLOCK";
  description?: string;
}

export interface AlertData {
  id: string;
  organizationId: string;
  projectId?: string;
  budgetId?: string;
  type: "BUDGET_THRESHOLD" | "SPEND_VELOCITY" | "ANOMALY" | "PROVIDER_ERROR";
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "PENDING" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";
  message: string;
  currentValueUsd?: number;
  thresholdPercent?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  slackEnabled: boolean;
  webhookEnabled: boolean;
  webhookUrl?: string;
  alertSeverities: Array<"INFO" | "WARNING" | "CRITICAL">;
}

export interface BillingSummary {
  plan: "starter" | "team" | "enterprise";
  status: "active" | "past_due" | "canceled" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  currentPeriodSpendUsd: number;
  spendLimitUsd?: number;
  currency: string;
}

export interface InvoiceData {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  amountDueUsd: number;
  amountPaidUsd: number;
  status: "draft" | "open" | "paid" | "uncollectible" | "void";
  periodStart: string;
  periodEnd: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface SystemHealthData {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  environment: string;
  timestamp: string;
  services?: Record<string, { status: string; latencyMs?: number }>;
}

export interface DoctorResult {
  healthy: boolean;
  timestamp: string;
  checks: {
    apiKeyConfigured: { pass: boolean; message: string };
    baseUrlReachable: { pass: boolean; message: string; latencyMs?: number };
    authenticationValid: { pass: boolean; message: string };
    projectAccessible: { pass: boolean; message: string; projectId?: string };
    gatewayOperational: { pass: boolean; message: string };
    rateLimitStatus: { pass: boolean; remaining?: number; message: string };
    budgetStatus: { pass: boolean; message: string; currentSpendUsd?: number; limitUsd?: number };
  };
}

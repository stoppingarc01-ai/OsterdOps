/**
 * OsterdOps TypeScript SDK
 * The official client library for the OsterdOps AI Cost Governance & Gateway Platform.
 */

export { OsterdOpsClient } from "./client";
export {
  GatewayResource,
  ProjectsResource,
  ApiKeysResource,
  UsageResource,
  CostsResource,
  AnalyticsResource,
  BudgetsResource,
  AlertsResource,
  BillingResource,
  NotificationsResource,
  SystemResource,
} from "./resources";
export {
  OsterdOpsError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  RateLimitError,
  BudgetExceededError,
  NotFoundError,
  ConflictError,
  IdempotencyConflictError,
  EntitlementExceededError,
  ProviderError,
  TimeoutError,
  NetworkError,
  ServerError,
} from "./errors";
export type {
  OsterdOpsClientOptions,
  PaginationOptions,
  AIProvider,
  ChatMessage,
  ChatCompletionParams,
  ChatCompletionResponse,
  TokenUsage,
  ProjectData,
  CreateProjectParams,
  UpdateProjectParams,
  ApiKeyEnvironment,
  ApiKeyData,
  GeneratedApiKeyData,
  CreateApiKeyParams,
  UsageSummaryParams,
  UsageData,
  CostSummaryData,
  AnalyticsOverviewData,
  BudgetData,
  CreateBudgetParams,
  AlertData,
  BillingSummary,
  InvoiceData,
  NotificationPreferences,
  SystemHealthData,
  DoctorResult,
} from "./types";
export { runCli } from "./cli";

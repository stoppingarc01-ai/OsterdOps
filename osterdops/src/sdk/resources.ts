/**
 * OsterdOps TypeScript SDK — Resource Client Modules
 * Strongly typed method interfaces for all OsterdOps API domains.
 */

import type { HttpClient } from "./http";
import type {
  ChatCompletionParams,
  ChatCompletionResponse,
  ProjectData,
  CreateProjectParams,
  UpdateProjectParams,
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
} from "./types";

export class GatewayResource {
  constructor(private readonly http: HttpClient) {}

  public readonly chat = {
    /**
     * Executes a chat completion through the OsterdOps AI Gateway.
     * Enforces governance, routes to upstream provider, calculates real-time cost, and records usage.
     */
    create: async (params: ChatCompletionParams): Promise<ChatCompletionResponse> => {
      const response = await this.http.request<ChatCompletionResponse>({
        method: "POST",
        path: "/api/v1/chat/completions",
        body: params,
        requestId: params.requestId,
      });

      // Extract telemetry headers if not in body
      const res = response.data;
      if (response.headers["x-osterdops-cost-usd"] && !res.costUsd) {
        res.costUsd = parseFloat(response.headers["x-osterdops-cost-usd"]);
      }
      if (response.headers["x-osterdops-cache-savings-usd"] && !res.cacheSavingsUsd) {
        res.cacheSavingsUsd = parseFloat(response.headers["x-osterdops-cache-savings-usd"]);
      }
      if (response.headers["x-osterdops-latency-ms"] && !res.latencyMs) {
        res.latencyMs = parseInt(response.headers["x-osterdops-latency-ms"], 10);
      }

      return res;
    },
  };
}

export class ProjectsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Lists all active projects in the organization.
   */
  public async list(organizationId?: string): Promise<ProjectData[]> {
    const res = await this.http.request<ProjectData[]>({
      method: "GET",
      path: "/api/v1/projects",
      params: { organizationId },
    });
    return res.data;
  }

  /**
   * Retrieves details for a specific project.
   */
  public async get(projectId: string): Promise<ProjectData> {
    const res = await this.http.request<ProjectData>({
      method: "GET",
      path: `/api/v1/projects/${projectId}`,
    });
    return res.data;
  }

  /**
   * Creates a new project in the organization.
   */
  public async create(params: CreateProjectParams): Promise<ProjectData> {
    const res = await this.http.request<ProjectData>({
      method: "POST",
      path: "/api/v1/projects",
      body: params,
    });
    return res.data;
  }

  /**
   * Updates an existing project's metadata or monthly spend limit.
   */
  public async update(projectId: string, params: UpdateProjectParams): Promise<ProjectData> {
    const res = await this.http.request<ProjectData>({
      method: "PATCH",
      path: `/api/v1/projects/${projectId}`,
      body: params,
    });
    return res.data;
  }

  /**
   * Archives a project.
   */
  public async archive(projectId: string): Promise<{ success: boolean }> {
    const res = await this.http.request<{ success: boolean }>({
      method: "DELETE",
      path: `/api/v1/projects/${projectId}`,
    });
    return res.data;
  }
}

export class ApiKeysResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Lists all API keys for a project (plaintext secrets are never returned).
   */
  public async list(projectId: string): Promise<ApiKeyData[]> {
    const res = await this.http.request<ApiKeyData[]>({
      method: "GET",
      path: `/api/v1/projects/${projectId}/api-keys`,
    });
    return res.data;
  }

  /**
   * Creates a new API key for a project.
   * Returns the unmasked plaintext secret EXACTLY ONCE.
   */
  public async create(projectId: string, params: CreateApiKeyParams): Promise<GeneratedApiKeyData> {
    const res = await this.http.request<GeneratedApiKeyData>({
      method: "POST",
      path: `/api/v1/projects/${projectId}/api-keys`,
      body: params,
    });
    return res.data;
  }

  /**
   * Revokes an existing API key immediately.
   */
  public async revoke(projectId: string, keyId: string): Promise<{ success: boolean }> {
    const res = await this.http.request<{ success: boolean }>({
      method: "POST",
      path: `/api/v1/projects/${projectId}/api-keys/${keyId}/revoke`,
    });
    return res.data;
  }

  /**
   * Rotates an API key, issuing a replacement with a new secret while scheduling old key revocation.
   */
  public async rotate(projectId: string, keyId: string): Promise<GeneratedApiKeyData> {
    const res = await this.http.request<GeneratedApiKeyData>({
      method: "POST",
      path: `/api/v1/projects/${projectId}/api-keys/${keyId}/rotate`,
    });
    return res.data;
  }
}

export class UsageResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves aggregated token and request usage across the organization.
   */
  public async get(params?: UsageSummaryParams): Promise<UsageData> {
    const res = await this.http.request<UsageData>({
      method: "GET",
      path: "/api/v1/usage",
      params: params as Record<string, string | number | boolean | undefined>,
    });
    return res.data;
  }

  /**
   * Retrieves usage breakdown for a specific project.
   */
  public async getByProject(projectId: string, params?: UsageSummaryParams): Promise<UsageData> {
    const res = await this.http.request<UsageData>({
      method: "GET",
      path: `/api/v1/projects/${projectId}/usage`,
      params: params as Record<string, string | number | boolean | undefined>,
    });
    return res.data;
  }
}

export class CostsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves cost summaries and model spend breakdowns.
   */
  public async get(params?: { organizationId?: string; projectId?: string }): Promise<CostSummaryData> {
    const res = await this.http.request<CostSummaryData>({
      method: "GET",
      path: "/api/v1/costs",
      params,
    });
    return res.data;
  }

  /**
   * Retrieves cost summaries for a specific project.
   */
  public async getByProject(projectId: string): Promise<CostSummaryData> {
    const res = await this.http.request<CostSummaryData>({
      method: "GET",
      path: `/api/v1/projects/${projectId}/costs`,
    });
    return res.data;
  }
}

export class AnalyticsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves executive metrics (total spend, requests, latency percentiles, error rate).
   */
  public async overview(params?: { organizationId?: string; projectId?: string; timeframe?: string }): Promise<AnalyticsOverviewData> {
    const res = await this.http.request<AnalyticsOverviewData>({
      method: "GET",
      path: "/api/v1/analytics/overview",
      params,
    });
    return res.data;
  }

  /**
   * Retrieves detailed latency distribution and percentiles (p50, p95, p99).
   */
  public async latency(params?: { organizationId?: string; projectId?: string }): Promise<Record<string, unknown>> {
    const res = await this.http.request<Record<string, unknown>>({
      method: "GET",
      path: "/api/v1/analytics/latency",
      params,
    });
    return res.data;
  }
}

export class BudgetsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Lists all organization and project budgets.
   */
  public async list(organizationId?: string): Promise<BudgetData[]> {
    const res = await this.http.request<BudgetData[]>({
      method: "GET",
      path: "/api/v1/budgets",
      params: { organizationId },
    });
    return res.data;
  }

  /**
   * Retrieves a specific budget by ID.
   */
  public async get(budgetId: string): Promise<BudgetData> {
    const res = await this.http.request<BudgetData>({
      method: "GET",
      path: `/api/v1/budgets/${budgetId}`,
    });
    return res.data;
  }

  /**
   * Creates a new budget with threshold alerts and enforcement modes.
   */
  public async create(params: CreateBudgetParams): Promise<BudgetData> {
    const res = await this.http.request<BudgetData>({
      method: "POST",
      path: "/api/v1/budgets",
      body: params,
    });
    return res.data;
  }

  /**
   * Pauses active budget evaluation.
   */
  public async pause(budgetId: string): Promise<BudgetData> {
    const res = await this.http.request<BudgetData>({
      method: "POST",
      path: `/api/v1/budgets/${budgetId}/pause`,
    });
    return res.data;
  }

  /**
   * Resumes a paused budget.
   */
  public async resume(budgetId: string): Promise<BudgetData> {
    const res = await this.http.request<BudgetData>({
      method: "POST",
      path: `/api/v1/budgets/${budgetId}/resume`,
    });
    return res.data;
  }

  /**
   * Evaluates current spend against budget limits on demand.
   */
  public async evaluate(budgetId: string): Promise<{ budgetId: string; currentSpendUsd: number; status: string }> {
    const res = await this.http.request<{ budgetId: string; currentSpendUsd: number; status: string }>({
      method: "POST",
      path: `/api/v1/budgets/${budgetId}/evaluate`,
    });
    return res.data;
  }
}

export class AlertsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Lists active and historical spend & threshold alerts.
   */
  public async list(organizationId?: string): Promise<AlertData[]> {
    const res = await this.http.request<AlertData[]>({
      method: "GET",
      path: "/api/v1/alerts",
      params: { organizationId },
    });
    return res.data;
  }

  /**
   * Acknowledges an active alert.
   */
  public async acknowledge(alertId: string): Promise<AlertData> {
    const res = await this.http.request<AlertData>({
      method: "POST",
      path: `/api/v1/alerts/${alertId}/acknowledge`,
    });
    return res.data;
  }

  /**
   * Resolves an alert.
   */
  public async resolve(alertId: string): Promise<AlertData> {
    const res = await this.http.request<AlertData>({
      method: "POST",
      path: `/api/v1/alerts/${alertId}/resolve`,
    });
    return res.data;
  }
}

export class BillingResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves the current organization billing status and plan entitlements.
   */
  public async get(): Promise<BillingSummary> {
    const res = await this.http.request<BillingSummary>({
      method: "GET",
      path: "/api/v1/billing",
    });
    return res.data;
  }

  /**
   * Lists past billing invoices and payment receipts.
   */
  public async invoices(): Promise<InvoiceData[]> {
    const res = await this.http.request<InvoiceData[]>({
      method: "GET",
      path: "/api/v1/billing/invoices",
    });
    return res.data;
  }

  /**
   * Retrieves metered billing usage for the active billing period.
   */
  public async usage(): Promise<Record<string, unknown>> {
    const res = await this.http.request<Record<string, unknown>>({
      method: "GET",
      path: "/api/v1/billing/usage",
    });
    return res.data;
  }
}

export class NotificationsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves user notification preferences.
   */
  public async getPreferences(): Promise<NotificationPreferences> {
    const res = await this.http.request<NotificationPreferences>({
      method: "GET",
      path: "/api/v1/notifications/preferences",
    });
    return res.data;
  }

  /**
   * Updates notification channels and alert severity thresholds.
   */
  public async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const res = await this.http.request<NotificationPreferences>({
      method: "POST",
      path: "/api/v1/notifications/preferences",
      body: preferences,
    });
    return res.data;
  }
}

export class SystemResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Basic liveness probe check.
   */
  public async health(): Promise<SystemHealthData> {
    const res = await this.http.request<SystemHealthData>({
      method: "GET",
      path: "/api/v1/system/health",
    });
    return res.data;
  }

  /**
   * Comprehensive system diagnostics check (requires ADMIN/OWNER permissions for privileged stats).
   */
  public async diagnostics(): Promise<Record<string, unknown>> {
    const res = await this.http.request<Record<string, unknown>>({
      method: "GET",
      path: "/api/v1/system/diagnostics",
    });
    return res.data;
  }
}

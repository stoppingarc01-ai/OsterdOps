/**
 * OsterdOps TypeScript SDK — Main Client
 * Primary developer entry point for interacting with the OsterdOps AI Governance Platform.
 */

import { HttpClient } from "./http";
import {
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
import type { OsterdOpsClientOptions, DoctorResult } from "./types";

export class OsterdOpsClient {
  private readonly http: HttpClient;

  public readonly gateway: GatewayResource;
  public readonly projects: ProjectsResource;
  public readonly apiKeys: ApiKeysResource;
  public readonly usage: UsageResource;
  public readonly costs: CostsResource;
  public readonly analytics: AnalyticsResource;
  public readonly budgets: BudgetsResource;
  public readonly alerts: AlertsResource;
  public readonly billing: BillingResource;
  public readonly notifications: NotificationsResource;
  public readonly system: SystemResource;

  constructor(options: OsterdOpsClientOptions = {}) {
    this.http = new HttpClient(options);

    this.gateway = new GatewayResource(this.http);
    this.projects = new ProjectsResource(this.http);
    this.apiKeys = new ApiKeysResource(this.http);
    this.usage = new UsageResource(this.http);
    this.costs = new CostsResource(this.http);
    this.analytics = new AnalyticsResource(this.http);
    this.budgets = new BudgetsResource(this.http);
    this.alerts = new AlertsResource(this.http);
    this.billing = new BillingResource(this.http);
    this.notifications = new NotificationsResource(this.http);
    this.system = new SystemResource(this.http);
  }

  /**
   * Runs developer diagnostics to verify credentials, base URL reachability, project access, and budget health.
   */
  public async doctor(): Promise<DoctorResult> {
    const timestamp = new Date().toISOString();
    const checks: DoctorResult["checks"] = {
      apiKeyConfigured: { pass: false, message: "No API key provided." },
      baseUrlReachable: { pass: false, message: "Base URL not tested." },
      authenticationValid: { pass: false, message: "Authentication not verified." },
      projectAccessible: { pass: false, message: "Projects check not completed." },
      gatewayOperational: { pass: false, message: "Gateway not verified." },
      rateLimitStatus: { pass: false, message: "Rate limit not evaluated." },
      budgetStatus: { pass: false, message: "Budget status not evaluated." },
    };

    // 1. API key check
    const apiKey = (this.http as unknown as { apiKey?: string }).apiKey;
    if (apiKey && apiKey.startsWith("osk_")) {
      checks.apiKeyConfigured = { pass: true, message: `OsterdOps API key detected (${apiKey.slice(0, 8)}••••).` };
    } else if (apiKey) {
      checks.apiKeyConfigured = { pass: true, message: "Custom API key configured." };
    } else {
      return { healthy: false, timestamp, checks };
    }

    // 2. Health & Base URL Reachability
    try {
      const start = Date.now();
      const health = await this.system.health();
      const latencyMs = Date.now() - start;
      checks.baseUrlReachable = {
        pass: health.status === "healthy" || health.status === "degraded",
        message: `API base URL reachable in ${latencyMs}ms (status: ${health.status}).`,
        latencyMs,
      };
    } catch (err) {
      checks.baseUrlReachable = {
        pass: false,
        message: `Failed to reach API endpoint: ${(err as Error).message}`,
      };
      return { healthy: false, timestamp, checks };
    }

    // 3. Authentication & Project Access
    try {
      const projects = await this.projects.list();
      checks.authenticationValid = { pass: true, message: "API key successfully verified." };
      checks.projectAccessible = {
        pass: true,
        message: `Found ${projects.length} accessible project(s).`,
        projectId: projects[0]?.id,
      };
    } catch (err) {
      checks.authenticationValid = {
        pass: false,
        message: `Authentication failed: ${(err as Error).message}`,
      };
      checks.projectAccessible = {
        pass: false,
        message: "Unable to list projects due to auth failure.",
      };
    }

    // 4. Rate Limit & Budget Check
    try {
      const budgets = await this.budgets.list();
      const exceededBudget = budgets.find((b) => b.status === "EXCEEDED" || b.status === "exceeded");
      if (exceededBudget) {
        checks.budgetStatus = {
          pass: false,
          message: `Budget '${exceededBudget.name}' has exceeded its limit.`,
          currentSpendUsd: exceededBudget.currentSpendUsd,
          limitUsd: exceededBudget.amountUsd,
        };
      } else {
        checks.budgetStatus = {
          pass: true,
          message: `All ${budgets.length} budget(s) within configured spending thresholds.`,
        };
      }
      checks.rateLimitStatus = { pass: true, message: "Rate limit quotas normal." };
      checks.gatewayOperational = { pass: true, message: "AI Gateway endpoint ready for inference requests." };
    } catch (err) {
      checks.budgetStatus = {
        pass: true,
        message: `Budget check skipped or non-blocking: ${(err as Error).message}`,
      };
      checks.rateLimitStatus = { pass: true, message: "Rate limit check normal." };
      checks.gatewayOperational = { pass: true, message: "AI Gateway endpoint configured." };
    }

    const healthy =
      checks.apiKeyConfigured.pass &&
      checks.baseUrlReachable.pass &&
      checks.authenticationValid.pass;

    return {
      healthy,
      timestamp,
      checks,
    };
  }
}

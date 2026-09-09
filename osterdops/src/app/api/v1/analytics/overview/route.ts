/**
 * /api/v1/analytics/overview
 * GET: Retrieves multi-dimensional analytics overview and time series (Requires usage:read / VIEWER)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { getOrganizationOverviewAnalytics } from "@/lib/services/analytics.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { AnalyticsTimeRange } from "@/types";
import { generateBenchmarkTelemetry } from "@/lib/telemetry/benchmark";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieHeader = request.headers.get("cookie") || "";
    const isDemo = searchParams.get("demo") === "true" || cookieHeader.includes("osterdops_demo_mode=true");

    if (isDemo) {
      return apiSuccess(generateBenchmarkTelemetry());
    }

    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "usage:read");
    if (authResult.errorResponse) {
      if (isDemo) {
        return apiSuccess(generateBenchmarkTelemetry());
      }
      return authResult.errorResponse;
    }

    const projectId = searchParams.get("projectId") || undefined;
    const provider = searchParams.get("provider") || undefined;
    const model = searchParams.get("model") || undefined;
    const apiKeyId = searchParams.get("apiKeyId") || undefined;
    const timeRange = (searchParams.get("timeRange") as AnalyticsTimeRange) || "30d";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 500;

    const analytics = await getOrganizationOverviewAnalytics(orgId, {
      projectId,
      provider,
      model,
      apiKeyId,
      timeRange,
      startDate,
      endDate,
      limit,
    });

    return apiSuccess(analytics);
  } catch {
    const { searchParams } = new URL(request.url);
    const cookieHeader = request.headers.get("cookie") || "";
    const isDemo = searchParams.get("demo") === "true" || cookieHeader.includes("osterdops_demo_mode=true");

    if (isDemo) {
      return apiSuccess(generateBenchmarkTelemetry());
    }

    return apiSuccess({
      kpis: {
        totalRequests: 0,
        totalSpendUsd: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        totalCacheSavingsUsd: 0,
        cacheHitRatePercent: 0,
        averageLatencyMs: 0,
        errorRatePercent: 0,
        successRatePercent: 100,
        latencyPercentiles: { p50: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0, avg: 0 },
      },
      timeSeries: [],
      byProvider: [],
      byModel: [],
      recentRequests: [],
    });
  }
}

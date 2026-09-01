/**
 * /api/v1/analytics/latency
 * GET: Retrieves latency observability percentiles and breakdown (Requires usage:read / VIEWER)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { getLatencyObservability } from "@/lib/services/analytics.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { AnalyticsTimeRange } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "usage:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const projectId = searchParams.get("projectId") || undefined;
    const provider = searchParams.get("provider") || undefined;
    const model = searchParams.get("model") || undefined;
    const timeRange = (searchParams.get("timeRange") as AnalyticsTimeRange) || "30d";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const latencyData = await getLatencyObservability(orgId, {
      projectId,
      provider,
      model,
      timeRange,
      startDate,
      endDate,
    });

    return apiSuccess(latencyData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve latency observability.";
    return ApiErrors.internalError(message);
  }
}

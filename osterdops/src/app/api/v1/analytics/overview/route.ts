/**
 * /api/v1/analytics/overview
 * GET: Retrieves multi-dimensional analytics overview and time series (Requires usage:read / VIEWER)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { getOrganizationOverviewAnalytics } from "@/lib/services/analytics.service";
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve analytics overview.";
    return ApiErrors.internalError(message);
  }
}

/**
 * GET /api/v1/organizations/[orgId]/analytics/overview
 * Real data analytics endpoint for dashboard KPIs, breakdown charts, and time series (Requires VIEWER)
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import { getOrganizationOverviewAnalytics } from "@/lib/services/analytics.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { AnalyticsTimeRange } from "@/types";

interface Params {
  params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, context: Params) {
  try {
    const { orgId } = await context.params;

    const authResult = await requireOrganizationMember(request, orgId, "VIEWER");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || undefined;
    const provider = searchParams.get("provider") || undefined;
    const model = searchParams.get("model") || undefined;
    const apiKeyId = searchParams.get("apiKeyId") || undefined;
    const timeRange = (searchParams.get("timeRange") as AnalyticsTimeRange) || "30d";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const limit = Math.min(1000, Math.max(10, Number(searchParams.get("limit")) || 500));

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
    const message = err instanceof Error ? err.message : "Failed to retrieve organization analytics overview.";
    return ApiErrors.internalError(message);
  }
}

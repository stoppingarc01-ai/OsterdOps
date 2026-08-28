/**
 * GET /api/v1/organizations/[orgId]/analytics/overview
 * Real data analytics endpoint for dashboard KPIs, breakdown charts, and time series (Requires VIEWER)
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import { getOrganizationOverviewAnalytics } from "@/lib/services/analytics.service";
import { apiSuccess } from "@/lib/api/response";

interface Params {
  params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, context: Params) {
  const { orgId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "VIEWER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(1000, Math.max(10, Number(searchParams.get("limit")) || 500));

  const analytics = await getOrganizationOverviewAnalytics(orgId, limit);
  return apiSuccess(analytics);
}

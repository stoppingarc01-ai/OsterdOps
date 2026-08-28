/**
 * GET /api/v1/organizations/[orgId]/alerts
 * Lists operational and budget alerts (Requires VIEWER)
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import { listOrganizationAlerts } from "@/lib/services/alert.service";
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
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));

  const alerts = await listOrganizationAlerts(orgId, limit);
  return apiSuccess(alerts);
}

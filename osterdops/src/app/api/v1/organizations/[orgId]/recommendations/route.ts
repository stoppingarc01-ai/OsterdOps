/**
 * GET /api/v1/organizations/[orgId]/recommendations
 * Generates cost-saving optimization recommendations (Requires VIEWER)
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import { getOptimizationRecommendations } from "@/lib/services/optimization.service";
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

  const recommendations = await getOptimizationRecommendations(orgId);
  return apiSuccess(recommendations);
}

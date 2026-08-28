/**
 * GET /api/v1/organizations/[orgId]
 * Fetches organization details for authorized members.
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
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

  return apiSuccess({
    organization: authResult.org,
    currentMembership: authResult.member,
  });
}

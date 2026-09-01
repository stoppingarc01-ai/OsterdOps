/**
 * /api/v1/projects/[projectId]/api-keys/[keyId]/revoke
 * POST: Safely revokes an API key (Requires ADMIN or OWNER).
 */

import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import { findProjectInAllowedOrgs } from "@/lib/services/project.service";
import { revokeProjectApiKey } from "@/lib/services/api-key.service";
import { getUserOrganizations } from "@/lib/services/organization.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

interface Params {
  params: Promise<{ projectId: string; keyId: string }>;
}

export async function POST(request: Request, context: Params) {
  const { projectId, keyId } = await context.params;

  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;
  const userOrgs = await getUserOrganizations(user.uid);
  const allowedOrgIds = userOrgs.map((o) => o.organization.id);

  const found = await findProjectInAllowedOrgs(projectId, allowedOrgIds);
  if (!found) {
    return ApiErrors.notFound(`Project '${projectId}' not found.`);
  }

  // Revocation requires ADMIN or OWNER role
  const orgAuth = await requireOrganizationMember(request, found.orgId, "ADMIN");
  if (orgAuth.errorResponse) {
    return orgAuth.errorResponse;
  }

  try {
    const success = await revokeProjectApiKey(found.orgId, projectId, keyId, user.uid);
    if (!success) {
      return ApiErrors.notFound(`API key '${keyId}' not found.`);
    }

    return apiSuccess({ keyId, revoked: true, status: "revoked" });
  } catch (err) {
    console.error("[OsterdOps Keys API] Revocation failed:", err);
    return ApiErrors.internalError("Failed to revoke API key.");
  }
}

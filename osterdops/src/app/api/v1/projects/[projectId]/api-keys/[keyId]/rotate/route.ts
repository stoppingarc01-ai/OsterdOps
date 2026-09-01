/**
 * /api/v1/projects/[projectId]/api-keys/[keyId]/rotate
 * POST: Rotates an API key (Requires ADMIN or OWNER). New secret returned ONCE.
 */

import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import { findProjectInAllowedOrgs } from "@/lib/services/project.service";
import { rotateProjectApiKey } from "@/lib/services/api-key.service";
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

  // Rotation requires ADMIN or OWNER role
  const orgAuth = await requireOrganizationMember(request, found.orgId, "ADMIN");
  if (orgAuth.errorResponse) {
    return orgAuth.errorResponse;
  }

  try {
    const result = await rotateProjectApiKey(found.orgId, projectId, keyId, user.uid);
    if (!result) {
      return ApiErrors.notFound(`API key '${keyId}' not found.`);
    }

    return apiSuccess({
      id: result.key.id,
      name: result.key.name,
      keyPrefix: result.key.keyPrefix,
      secret: result.secret,
      projectId,
      createdAt: result.key.createdAt,
    });
  } catch (err) {
    console.error("[OsterdOps Keys API] Rotation failed:", err);
    return ApiErrors.internalError("Failed to rotate API key.");
  }
}

/**
 * /api/v1/projects/[projectId]/api-keys/[keyId]
 * GET: Returns metadata for a single API key (Requires VIEWER). Plaintext secret is never returned.
 */

import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import { findProjectInAllowedOrgs } from "@/lib/services/project.service";
import { getProjectApiKeyById } from "@/lib/services/api-key.service";
import { getUserOrganizations } from "@/lib/services/organization.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

interface Params {
  params: Promise<{ projectId: string; keyId: string }>;
}

export async function GET(request: Request, context: Params) {
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

  const orgAuth = await requireOrganizationMember(request, found.orgId, "VIEWER");
  if (orgAuth.errorResponse) {
    return orgAuth.errorResponse;
  }

  const key = await getProjectApiKeyById(found.orgId, projectId, keyId);
  if (!key) {
    return ApiErrors.notFound(`API key '${keyId}' not found.`);
  }

  return apiSuccess(key);
}

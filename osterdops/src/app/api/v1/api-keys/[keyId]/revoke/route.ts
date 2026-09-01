/**
 * /api/v1/api-keys/[keyId]/revoke
 * POST: Explicit revocation endpoint for API keys (Requires ADMIN or OWNER).
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import { getUserOrganizations } from "@/lib/services/organization.service";
import {
  listOrganizationApiKeys,
  revokeProjectApiKey,
} from "@/lib/services/api-key.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  const { keyId } = await params;

  const authResult = await requireAuth(request);
  if (authResult.errorResponse) return authResult.errorResponse;

  const { user } = authResult;
  const userOrgs = await getUserOrganizations(user.uid);
  if (userOrgs.length === 0) {
    return ApiErrors.forbidden("User is not a member of any organization.", undefined, requestId);
  }

  const orgId = userOrgs[0].organization.id;
  const orgAuth = await requireOrganizationMember(request, orgId, "ADMIN");
  if (orgAuth.errorResponse) return orgAuth.errorResponse;

  const keys = await listOrganizationApiKeys(orgId);
  const key = keys.find((k) => k.id === keyId);

  if (!key) {
    return ApiErrors.notFound(`API key with ID '${keyId}' not found.`, undefined, requestId);
  }

  const revoked = await revokeProjectApiKey(orgId, key.projectId, keyId, user.uid);
  if (!revoked) {
    return ApiErrors.internalError("Failed to revoke API key.", undefined, requestId);
  }

  return apiSuccess({ id: keyId, status: "revoked" }, { requestId });
}

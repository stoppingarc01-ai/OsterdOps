/**
 * /api/v1/organizations/[orgId]/projects/[projectId]/keys/[keyId]
 * DELETE: Revokes an existing API key (Requires ADMIN or OWNER)
 */

import { requireProjectAccess } from "@/lib/auth/rbac";
import { revokeProjectApiKey } from "@/lib/services/api-key.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

interface Params {
  params: Promise<{ orgId: string; projectId: string; keyId: string }>;
}

export async function DELETE(request: Request, context: Params) {
  const { orgId, projectId, keyId } = await context.params;

  const authResult = await requireProjectAccess(request, orgId, projectId, "ADMIN");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const success = await revokeProjectApiKey(orgId, projectId, keyId, user.uid);
    if (!success) {
      return ApiErrors.notFound("API key not found.");
    }

    return apiSuccess({ keyId, revoked: true, status: "revoked" });
  } catch (err) {
    console.error("[OsterdOps Keys] Revocation failed:", err);
    return ApiErrors.internalError("Failed to revoke API key.");
  }
}

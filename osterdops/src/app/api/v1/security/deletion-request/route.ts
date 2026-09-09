/**
 * OsterdOps — Privacy Deletion Request Route (Phase 15)
 * POST /api/v1/security/deletion-request
 * Multi-stage data erasure request endpoint protected by `security:delete`.
 */

import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { createDeletionRequest } from "@/lib/security/privacy-deletion.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { organizationId, reason } = body;

    if (!organizationId) {
      return ApiErrors.badRequest("Field 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, organizationId, "security:delete");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const finalReason = reason?.trim() || "User requested account deletion";
    const result = await createDeletionRequest(organizationId, authResult.user.uid, finalReason);
    return apiSuccess(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create privacy deletion request.";
    return ApiErrors.internalError(message);
  }
}

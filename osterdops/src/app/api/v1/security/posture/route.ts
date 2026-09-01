/**
 * OsterdOps — Security Posture Route (Phase 15)
 * GET /api/v1/security/posture
 * Evaluates organization and platform technical security controls.
 */

import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { evaluateSecurityPosture } from "@/lib/services/security-posture.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "security:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const report = await evaluateSecurityPosture(orgId);
    return apiSuccess(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to evaluate security posture.";
    return ApiErrors.internalError(message);
  }
}

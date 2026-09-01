/**
 * OsterdOps — Privacy Data Export Route (Phase 15)
 * GET /api/v1/security/export
 * Generates an export bundle of non-secret metadata.
 */

import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { generatePrivacyExport } from "@/lib/security/privacy-export.service";

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

    const manifest = await generatePrivacyExport(orgId, authResult.user.uid);
    return apiSuccess(manifest);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate privacy export.";
    return ApiErrors.internalError(message);
  }
}

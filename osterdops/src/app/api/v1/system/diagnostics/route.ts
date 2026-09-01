/**
 * OsterdOps — System Diagnostics Route (Phase 14)
 * GET /api/v1/system/diagnostics
 * Privileged diagnostic endpoint protected by organization RBAC (`system:read`).
 */

import { requireAuth } from "@/lib/auth/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess } from "@/lib/api/response";
import { getSystemDiagnostics } from "@/lib/services/diagnostics.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("organizationId");

  if (orgId) {
    const authResult = await requirePermission(request, orgId, "system:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }
    const diagnostics = await getSystemDiagnostics(authResult.member.role);
    return apiSuccess(diagnostics);
  }

  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const diagnostics = await getSystemDiagnostics("VIEWER");
  return apiSuccess(diagnostics);
}

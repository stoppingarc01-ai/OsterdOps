/**
 * POST /api/v1/alerts/[alertId]/resolve
 * Transitions alert status to RESOLVED (Requires alerts:manage)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { resolveAlert } from "@/lib/services/alert.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ alertId: string }>;
}

export async function POST(request: Request, props: RouteParams) {
  try {
    const { alertId } = await props.params;
    let orgId: string | null = null;

    try {
      const body = await request.json();
      orgId = body?.organizationId;
    } catch {
      // JSON body optional
    }

    if (!orgId) {
      const { searchParams } = new URL(request.url);
      orgId = searchParams.get("organizationId");
    }

    if (!orgId) {
      return ApiErrors.badRequest("Property or query param 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "alerts:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const alert = await resolveAlert(orgId, alertId, authResult.user?.uid || "unknown");
    if (!alert) {
      return ApiErrors.notFound(`Alert '${alertId}' not found.`);
    }

    return apiSuccess(alert);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to resolve alert.";
    return ApiErrors.internalError(message);
  }
}

/**
 * /api/v1/alerts/[alertId]
 * GET: Retrieves single alert details (Requires alerts:read)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { getAlert } from "@/lib/services/alert.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ alertId: string }>;
}

export async function GET(request: Request, props: RouteParams) {
  try {
    const { alertId } = await props.params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "alerts:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const alert = await getAlert(orgId, alertId);
    if (!alert) {
      return ApiErrors.notFound(`Alert '${alertId}' not found.`);
    }

    return apiSuccess(alert);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve alert.";
    return ApiErrors.internalError(message);
  }
}

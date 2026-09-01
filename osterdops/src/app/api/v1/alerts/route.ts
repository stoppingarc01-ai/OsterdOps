/**
 * /api/v1/alerts
 * GET: Lists all alerts for an organization with optional filtering (Requires alerts:read)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { listOrganizationAlerts } from "@/lib/services/alert.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { AlertSeverity, AlertStatus, AlertType } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "alerts:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const budgetId = searchParams.get("budgetId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const severity = (searchParams.get("severity") as AlertSeverity) || undefined;
    const status = (searchParams.get("status") as AlertStatus) || undefined;
    const type = (searchParams.get("type") as AlertType) || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

    const alerts = await listOrganizationAlerts(orgId, {
      budgetId,
      projectId,
      severity,
      status,
      type,
      startDate,
      endDate,
      limit,
    });

    return apiSuccess(alerts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve alerts.";
    return ApiErrors.internalError(message);
  }
}

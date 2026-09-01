/**
 * GET /api/v1/budgets/[budgetId]/status
 * Retrieves real-time budget status, spend breakdown, threshold statuses, and active alerts.
 */

import { requirePermission } from "@/lib/auth/rbac";
import { getBudgetStatus } from "@/lib/services/budget.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ budgetId: string }>;
}

export async function GET(request: Request, props: RouteParams) {
  try {
    const { budgetId } = await props.params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "budgets:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const status = await getBudgetStatus(orgId, budgetId);
    if (!status) {
      return ApiErrors.notFound(`Budget '${budgetId}' not found.`);
    }

    return apiSuccess(status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve budget status.";
    return ApiErrors.internalError(message);
  }
}

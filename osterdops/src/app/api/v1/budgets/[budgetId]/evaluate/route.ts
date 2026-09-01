/**
 * POST /api/v1/budgets/[budgetId]/evaluate
 * Forces evaluation of a budget against current spend and triggers deduplicated threshold alerts.
 */

import { requirePermission } from "@/lib/auth/rbac";
import { evaluateBudget } from "@/lib/services/budget.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ budgetId: string }>;
}

export async function POST(request: Request, props: RouteParams) {
  try {
    const { budgetId } = await props.params;
    let orgId: string | null = null;

    try {
      const body = await request.json();
      orgId = body?.organizationId;
    } catch {
      // JSON body optional, check URL searchParams
    }

    if (!orgId) {
      const { searchParams } = new URL(request.url);
      orgId = searchParams.get("organizationId");
    }

    if (!orgId) {
      return ApiErrors.badRequest("Property or query param 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "budgets:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const statusResponse = await evaluateBudget(orgId, budgetId);
    if (!statusResponse) {
      return ApiErrors.notFound(`Budget '${budgetId}' not found.`);
    }

    return apiSuccess(statusResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to evaluate budget.";
    return ApiErrors.internalError(message);
  }
}

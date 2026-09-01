/**
 * POST /api/v1/budgets/[budgetId]/pause
 * Pauses a budget so that alerts and hard blocking are temporarily deactivated (Requires budgets:manage / ADMIN)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { pauseBudget } from "@/lib/services/budget.service";
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
      // JSON body is optional
    }

    if (!orgId) {
      const { searchParams } = new URL(request.url);
      orgId = searchParams.get("organizationId");
    }

    if (!orgId) {
      return ApiErrors.badRequest("Property or query param 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "budgets:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const pausedBudget = await pauseBudget(orgId, budgetId, authResult.user?.uid);
    if (!pausedBudget) {
      return ApiErrors.notFound(`Budget '${budgetId}' not found.`);
    }

    return apiSuccess(pausedBudget);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to pause budget.";
    return ApiErrors.internalError(message);
  }
}

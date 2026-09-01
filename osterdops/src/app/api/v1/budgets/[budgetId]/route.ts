/**
 * /api/v1/budgets/[budgetId]
 * GET: Retrieves single budget (Requires budgets:read)
 * PATCH: Updates budget (Requires budgets:manage)
 * DELETE: Deletes budget (Requires budgets:manage)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { getBudget, updateBudget, deleteBudget } from "@/lib/services/budget.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { BudgetPeriod, BudgetStatus, EnforcementMode } from "@/types";

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

    const budget = await getBudget(orgId, budgetId);
    if (!budget) {
      return ApiErrors.notFound(`Budget '${budgetId}' not found.`);
    }

    return apiSuccess(budget);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve budget.";
    return ApiErrors.internalError(message);
  }
}

export async function PATCH(request: Request, props: RouteParams) {
  try {
    const { budgetId } = await props.params;
    const body = await request.json();
    const orgId = body?.organizationId;

    if (!orgId) {
      return ApiErrors.badRequest("Property 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "budgets:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const budget = await updateBudget(
      orgId,
      budgetId,
      {
        name: body.name ? String(body.name).trim() : undefined,
        description: body.description ? String(body.description).trim() : undefined,
        amountUsd: typeof body.amountUsd === "number" ? body.amountUsd : undefined,
        period: body.period as BudgetPeriod,
        periodStart: body.periodStart ? String(body.periodStart) : undefined,
        periodEnd: body.periodEnd ? String(body.periodEnd) : undefined,
        thresholds: Array.isArray(body.thresholds) ? body.thresholds.map(Number) : undefined,
        alertThresholds: Array.isArray(body.alertThresholds) ? body.alertThresholds.map(Number) : undefined,
        enabled: body.enabled !== undefined ? Boolean(body.enabled) : undefined,
        enforcementMode: body.enforcementMode as EnforcementMode,
        enforceHardLimit: body.enforceHardLimit !== undefined ? Boolean(body.enforceHardLimit) : undefined,
        status: body.status as BudgetStatus,
      },
      authResult.user?.uid
    );

    if (!budget) {
      return ApiErrors.notFound(`Budget '${budgetId}' not found.`);
    }

    return apiSuccess(budget);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update budget.";
    return ApiErrors.internalError(message);
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  try {
    const { budgetId } = await props.params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "budgets:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const deleted = await deleteBudget(orgId, budgetId, authResult.user?.uid);
    if (!deleted) {
      return ApiErrors.notFound(`Budget '${budgetId}' not found.`);
    }

    return apiSuccess({ deleted: true, budgetId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete budget.";
    return ApiErrors.internalError(message);
  }
}

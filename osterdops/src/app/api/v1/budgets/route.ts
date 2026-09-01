/**
 * /api/v1/budgets
 * GET: Lists all budgets configured for an organization (Requires budgets:read / VIEWER)
 * POST: Creates a new budget configuration (Requires budgets:manage / ADMIN)
 */

import { requireOrganizationMember, requirePermission } from "@/lib/auth/rbac";
import { listOrganizationBudgets, createBudget } from "@/lib/services/budget.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { BudgetPeriod, EnforcementMode } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "budgets:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const projectId = searchParams.get("projectId") || undefined;
    const budgets = await listOrganizationBudgets(orgId, projectId);
    return apiSuccess(budgets);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve budgets.";
    return ApiErrors.internalError(message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body?.organizationId;

    if (!orgId) {
      return ApiErrors.badRequest("Property 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "budgets:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return ApiErrors.badRequest("Budget 'name' is required.");
    }
    if (typeof body.amountUsd !== "number" || body.amountUsd <= 0) {
      return ApiErrors.badRequest("Budget 'amountUsd' must be a positive number.");
    }

    const budget = await createBudget(
      orgId,
      {
        name: body.name.trim(),
        description: body.description ? String(body.description).trim() : undefined,
        amountUsd: body.amountUsd,
        currency: body.currency ? String(body.currency).toUpperCase() : "USD",
        period: (body.period || "MONTHLY") as BudgetPeriod,
        projectId: typeof body.projectId === "string" ? body.projectId : undefined,
        periodStart: body.periodStart ? String(body.periodStart) : undefined,
        periodEnd: body.periodEnd ? String(body.periodEnd) : undefined,
        thresholds: Array.isArray(body.thresholds) ? body.thresholds.map(Number) : undefined,
        alertThresholds: Array.isArray(body.alertThresholds) ? body.alertThresholds.map(Number) : undefined,
        enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
        enforcementMode: (body.enforcementMode as EnforcementMode) || "MONITOR",
        enforceHardLimit: Boolean(body.enforceHardLimit),
      },
      authResult.user?.uid
    );

    return apiSuccess(budget, undefined, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create budget.";
    return ApiErrors.internalError(message);
  }
}

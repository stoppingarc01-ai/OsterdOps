/**
 * /api/v1/organizations/[orgId]/budgets
 * GET: Lists all budgets configured for the organization (Requires VIEWER)
 * POST: Creates a new budget threshold (Requires ADMIN)
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import { listOrganizationBudgets, createBudget } from "@/lib/services/budget.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { BudgetPeriod, BudgetThresholdLevel } from "@/types";

interface Params {
  params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, context: Params) {
  const { orgId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "VIEWER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const budgets = await listOrganizationBudgets(orgId);
  return apiSuccess(budgets);
}

export async function POST(request: Request, context: Params) {
  const { orgId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "ADMIN");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const body = await request.json();
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return ApiErrors.badRequest("Budget name is required.");
    }
    if (typeof body.amountUsd !== "number" || body.amountUsd <= 0) {
      return ApiErrors.badRequest("Budget amount must be a positive number.");
    }

    const budget = await createBudget(orgId, {
      name: body.name.trim(),
      amountUsd: body.amountUsd,
      period: (body.period || "monthly") as BudgetPeriod,
      projectId: typeof body.projectId === "string" ? body.projectId : undefined,
      alertThresholds: Array.isArray(body.alertThresholds)
        ? (body.alertThresholds as BudgetThresholdLevel[])
        : [50, 75, 90, 100],
      enforceHardLimit: Boolean(body.enforceHardLimit),
    });

    return apiSuccess(budget, undefined, 201);
  } catch (err) {
    console.error("[OsterdOps Budgets] Creation failed:", err);
    return ApiErrors.internalError("Failed to create budget.");
  }
}

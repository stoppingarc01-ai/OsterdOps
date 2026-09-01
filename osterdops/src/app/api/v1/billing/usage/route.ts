/**
 * GET /api/v1/billing/usage
 * Retrieves current billing cycle token counts, request metrics, and overage calculations.
 * Requires billing:read (VIEWER / DEVELOPER / ADMIN / OWNER).
 */

import { requirePermission } from "@/lib/auth/rbac";
import { getSubscription } from "@/lib/billing/subscription.service";
import { buildBillingUsageSummary } from "@/lib/billing/calculator";
import { aggregateUsage } from "@/lib/services/usage.service";
import { aggregateSpend } from "@/lib/services/cost.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "billing:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const subscription = await getSubscription(orgId);
    const startDate = searchParams.get("startDate") || subscription.currentPeriodStart;
    const endDate = searchParams.get("endDate") || subscription.currentPeriodEnd;

    const [usageAggregate, spendAggregate] = await Promise.all([
      aggregateUsage(orgId, { startDate, endDate }),
      aggregateSpend(orgId, { startDate, endDate }),
    ]);

    const usageSummary = buildBillingUsageSummary(
      subscription.planId,
      usageAggregate,
      spendAggregate
    );

    return apiSuccess({
      organizationId: orgId,
      planId: subscription.planId,
      periodStart: startDate,
      periodEnd: endDate,
      usage: usageSummary,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve billing usage.";
    return ApiErrors.internalError(message);
  }
}

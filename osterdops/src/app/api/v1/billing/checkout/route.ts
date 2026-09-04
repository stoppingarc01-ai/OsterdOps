/**
 * POST /api/v1/billing/checkout
 * Generates a server-side Stripe checkout session (Requires billing:manage)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { getBillingProvider } from "@/lib/billing/providers/registry";
import { isValidPlanId } from "@/lib/billing/plans";
import { recordAuditLog } from "@/lib/services/audit.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { BillingPlanId, BillingInterval } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body?.organizationId;

    if (!orgId) {
      return ApiErrors.badRequest("Property 'organizationId' is required.");
    }

    const authResult = await requirePermission(request, orgId, "billing:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    if (!body.planId || !isValidPlanId(body.planId)) {
      return ApiErrors.badRequest(`Invalid or unsupported planId '${body.planId}'.`);
    }

    const planId = body.planId.toUpperCase() as BillingPlanId;
    const interval = (body.interval?.toUpperCase() === "ANNUAL" ? "ANNUAL" : "MONTHLY") as BillingInterval;
    const successUrl = body.successUrl || "/settings?billing=success";
    const cancelUrl = body.cancelUrl || "/settings?billing=cancel";

    const provider = getBillingProvider();
    const result = await provider.createCheckoutSession({
      organizationId: orgId,
      planId,
      interval,
      successUrl,
      cancelUrl,
      subscription_data: {
        trial_period_days: 7,
      },
    });

    await recordAuditLog({
      organizationId: orgId,
      actorId: authResult.user?.uid || "system",
      action: "CHECKOUT_CREATED",
      resourceType: "checkoutSession",
      resourceId: result.sessionId,
      details: { planId, interval, provider: result.provider },
    });

    return apiSuccess(result, undefined, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session.";
    return ApiErrors.internalError(message);
  }
}

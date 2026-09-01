/**
 * /api/v1/billing/subscription
 * GET: Retrieves subscription details (Requires billing:read)
 * POST: Initializes subscription (Requires billing:manage)
 * PATCH: Upgrades/downgrades plan or interval (Requires billing:manage)
 */

import { requirePermission } from "@/lib/auth/rbac";
import {
  getSubscription,
  createSubscription,
  changePlan,
} from "@/lib/billing/subscription.service";
import { getBillingPlan } from "@/lib/billing/plans";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import type { BillingPlanId, BillingInterval } from "@/types";

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

    const sub = await getSubscription(orgId);
    const plan = getBillingPlan(sub.planId);

    return apiSuccess({
      subscription: sub,
      plan,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve subscription.";
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

    const authResult = await requirePermission(request, orgId, "billing:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const planId: BillingPlanId = body.planId || "FREE";
    const interval: BillingInterval = body.interval || "MONTHLY";

    const subscription = await createSubscription(
      orgId,
      {
        planId,
        interval,
        provider: body.provider,
        providerCustomerId: body.providerCustomerId,
        providerSubscriptionId: body.providerSubscriptionId,
        trialDays: typeof body.trialDays === "number" ? body.trialDays : undefined,
      },
      authResult.user?.uid
    );

    return apiSuccess(subscription, undefined, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create subscription.";
    return ApiErrors.internalError(message);
  }
}

export async function PATCH(request: Request) {
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

    if (!body.planId) {
      return ApiErrors.badRequest("Property 'planId' is required.");
    }

    const updated = await changePlan(
      orgId,
      body.planId,
      body.interval,
      authResult.user?.uid
    );

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to change subscription plan.";
    return ApiErrors.internalError(message);
  }
}

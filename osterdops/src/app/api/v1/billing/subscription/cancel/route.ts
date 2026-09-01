/**
 * POST /api/v1/billing/subscription/cancel
 * Cancels active subscription at period end or immediately (Requires billing:manage)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { cancelSubscription } from "@/lib/billing/subscription.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

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

    const immediate = Boolean(body.immediate);
    const canceled = await cancelSubscription(orgId, immediate, authResult.user?.uid);

    return apiSuccess(canceled);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cancel subscription.";
    return ApiErrors.internalError(message);
  }
}

/**
 * POST /api/v1/billing/subscription/reactivate
 * Reactivates a subscription pending cancellation (Requires billing:manage)
 */

import { requirePermission } from "@/lib/auth/rbac";
import { reactivateSubscription } from "@/lib/billing/subscription.service";
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

    const reactivated = await reactivateSubscription(orgId, authResult.user?.uid);
    return apiSuccess(reactivated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reactivate subscription.";
    return ApiErrors.internalError(message);
  }
}

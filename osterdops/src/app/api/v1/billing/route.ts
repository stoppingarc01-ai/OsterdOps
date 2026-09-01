/**
 * GET /api/v1/billing
 * Retrieves organization billing summary, plan entitlements, period usage, and invoice balances.
 * Requires billing:read (VIEWER / DEVELOPER / ADMIN / OWNER).
 */

import { requirePermission } from "@/lib/auth/rbac";
import { getBillingSummary } from "@/lib/billing/summary.service";
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

    const summary = await getBillingSummary(orgId);
    return apiSuccess(summary);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve billing summary.";
    return ApiErrors.internalError(message);
  }
}

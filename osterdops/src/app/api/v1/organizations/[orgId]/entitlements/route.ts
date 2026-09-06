/**
 * OsterdOps — Organization Live Entitlements & Usage Metrics Route
 * GET /api/v1/organizations/[orgId]/entitlements
 *
 * Returns live meters, active plan tier, limits, and runtime entitlements.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import { getOrganizationUsageMetrics } from "@/lib/services/subscription";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

interface Params {
  params: Promise<{ orgId: string }>;
}

export async function GET(request: NextRequest, context: Params) {
  const requestId = extractOrGenerateRequestId(request.headers);

  try {
    const { orgId } = await context.params;
    if (!orgId) {
      return ApiErrors.badRequest("Organization ID is required.", undefined, requestId);
    }

    const authResult = await requireOrganizationMember(request, orgId, "VIEWER");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const metrics = await getOrganizationUsageMetrics(orgId);

    return apiSuccess(metrics, {
      requestId,
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load entitlements.";
    console.error(`[GET /api/v1/organizations/[orgId]/entitlements] Error:`, err);
    return ApiErrors.internalError(errorMsg, undefined, requestId);
  }
}

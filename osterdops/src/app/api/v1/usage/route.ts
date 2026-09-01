/**
 * GET /api/v1/usage
 * Organization Usage & Token Tracking Endpoint
 * Supports bounded querying, filtering by project/provider/model/date, and multi-dimensional aggregation.
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import {
  listOrganizationUsage,
  aggregateUsage,
} from "@/lib/services/usage.service";
import { ApiErrors, apiSuccess } from "@/lib/api/response";
import type { UsageRequestStatus } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    // RBAC: Requires VIEWER or higher (usage:read)
    const orgAuth = await requireOrganizationMember(request, orgId, "VIEWER");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    const projectId = searchParams.get("projectId") || undefined;
    const provider = searchParams.get("provider") || undefined;
    const model = searchParams.get("model") || undefined;
    const apiKeyId = searchParams.get("apiKeyId") || undefined;
    const status = (searchParams.get("status") as UsageRequestStatus) || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;
    const isAggregate = searchParams.get("aggregate") === "true";

    const filterOptions = {
      projectId,
      provider,
      model,
      apiKeyId,
      status,
      startDate,
      endDate,
      limit,
    };

    if (isAggregate) {
      const summary = await aggregateUsage(orgId, filterOptions);
      return apiSuccess(summary);
    }

    const records = await listOrganizationUsage(orgId, filterOptions);
    return apiSuccess(records);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve usage records.";
    return ApiErrors.internalError(message);
  }
}

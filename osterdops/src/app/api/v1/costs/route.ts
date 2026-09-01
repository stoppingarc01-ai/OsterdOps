/**
 * GET /api/v1/costs
 * Organization Costs & Financial Analytics Endpoint
 * Supports bounded querying, filtering by project/provider/model/date, and multi-dimensional spend aggregation.
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import {
  listOrganizationCosts,
  aggregateSpend,
} from "@/lib/services/cost.service";
import { ApiErrors, apiSuccess } from "@/lib/api/response";
import type { PricingStatus } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    // RBAC: Requires VIEWER or higher
    const orgAuth = await requireOrganizationMember(request, orgId, "VIEWER");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    const projectId = searchParams.get("projectId") || undefined;
    const provider = searchParams.get("provider") || undefined;
    const model = searchParams.get("model") || undefined;
    const apiKeyId = searchParams.get("apiKeyId") || undefined;
    const pricingStatus = (searchParams.get("pricingStatus") as PricingStatus) || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;
    const isAggregate = searchParams.get("aggregate") === "true";

    const filterOptions = {
      projectId,
      provider,
      model,
      apiKeyId,
      pricingStatus,
      startDate,
      endDate,
      limit,
    };

    if (isAggregate) {
      const summary = await aggregateSpend(orgId, filterOptions);
      return apiSuccess(summary);
    }

    const records = await listOrganizationCosts(orgId, filterOptions);
    return apiSuccess(records);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve cost records.";
    return ApiErrors.internalError(message);
  }
}

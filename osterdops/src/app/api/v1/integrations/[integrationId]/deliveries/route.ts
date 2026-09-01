import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { listIntegrationDeliveries } from "@/lib/integrations/service";
import { normalizeLimit, PaginationParams } from "@/lib/api/pagination";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ integrationId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || "default_org";
    const authResult = await requirePermission(request, orgId, "integrations:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { integrationId } = await context.params;
    const limit = normalizeLimit(searchParams.get("limit"));
    const cursor = searchParams.get("cursor") || undefined;
    const paginationParams: PaginationParams = { limit, cursor };

    const { items, meta } = await listIntegrationDeliveries(
      orgId,
      integrationId,
      paginationParams
    );

    return apiSuccess({ deliveries: items }, { meta, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list deliveries.";
    return ApiErrors.badRequest(message);
  }
}

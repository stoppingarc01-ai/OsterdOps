import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { revokeIntegrationConnection } from "@/lib/integrations/service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ integrationId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || "default_org";
    const authResult = await requirePermission(request, orgId, "integrations:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { integrationId } = await context.params;
    const revoked = await revokeIntegrationConnection(orgId, integrationId);
    return apiSuccess({ connection: revoked }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Revocation failed.";
    return ApiErrors.badRequest(message);
  }
}

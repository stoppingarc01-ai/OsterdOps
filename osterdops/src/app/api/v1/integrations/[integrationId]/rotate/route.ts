import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { rotateIntegrationSecret } from "@/lib/integrations/service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ integrationId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const body = await request.json();
    const orgId = body?.organizationId || "default_org";
    const authResult = await requirePermission(request, orgId, "integrations:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    if (!body.newSecret || typeof body.newSecret !== "string") {
      return ApiErrors.badRequest("newSecret is required.");
    }

    const { integrationId } = await context.params;
    const rotated = await rotateIntegrationSecret(orgId, integrationId, body.newSecret);
    return apiSuccess(rotated, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Secret rotation failed.";
    return ApiErrors.badRequest(message);
  }
}

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import {
  createIntegrationConnection,
  listOrganizationIntegrations,
} from "@/lib/integrations/service";
import { listIntegrationProviders } from "@/lib/integrations/registry";

export async function GET(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || "default_org";

    const authResult = await requirePermission(request, orgId, "integrations:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const connections = await listOrganizationIntegrations(orgId);
    const providers = listIntegrationProviders();

    return apiSuccess({ connections, providers }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list integrations.";
    return ApiErrors.internalError(message);
  }
}

export async function POST(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const body = await request.json();
    const orgId = body?.organizationId || "default_org";

    const authResult = await requirePermission(request, orgId, "integrations:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const result = await createIntegrationConnection({
      organizationId: orgId,
      providerId: body.providerId,
      name: body.name,
      destinationUrl: body.destinationUrl,
      secret: body.secret,
      configurationMetadata: body.configurationMetadata,
      eventSubscriptions: body.eventSubscriptions,
    });

    return apiSuccess(result, { status: 201, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create integration.";
    return ApiErrors.badRequest(message);
  }
}

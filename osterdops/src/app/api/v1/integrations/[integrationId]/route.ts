import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import {
  getIntegrationConnection,
  updateIntegrationConnection,
  deleteIntegrationConnection,
} from "@/lib/integrations/service";

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
    const connection = await getIntegrationConnection(orgId, integrationId);
    return apiSuccess({ connection }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve integration.";
    return ApiErrors.notFound(message);
  }
}

export async function PATCH(
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

    const { integrationId } = await context.params;
    const updated = await updateIntegrationConnection(orgId, integrationId, body);
    return apiSuccess({ connection: updated }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update integration.";
    return ApiErrors.badRequest(message);
  }
}

export async function DELETE(
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
    await deleteIntegrationConnection(orgId, integrationId);
    return apiSuccess({ deleted: true, integrationId }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete integration.";
    return ApiErrors.badRequest(message);
  }
}

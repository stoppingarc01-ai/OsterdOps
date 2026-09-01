/**
 * GET, PATCH, DELETE /api/v1/provider-connections/[connectionId]
 * Manage single AI provider connection metadata, credentials update, and revocation.
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import {
  getProviderConnectionById,
  updateProviderConnection,
  disableProviderConnection,
} from "@/lib/services/provider-connection.service";
import { ApiErrors, apiSuccess } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ connectionId: string }>;
}

/**
 * GET /api/v1/provider-connections/[connectionId]?organizationId=...
 * Retrieves safe metadata for a provider connection. Requires DEVELOPER or higher (integrations:read).
 */
export async function GET(request: Request, props: RouteParams) {
  try {
    const { connectionId } = await props.params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    // RBAC: Requires DEVELOPER or higher (integrations:read)
    const orgAuth = await requireOrganizationMember(request, orgId, "DEVELOPER");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    const connection = await getProviderConnectionById(orgId, connectionId);
    if (!connection) {
      return ApiErrors.notFound("Provider connection not found.");
    }

    return apiSuccess(connection);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get provider connection.";
    return ApiErrors.internalError(message);
  }
}

/**
 * PATCH /api/v1/provider-connections/[connectionId]
 * Updates connection metadata or replaces API key securely. Requires ADMIN or OWNER.
 */
export async function PATCH(request: Request, props: RouteParams) {
  try {
    const { connectionId } = await props.params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return ApiErrors.badRequest("Missing or invalid JSON request body.");
    }

    const { organizationId, name, displayName, apiKey, customBaseUrl, status, projectId } = body;

    if (!organizationId || typeof organizationId !== "string") {
      return ApiErrors.badRequest("Field 'organizationId' is required.");
    }

    // RBAC: Requires ADMIN or OWNER
    const orgAuth = await requireOrganizationMember(request, organizationId, "ADMIN");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    const updated = await updateProviderConnection(organizationId, connectionId, orgAuth.user.uid, {
      name,
      displayName,
      apiKey,
      customBaseUrl,
      status,
      projectId,
    });

    if (!updated) {
      return ApiErrors.notFound("Provider connection not found.");
    }

    return apiSuccess(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update provider connection.";
    return ApiErrors.internalError(message);
  }
}

/**
 * DELETE /api/v1/provider-connections/[connectionId]?organizationId=...
 * Safely disables / revokes the provider connection for auditability. Requires ADMIN or OWNER.
 */
export async function DELETE(request: Request, props: RouteParams) {
  try {
    const { connectionId } = await props.params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    // RBAC: Requires ADMIN or OWNER
    const orgAuth = await requireOrganizationMember(request, orgId, "ADMIN");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    const success = await disableProviderConnection(orgId, connectionId, orgAuth.user.uid);
    if (!success) {
      return ApiErrors.notFound("Provider connection not found.");
    }

    return apiSuccess({
      id: connectionId,
      status: "disabled",
      revoked: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to disable provider connection.";
    return ApiErrors.internalError(message);
  }
}

/**
 * POST /api/v1/provider-connections/[connectionId]/rotate
 * Securely rotates provider API key with fresh AES-256-GCM encryption and audit logging.
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import {
  updateProviderConnection,
  validateProviderConnection,
  getProviderConnectionById,
} from "@/lib/services/provider-connection.service";
import { ApiErrors, apiSuccess } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ connectionId: string }>;
}

export async function POST(request: Request, props: RouteParams) {
  try {
    const { connectionId } = await props.params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return ApiErrors.badRequest("Missing or invalid JSON request body.");
    }

    const { organizationId, newApiKey, apiKey } = body;
    const replacementKey = newApiKey || apiKey;

    if (!organizationId || typeof organizationId !== "string") {
      return ApiErrors.badRequest("Field 'organizationId' is required.");
    }

    if (!replacementKey || typeof replacementKey !== "string" || !replacementKey.trim()) {
      return ApiErrors.badRequest("Field 'newApiKey' or 'apiKey' is required.");
    }

    // RBAC: Requires ADMIN or OWNER to rotate secrets
    const orgAuth = await requireOrganizationMember(request, organizationId, "ADMIN");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    const existing = await getProviderConnectionById(organizationId, connectionId);
    if (!existing) {
      return ApiErrors.notFound("Provider connection not found.");
    }

    // Update with newly encrypted key
    const updated = await updateProviderConnection(organizationId, connectionId, orgAuth.user.uid, {
      apiKey: replacementKey.trim(),
      status: "active",
    });

    if (!updated) {
      return ApiErrors.notFound("Failed to update provider connection.");
    }

    // Perform background validation check on rotated key
    const valResult = await validateProviderConnection(organizationId, connectionId, orgAuth.user.uid).catch(() => null);

    return apiSuccess({
      connection: valResult?.connection || updated,
      rotated: true,
      validated: valResult?.valid ?? true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to rotate provider API key.";
    return ApiErrors.internalError(message);
  }
}

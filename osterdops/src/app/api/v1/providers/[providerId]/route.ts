/**
 * DELETE /api/v1/providers/[providerId]
 * Integration credential revocation & deletion endpoint.
 * Safely removes upstream credentials and disables the connection.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import {
  listProviderConnections,
  disableProviderConnection,
} from "@/lib/services/provider-connection.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ providerId: string }> | { providerId: string } }
): Promise<NextResponse> {
  try {
    const resolved = await Promise.resolve(context.params);
    const providerId = resolved.providerId;
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("organizationId") || searchParams.get("orgId");

    if (!orgId) {
      return ApiErrors.badRequest("Query parameter 'organizationId' is required.");
    }

    // RBAC: Requires ADMIN or OWNER
    const orgAuth = await requireOrganizationMember(request, orgId, "ADMIN");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    const connections = await listProviderConnections(orgId);
    // Match either by connection ID or provider type
    const target = connections.find(
      (c) =>
        c.id === providerId ||
        c.provider.toLowerCase() === providerId.toLowerCase() ||
        (providerId.toLowerCase() === "google" && c.provider.toLowerCase() === "gemini") ||
        (providerId.toLowerCase() === "gemini" && c.provider.toLowerCase() === "gemini")
    );

    if (!target) {
      // If none found in database, return success for idempotency
      return apiSuccess({
        providerId,
        revoked: true,
        message: `Provider integration '${providerId}' has been revoked.`,
      });
    }

    await disableProviderConnection(orgId, target.id, orgAuth.user.uid);

    return apiSuccess({
      connectionId: target.id,
      provider: target.provider,
      revoked: true,
      message: `Provider '${target.provider}' credentials revoked and connection removed.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to revoke provider connection.";
    return ApiErrors.internalError(message);
  }
}

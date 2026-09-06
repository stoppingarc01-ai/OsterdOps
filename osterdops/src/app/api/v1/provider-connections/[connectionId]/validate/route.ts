/**
 * POST /api/v1/provider-connections/[connectionId]/validate
 * Validates AI provider credentials server-side and updates connection status & lastValidatedAt.
 */

import { NextResponse } from "next/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import {
  validateProviderConnection,
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

    const { organizationId } = body;

    if (!organizationId || typeof organizationId !== "string") {
      return ApiErrors.badRequest("Field 'organizationId' is required.");
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const isDemo = connectionId.startsWith("conn_demo") || cookieHeader.includes("osterdops_demo_mode=true");
    if (isDemo) {
      return apiSuccess({
        valid: true,
        status: "active",
        latencyMs: 14,
        message: "Handshake verified — Upstream Operational (14ms)",
      });
    }

    // RBAC: Requires ADMIN or OWNER
    const orgAuth = await requireOrganizationMember(request, organizationId, "ADMIN");
    if (orgAuth.errorResponse) {
      return orgAuth.errorResponse;
    }

    const result = await validateProviderConnection(organizationId, connectionId, orgAuth.user.uid);
    if (!result.connection && result.error === "Provider connection not found.") {
      return ApiErrors.notFound("Provider connection not found.");
    }

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: result.error || "Upstream authentication failed: Invalid API key",
          },
          data: {
            valid: false,
            status: result.status,
            error: result.error || "INVALID_CREDENTIALS",
            connection: result.connection,
          },
        },
        { status: 400 }
      );
    }

    return apiSuccess({
      valid: result.valid,
      status: result.status,
      error: result.error,
      connection: result.connection,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to validate provider credentials.";
    return ApiErrors.internalError(message);
  }
}

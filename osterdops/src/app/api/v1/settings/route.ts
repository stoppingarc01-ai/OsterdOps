/**
 * OsterdOps — Organization Settings Route
 * GET, PATCH /api/v1/settings
 * Centralized endpoint for Company Profile, FinOps Gateway Controls, and Webhook Alerts.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { requirePermission } from "@/lib/auth/rbac";
import { getUserOrganizations } from "@/lib/services/organization.service";
import {
  getOrganizationSettings,
  updateOrganizationSettings,
  validateOrganizationSettingsUpdates,
} from "@/lib/services/settings.service";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

/**
 * Resolves the target organization ID for the request.
 */
async function resolveOrganizationId(
  request: NextRequest,
  userId: string,
  explicitOrgId?: string | null
): Promise<{ orgId: string; orgName: string } | null> {
  if (explicitOrgId && explicitOrgId.trim()) {
    return { orgId: explicitOrgId.trim(), orgName: "Enterprise AI Workspace" };
  }

  const orgs = await getUserOrganizations(userId);
  if (orgs.length > 0 && orgs[0]?.organization) {
    return {
      orgId: orgs[0].organization.id,
      orgName: orgs[0].organization.name || "Enterprise AI Workspace",
    };
  }

  return null;
}

/**
 * GET /api/v1/settings
 * Authenticate session and fetch current organization settings from Firestore/Database.
 * Returns sensible defaults if record doesn't exist yet.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const isDemo = request.nextUrl.searchParams.get("demo") === "true" || cookieHeader.includes("osterdops_demo_mode=true");

    const authResult = await requireAuth(request);
    if (authResult.errorResponse) {
      if (isDemo) {
        const demoSettings = await getOrganizationSettings(
          "org_osterdops_demo_mesh",
          "OsterdOps AI Production Mesh",
          "demo@osterdops.internal"
        );
        return apiSuccess(demoSettings);
      }
      return authResult.errorResponse;
    }

    const { user } = authResult;
    const { searchParams } = request.nextUrl;
    const queryOrgId = searchParams.get("orgId") || searchParams.get("organizationId");

    const resolved = await resolveOrganizationId(request, user.uid, queryOrgId);
    if (!resolved) {
      return ApiErrors.notFound("No active organization found for this user account.");
    }

    // Check read permission
    const permResult = await requirePermission(request, resolved.orgId, "org:settings:read");
    if (permResult.errorResponse) {
      return permResult.errorResponse;
    }

    const settings = await getOrganizationSettings(
      resolved.orgId,
      resolved.orgName,
      user.email
    );

    return apiSuccess(settings);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch organization settings.";
    console.error("[Settings Route] GET error:", err);
    return ApiErrors.internalError(message);
  }
}

/**
 * PATCH /api/v1/settings
 * Validate payload fields (company name, valid tax ID format if provided, positive budget cap numbers).
 * Update Firestore document atomically.
 * Return updated settings object with { success: true, data: ... }.
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { user } = authResult;
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      return ApiErrors.badRequest("Invalid JSON request body.");
    }

    const { searchParams } = request.nextUrl;
    const explicitOrgId =
      (typeof body.orgId === "string" ? body.orgId : null) ||
      (typeof body.organizationId === "string" ? body.organizationId : null) ||
      searchParams.get("orgId") ||
      searchParams.get("organizationId");

    const resolved = await resolveOrganizationId(request, user.uid, explicitOrgId);
    if (!resolved) {
      return ApiErrors.notFound("No active organization found for this user account.");
    }

    // Verify manage permission
    const permResult = await requirePermission(request, resolved.orgId, "org:settings:manage");
    if (permResult.errorResponse) {
      return permResult.errorResponse;
    }

    // Validate payload fields
    const validation = validateOrganizationSettingsUpdates(body);
    if (!validation.valid) {
      return ApiErrors.badRequest(
        `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`,
        { validationErrors: validation.errors }
      );
    }

    // Atomically persist settings
    const updated = await updateOrganizationSettings(resolved.orgId, body, user.uid);

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update organization settings.";
    console.error("[Settings Route] PATCH error:", err);
    return ApiErrors.internalError(message);
  }
}

/**
 * OsterdOps — Audit Logs Export Route
 * GET /api/v1/audit-logs/export
 *
 * Runtime Entitlement Guard:
 * Blocks free tier accounts with HTTP 403 Forbidden. Only Pro and Enterprise tiers
 * can export high-resolution audit trails.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { requireOrganizationMember } from "@/lib/auth/rbac";
import { getUserOrganizations } from "@/lib/services/organization.service";
import { listAuditLogs } from "@/lib/services/audit.service";
import { getOrganizationEntitlements } from "@/lib/services/subscription";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { apiSuccess, ApiErrors } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);

  try {
    const authResult = await requireAuth(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { user } = authResult;
    const searchParams = request.nextUrl.searchParams;

    let orgId = searchParams.get("organizationId") || "";
    if (!orgId) {
      const userOrgs = await getUserOrganizations(user.uid);
      if (userOrgs.length > 0) {
        orgId = userOrgs[0].organization.id;
      }
    }

    if (!orgId) {
      return ApiErrors.badRequest("Organization ID is required.", undefined, requestId);
    }

    const memberCheck = await requireOrganizationMember(request, orgId, "VIEWER");
    if (memberCheck.errorResponse) {
      return memberCheck.errorResponse;
    }

    // Runtime Entitlements Gate: Check canExportAuditLogs
    const entitlements = await getOrganizationEntitlements(orgId);
    if (!entitlements.canExportAuditLogs) {
      return NextResponse.json(
        {
          success: false,
          error: "ENTITLEMENT_REQUIRED",
          message: "Audit log and telemetry exports require a Pro or Enterprise subscription. Upgrade to Pro to unlock.",
          tier: entitlements.tier,
          requiredTier: "pro",
          requestId,
        },
        {
          status: 403,
          headers: {
            "x-request-id": requestId,
            "content-type": "application/json",
          },
        }
      );
    }

    const format = searchParams.get("format") || "json";
    const limit = Math.min(1000, Math.max(1, Number(searchParams.get("limit")) || 200));
    const logs = await listAuditLogs(orgId, limit);

    if (format === "csv") {
      const headers = "id,action,actorEmail,resourceType,resourceId,timestamp\n";
      const rows = logs
        .map(
          (l) =>
            `"${l.id}","${l.action}","${l.actorEmail || ""}","${l.resourceType}","${l.resourceId}","${l.timestamp}"`
        )
        .join("\n");
      const csv = headers + rows;

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="audit-logs-${orgId}-${Date.now()}.csv"`,
          "x-request-id": requestId,
        },
      });
    }

    return apiSuccess(
      {
        organizationId: orgId,
        tier: entitlements.tier,
        logRetentionDays: entitlements.logRetentionDays,
        totalExported: logs.length,
        logs,
      },
      { requestId }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to export audit logs.";
    console.error(`[GET /api/v1/audit-logs/export] Error [req:${requestId}]:`, err);
    return ApiErrors.internalError(errorMsg, undefined, requestId);
  }
}

/**
 * GET /api/v1/organizations/[orgId]/audit-logs
 * Retrieves immutable audit log events (Requires VIEWER)
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import { listAuditLogs } from "@/lib/services/audit.service";
import { apiSuccess } from "@/lib/api/response";

interface Params {
  params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, context: Params) {
  const { orgId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "VIEWER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));

  const logs = await listAuditLogs(orgId, limit);
  return apiSuccess(logs);
}

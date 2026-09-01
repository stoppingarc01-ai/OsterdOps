import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { toggleAutomationRule } from "@/lib/automation/service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ ruleId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || "default_org";
    const authResult = await requirePermission(request, orgId, "automations:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { ruleId } = await context.params;
    const rule = await toggleAutomationRule(orgId, ruleId, true);
    return apiSuccess({ rule }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to enable rule.";
    return ApiErrors.badRequest(message);
  }
}

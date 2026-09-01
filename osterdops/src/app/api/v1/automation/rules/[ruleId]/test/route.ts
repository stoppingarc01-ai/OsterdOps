import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { testAutomationRuleDryRun } from "@/lib/automation/service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ ruleId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const body = await request.json().catch(() => ({}));
    const orgId = body?.organizationId || "default_org";
    const authResult = await requirePermission(request, orgId, "automations:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { ruleId } = await context.params;
    const result = await testAutomationRuleDryRun(
      orgId,
      ruleId,
      body.mockEventData || {}
    );

    return apiSuccess(result, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rule test failed.";
    return ApiErrors.badRequest(message);
  }
}

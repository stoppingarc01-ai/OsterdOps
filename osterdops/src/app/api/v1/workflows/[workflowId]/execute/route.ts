import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { triggerWorkflowExecution } from "@/lib/workflows/engine";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const body = await request.json().catch(() => ({}));
    const orgId = body?.organizationId || "default_org";
    const authResult = await requirePermission(request, orgId, "workflows:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { workflowId } = await context.params;
    const execution = await triggerWorkflowExecution(
      orgId,
      workflowId,
      body.mockEventData || {}
    );

    return apiSuccess({ execution }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow execution failed.";
    return ApiErrors.badRequest(message);
  }
}

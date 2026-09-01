import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import {
  createWorkflow,
  listOrganizationWorkflows,
} from "@/lib/workflows/engine";

export async function GET(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || "default_org";
    const authResult = await requirePermission(request, orgId, "workflows:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const workflows = await listOrganizationWorkflows(orgId);
    return apiSuccess({ workflows }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list workflows.";
    return ApiErrors.internalError(message);
  }
}

export async function POST(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const body = await request.json();
    const orgId = body?.organizationId || "default_org";
    const authResult = await requirePermission(request, orgId, "workflows:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const workflow = await createWorkflow({
      organizationId: orgId,
      name: body.name,
      description: body.description,
      triggerEvent: body.triggerEvent,
      steps: body.steps,
      maxExecutionTimeoutMs: body.maxExecutionTimeoutMs,
    });

    return apiSuccess({ workflow }, { status: 201, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create workflow.";
    return ApiErrors.badRequest(message);
  }
}

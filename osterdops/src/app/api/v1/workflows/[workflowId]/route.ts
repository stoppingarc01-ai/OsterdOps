import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import {
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  listWorkflowExecutions,
} from "@/lib/workflows/engine";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || "default_org";
    const authResult = await requirePermission(request, orgId, "workflows:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { workflowId } = await context.params;
    const workflow = await getWorkflow(orgId, workflowId);
    const executions = await listWorkflowExecutions(orgId, workflowId);

    return apiSuccess({ workflow, executions }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow not found.";
    return ApiErrors.notFound(message);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const body = await request.json();
    const orgId = body?.organizationId || "default_org";
    const authResult = await requirePermission(request, orgId, "workflows:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { workflowId } = await context.params;
    const updated = await updateWorkflow(orgId, workflowId, body);
    return apiSuccess({ workflow: updated }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update workflow.";
    return ApiErrors.badRequest(message);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || "default_org";
    const authResult = await requirePermission(request, orgId, "workflows:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { workflowId } = await context.params;
    await deleteWorkflow(orgId, workflowId);
    return apiSuccess({ deleted: true, workflowId }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete workflow.";
    return ApiErrors.badRequest(message);
  }
}

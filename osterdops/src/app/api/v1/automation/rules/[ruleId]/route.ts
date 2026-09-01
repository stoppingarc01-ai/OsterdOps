import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import {
  getAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
} from "@/lib/automation/service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ruleId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || "default_org";
    const authResult = await requirePermission(request, orgId, "automations:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { ruleId } = await context.params;
    const rule = await getAutomationRule(orgId, ruleId);
    return apiSuccess({ rule }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rule not found.";
    return ApiErrors.notFound(message);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ ruleId: string }> }
) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const body = await request.json();
    const orgId = body?.organizationId || "default_org";
    const authResult = await requirePermission(request, orgId, "automations:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { ruleId } = await context.params;
    const updated = await updateAutomationRule(orgId, ruleId, body);
    return apiSuccess({ rule: updated }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update rule.";
    return ApiErrors.badRequest(message);
  }
}

export async function DELETE(
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
    await deleteAutomationRule(orgId, ruleId);
    return apiSuccess({ deleted: true, ruleId }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete rule.";
    return ApiErrors.badRequest(message);
  }
}

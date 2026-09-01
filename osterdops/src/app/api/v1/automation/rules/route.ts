import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import {
  createAutomationRule,
  listOrganizationRules,
} from "@/lib/automation/service";

export async function GET(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || "default_org";
    const authResult = await requirePermission(request, orgId, "automations:read");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const rules = await listOrganizationRules(orgId);
    return apiSuccess({ rules }, { requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list rules.";
    return ApiErrors.internalError(message);
  }
}

export async function POST(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);
  try {
    const body = await request.json();
    const orgId = body?.organizationId || "default_org";
    const authResult = await requirePermission(request, orgId, "automations:manage");
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const rule = await createAutomationRule({
      organizationId: orgId,
      name: body.name,
      description: body.description,
      eventTrigger: body.eventTrigger,
      conditions: body.conditions,
      actions: body.actions,
    });

    return apiSuccess({ rule }, { status: 201, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create rule.";
    return ApiErrors.badRequest(message);
  }
}

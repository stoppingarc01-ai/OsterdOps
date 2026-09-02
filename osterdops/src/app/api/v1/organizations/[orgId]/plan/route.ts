/**
 * OsterdOps — Organization Subscription Plan Route
 * GET /api/v1/organizations/[orgId]/plan
 * POST /api/v1/organizations/[orgId]/plan
 */

import { requireOrganizationMember } from "@/lib/auth/rbac";
import { apiSuccess, ApiErrors } from "@/lib/api/response";
import { updateOrganizationPlan } from "@/lib/services/organization.service";
import { getPricingPlan, normalizePlanTier, PRICING_PLANS, type PlanTier } from "@/lib/billing/plans";

interface Params {
  params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, context: Params) {
  const { orgId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "VIEWER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const currentTier = normalizePlanTier(authResult.org.planTier || authResult.org.plan);
  const planDefinition = getPricingPlan(currentTier);

  return apiSuccess({
    planTier: currentTier,
    plan: planDefinition,
    allPlans: PRICING_PLANS,
  });
}

export async function POST(request: Request, context: Params) {
  const { orgId } = await context.params;

  const authResult = await requireOrganizationMember(request, orgId, "DEVELOPER");
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const body = await request.json();
    const rawTier = body?.planTier;

    if (!rawTier || typeof rawTier !== "string") {
      return ApiErrors.badRequest("Missing required 'planTier' in request payload.");
    }

    const tier: PlanTier = normalizePlanTier(rawTier);
    const updatedOrg = await updateOrganizationPlan(orgId, tier);
    const planDefinition = getPricingPlan(tier);

    return apiSuccess({
      organization: updatedOrg,
      planTier: tier,
      plan: planDefinition,
      message: `Organization plan successfully updated to ${planDefinition.name}.`,
    });
  } catch (error) {
    return ApiErrors.internalError("Failed to update organization plan: " + (error as Error).message);
  }
}

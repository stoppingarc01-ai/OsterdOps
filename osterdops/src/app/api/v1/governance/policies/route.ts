/**
 * GET & POST /api/v1/governance/policies
 * Manages active FinOps governance policies and runaway loop breakers.
 */

import { NextResponse } from "next/server";
import {
  getGovernancePolicy,
  setGovernancePolicy,
  runawayLoopTracker,
  type GovernancePolicy,
} from "@/lib/gateway/circuit-breaker";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("organizationId") || "default";
  const projectId = searchParams.get("projectId") || "default";

  const policy = getGovernancePolicy(orgId, projectId);
  const trippedBreakers = runawayLoopTracker.getAllTrippedBreakers();

  return NextResponse.json({
    success: true,
    data: {
      policy,
      trippedBreakers,
      isTripped: Object.keys(trippedBreakers).length > 0,
    },
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const orgId = String(body.organizationId || "default");
  const projectId = String(body.projectId || "default");

  // Handle breaker reset request
  if (body.action === "reset_breaker" && body.apiKeyId) {
    runawayLoopTracker.resetBreaker(String(body.apiKeyId));
    return NextResponse.json({
      success: true,
      data: {
        message: `Circuit breaker reset for API key '${body.apiKeyId}'`,
        trippedBreakers: runawayLoopTracker.getAllTrippedBreakers(),
      },
    });
  }

  const updates: Partial<GovernancePolicy> = {};
  if (typeof body.autoDowngradeEnabled === "boolean") {
    updates.autoDowngradeEnabled = body.autoDowngradeEnabled;
  }
  if (typeof body.downgradeThreshold === "number") {
    updates.downgradeThreshold = Math.min(100, Math.max(50, body.downgradeThreshold));
  }
  if (typeof body.runawayLoopProtectionEnabled === "boolean") {
    updates.runawayLoopProtectionEnabled = body.runawayLoopProtectionEnabled;
  }
  if (typeof body.runawayLoopThreshold === "number") {
    updates.runawayLoopThreshold = Math.max(1, body.runawayLoopThreshold);
  }
  if (typeof body.monthlyProjectCap === "number" || body.monthlyProjectCap === null) {
    updates.monthlyProjectCap = typeof body.monthlyProjectCap === "number" ? body.monthlyProjectCap : undefined;
  }
  if (typeof body.dailyKeyCap === "number" || body.dailyKeyCap === null) {
    updates.dailyKeyCap = typeof body.dailyKeyCap === "number" ? body.dailyKeyCap : undefined;
  }

  const updatedPolicy = setGovernancePolicy(orgId, projectId, updates);

  return NextResponse.json({
    success: true,
    data: {
      policy: updatedPolicy,
      trippedBreakers: runawayLoopTracker.getAllTrippedBreakers(),
    },
  });
}

/**
 * OsterdOps — System Health Route (Phase 14)
 * GET /api/v1/system/health
 */

import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { getSystemDiagnostics } from "@/lib/services/diagnostics.service";

export async function GET(_request: NextRequest) {
  const diagnostics = await getSystemDiagnostics();
  return apiSuccess({
    status: diagnostics.status,
    version: diagnostics.version,
    environment: diagnostics.environment,
    timestamp: diagnostics.timestamp,
    checks: diagnostics.checks,
  });
}

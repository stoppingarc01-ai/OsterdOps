/**
 * OsterdOps — Liveness Health Probe (Phase 14)
 * GET /api/health
 * Fast, unauthenticated liveness check for load balancers & container orchestrators.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      livenessState: "LIVE",
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

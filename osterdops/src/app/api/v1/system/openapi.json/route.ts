/**
 * GET /api/v1/system/openapi.json
 * OsterdOps System OpenAPI 3.1.0 JSON Schema Endpoint
 */

import { NextResponse } from "next/server";
import { generateOpenApiSpec } from "@/lib/api/openapi";

export async function GET() {
  const spec = generateOpenApiSpec();
  return NextResponse.json(spec, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

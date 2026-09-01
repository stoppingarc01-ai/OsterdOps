/**
 * POST & OPTIONS /api/v1/gateway/chat/completions
 * OsterdOps AI Gateway Public Chat Completions Proxy Endpoint
 */

import { NextResponse } from "next/server";
import { routeGatewayChatRequest } from "@/lib/gateway/router";
import { resolveCorsHeaders } from "@/lib/gateway/cors";

/**
 * Handles incoming client AI completions requests authenticated with OsterdOps API keys.
 */
export async function POST(request: Request): Promise<Response> {
  const corsHeaders = resolveCorsHeaders(request);
  const response = await routeGatewayChatRequest(request);

  // Attach resolved CORS headers to response
  for (const [key, value] of Object.entries(corsHeaders)) {
    if (value) {
      response.headers.set(key, value);
    }
  }

  return response;
}

/**
 * Handles standard CORS preflight options requests with fine-grained origin validation.
 */
export async function OPTIONS(request: Request): Promise<NextResponse> {
  const headers = resolveCorsHeaders(request);

  return new NextResponse(null, {
    status: 204,
    headers,
  });
}

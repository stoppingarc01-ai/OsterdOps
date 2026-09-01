/**
 * POST /api/v1/chat/completions
 * OsterdOps Core AI Gateway Chat Completions Endpoint
 * Routes requests to upstream providers, calculates real-time cost, enforces governance, and writes telemetry.
 */

import { routeGatewayChatRequest } from "@/lib/gateway/router";
import { resolveCorsHeaders } from "@/lib/gateway/cors";

/**
 * Handles incoming client AI chat completions requests.
 */
export async function POST(request: Request): Promise<Response> {
  const corsHeaders = resolveCorsHeaders(request);
  const response = await routeGatewayChatRequest(request);

  for (const [key, value] of Object.entries(corsHeaders)) {
    if (value) {
      response.headers.set(key, value);
    }
  }

  return response;
}

/**
 * Handles CORS preflight options requests.
 */
export async function OPTIONS(request: Request): Promise<Response> {
  const headers = resolveCorsHeaders(request);
  return new Response(null, {
    status: 204,
    headers,
  });
}

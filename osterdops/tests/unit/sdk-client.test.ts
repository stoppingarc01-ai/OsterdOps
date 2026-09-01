/**
 * Unit Tests — OsterdOps TypeScript SDK Client Initialization & Transport
 */

import { OsterdOpsClient } from "@/sdk/client";
import { HttpClient } from "@/sdk/http";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runSdkClientTests() {
  // 1. Client initialization with custom options
  const client = new OsterdOpsClient({
    apiKey: "osk_live_test_key_12345",
    baseUrl: "http://localhost:3000",
    timeoutMs: 15000,
    maxRetries: 3,
  });

  assert(Boolean(client.gateway), "Gateway resource module must be defined.");
  assert(Boolean(client.projects), "Projects resource module must be defined.");
  assert(Boolean(client.apiKeys), "ApiKeys resource module must be defined.");
  assert(Boolean(client.usage), "Usage resource module must be defined.");
  assert(Boolean(client.costs), "Costs resource module must be defined.");
  assert(Boolean(client.analytics), "Analytics resource module must be defined.");
  assert(Boolean(client.budgets), "Budgets resource module must be defined.");
  assert(Boolean(client.alerts), "Alerts resource module must be defined.");
  assert(Boolean(client.billing), "Billing resource module must be defined.");
  assert(Boolean(client.notifications), "Notifications resource module must be defined.");
  assert(Boolean(client.system), "System resource module must be defined.");

  // 2. Custom fetch wrapper & Header verification
  let capturedHeaders: Record<string, string> = {};
  let capturedUrl = "";

  const mockFetch = (async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url);
    if (init?.headers) {
      const h = init.headers as Record<string, string>;
      capturedHeaders = { ...h };
    }
    return new Response(JSON.stringify({ success: true, data: { status: "healthy" } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "x-osterdops-request-id": "req_mock_123",
      },
    });
  }) as unknown as typeof fetch;

  const testHttp = new HttpClient({
    apiKey: "osk_live_test_key_12345",
    baseUrl: "http://localhost:3000",
    fetch: mockFetch,
  });

  const res = await testHttp.request({
    method: "GET",
    path: "/api/v1/system/health",
    requestId: "custom_corr_id_999",
  });

  assert(capturedUrl.includes("/api/v1/system/health"), "URL must match requested path.");
  assert(capturedHeaders["Authorization"] === "Bearer osk_live_test_key_12345", "Auth header must include Bearer token.");
  assert(capturedHeaders["x-osterdops-request-id"] === "custom_corr_id_999", "Correlation ID must propagate.");
  assert(res.status === 200, "Status must be 200.");
  assert(res.requestId === "req_mock_123", "Response requestId must be extracted.");
}

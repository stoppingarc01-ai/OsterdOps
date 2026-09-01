/**
 * OsterdOps — Phase 16: Frontend API Client Unit Tests
 */

import { apiRequest } from "@/lib/api/client";

export async function testFrontendApiClient() {
  const originalFetch = global.fetch;
  let capturedHeaders: Headers | null = null;
  let capturedUrl: string | null = null;

  global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    capturedUrl = String(input);
    capturedHeaders = new Headers(init?.headers);
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ success: true, data: { status: "HEALTHY" } }),
    } as Response;
  }) as typeof fetch;

  try {
    const res = await apiRequest<{ status: string }>("/api/v1/system/health", {
      params: { orgId: "org_123" },
      token: "test_jwt_token_123",
    });

    if (res.error || !res.data || res.data.status !== "HEALTHY") {
      throw new Error("API client failed to parse successful response.");
    }
    const h = capturedHeaders as Headers | null;
    if (!h || !h.has("X-Correlation-Id")) {
      throw new Error("API client did not attach X-Correlation-Id header.");
    }
    if (h.get("Authorization") !== "Bearer test_jwt_token_123") {
      throw new Error("API client did not attach Authorization Bearer token.");
    }
    const u = capturedUrl as string | null;
    if (!u || !u.includes("orgId=org_123")) {
      throw new Error("API client query params not appended properly.");
    }
  } finally {
    global.fetch = originalFetch;
  }
}

export async function runFrontendApiClientTests() {
  await testFrontendApiClient();
}

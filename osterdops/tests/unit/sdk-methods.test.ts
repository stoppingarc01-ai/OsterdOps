/**
 * Unit Tests — OsterdOps TypeScript SDK Resource Methods
 */

import { OsterdOpsClient } from "@/sdk/client";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runSdkMethodsTests() {
  const dispatchedRequests: Array<{ method: string; path: string; body?: unknown }> = [];

  const mockFetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = String(url);
    const method = init?.method || "GET";
    let body: unknown = undefined;
    if (init?.body && typeof init.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    }

    dispatchedRequests.push({ method, path: urlStr, body });

    // Mock responses by path
    if (urlStr.includes("/api/v1/chat/completions")) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: "req_test_001",
            provider: "openai",
            model: "gpt-4o",
            output: { role: "assistant", content: "Test completion output" },
            usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
            finishReason: "stop",
            latencyMs: 150,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "x-osterdops-cost-usd": "0.000225",
            "x-osterdops-latency-ms": "150",
          },
        }
      );
    }

    if (urlStr.includes("/api-keys") && method === "POST") {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: "key_01",
            name: "Test Key",
            keyPrefix: "osk_live_••••1234",
            secret: "osk_live_1234567890abcdef",
            projectId: "proj_01",
          },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/api/v1/projects") && method === "POST") {
      return new Response(
        JSON.stringify({
          success: true,
          data: { id: "proj_new_123", name: "New Project", slug: "new-project", status: "ACTIVE" },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/api/v1/projects") && method === "GET") {
      return new Response(
        JSON.stringify({
          success: true,
          data: [{ id: "proj_01", name: "Project 1", slug: "project-1", status: "ACTIVE" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/api/v1/usage")) {
      return new Response(
        JSON.stringify({
          success: true,
          data: { totalRequests: 500, totalTokens: 100000, inputTokens: 40000, outputTokens: 60000, cachedTokens: 5000, totalCostUsd: 1.25 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/api/v1/costs")) {
      return new Response(
        JSON.stringify({
          success: true,
          data: { totalCostUsd: 1.25, currency: "USD", breakdown: [] },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/api/v1/budgets")) {
      return new Response(
        JSON.stringify({
          success: true,
          data: [{ id: "bud_01", name: "Monthly Cap", amountUsd: 500, status: "ACTIVE" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Default fallback
    return new Response(JSON.stringify({ success: true, data: { status: "ok" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as unknown as typeof fetch;

  const client = new OsterdOpsClient({
    apiKey: "osk_live_test_methods",
    fetch: mockFetch,
  });

  // 1. Test Gateway Chat Completion
  const completion = await client.gateway.chat.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Hello AI" }],
  });
  assert(completion.id === "req_test_001", "Completion ID must match mock.");
  assert(completion.output.content === "Test completion output", "Output content must match mock.");
  assert(completion.costUsd === 0.000225, "Cost header must be extracted.");

  // 2. Test Projects API
  const projects = await client.projects.list();
  assert(projects.length === 1 && projects[0].id === "proj_01", "Projects list must return data.");

  const createdProj = await client.projects.create({ name: "New Project" });
  assert(createdProj.id === "proj_new_123", "Created project must match mock.");

  // 3. Test API Key Issuance
  const key = await client.apiKeys.create("proj_01", { name: "Test Key" });
  assert(key.secret === "osk_live_1234567890abcdef", "Plaintext secret must be returned.");

  // 4. Test Usage & Costs
  const usage = await client.usage.get();
  assert(usage.totalRequests === 500, "Usage requests count must match.");

  const costs = await client.costs.get();
  assert(costs.totalCostUsd === 1.25, "Costs total spend must match.");

  // 5. Test Budgets
  const budgets = await client.budgets.list();
  assert(budgets.length === 1 && budgets[0].amountUsd === 500, "Budgets list must match.");
}

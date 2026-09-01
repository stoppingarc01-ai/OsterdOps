/**
 * Unit Tests — OsterdOps TypeScript SDK Error Mapping, Retries & Secret Redaction
 */

import { OsterdOpsClient } from "@/sdk/client";
import {
  AuthenticationError,
  RateLimitError,
  BudgetExceededError,
  ProviderError,
} from "@/sdk/errors";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runSdkErrorsTests() {
  // 1. Test 401 AuthenticationError mapping
  const mock401 = (async () => {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "AUTHENTICATION_FAILED", message: "Invalid API key osk_live_secretkey123" },
      }),
      { status: 401, headers: { "Content-Type": "application/json", "x-osterdops-request-id": "req_401" } }
    );
  }) as unknown as typeof fetch;

  const client401 = new OsterdOpsClient({ apiKey: "invalid_key", fetch: mock401, maxRetries: 0 });
  let threwAuth = false;
  try {
    await client401.projects.list();
  } catch (err) {
    threwAuth = true;
    assert(err instanceof AuthenticationError, "Must instantiate AuthenticationError for 401.");
    assert((err as AuthenticationError).status === 401, "Status code must be 401.");
    assert((err as AuthenticationError).requestId === "req_401", "Request ID must be attached.");
    // Verify secret was redacted in error message
    assert(!(err as Error).message.includes("osk_live_secretkey123"), "Error message must redact plaintext key.");
    assert((err as Error).message.includes("[REDACTED_API_KEY]"), "Error message must replace key with placeholder.");
  }
  assert(threwAuth, "Must throw on 401.");

  // 2. Test 429 BUDGET_EXCEEDED mapping
  const mockBudgetExceeded = (async () => {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "BUDGET_EXCEEDED", message: "Monthly spend cap reached under HARD enforcement." },
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }) as unknown as typeof fetch;

  const clientBudget = new OsterdOpsClient({ apiKey: "valid_key", fetch: mockBudgetExceeded, maxRetries: 0 });
  let threwBudget = false;
  try {
    await clientBudget.gateway.chat.create({ model: "gpt-4o", messages: [{ role: "user", content: "hi" }] });
  } catch (err) {
    threwBudget = true;
    assert(err instanceof BudgetExceededError, "Must instantiate BudgetExceededError on 429 BUDGET_EXCEEDED.");
    assert((err as BudgetExceededError).retryable === false, "Budget exceeded errors must not be retryable.");
  }
  assert(threwBudget, "Must throw on budget exceeded.");

  // 3. Test 429 RATE_LIMITED mapping & retry-after extraction
  const mockRateLimited = (async () => {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "RATE_LIMITED", message: "Rate limit exceeded." },
      }),
      { status: 429, headers: { "Content-Type": "application/json", "retry-after": "5" } }
    );
  }) as unknown as typeof fetch;

  const clientRateLimit = new OsterdOpsClient({ apiKey: "valid_key", fetch: mockRateLimited, maxRetries: 0 });
  let threwRateLimit = false;
  try {
    await clientRateLimit.usage.get();
  } catch (err) {
    threwRateLimit = true;
    assert(err instanceof RateLimitError, "Must instantiate RateLimitError on standard 429.");
    assert((err as RateLimitError).retryAfterMs === 5000, "Retry-After header (5s) must parse to 5000ms.");
    assert((err as RateLimitError).retryable === true, "Rate limit errors must be flagged as retryable.");
  }
  assert(threwRateLimit, "Must throw on rate limited.");

  // 4. Test 502 ProviderError mapping
  const mock502 = (async () => {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "PROVIDER_ERROR", message: "Upstream Anthropic 529 overloaded", details: { provider: "anthropic" } },
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }) as unknown as typeof fetch;

  const client502 = new OsterdOpsClient({ apiKey: "valid_key", fetch: mock502, maxRetries: 0 });
  let threwProvider = false;
  try {
    await client502.gateway.chat.create({ model: "claude-3-5-sonnet", messages: [] });
  } catch (err) {
    threwProvider = true;
    assert(err instanceof ProviderError, "Must instantiate ProviderError for 502.");
    assert((err as ProviderError).provider === "anthropic", "Provider name must be extracted.");
  }
  assert(threwProvider, "Must throw on provider error.");
}

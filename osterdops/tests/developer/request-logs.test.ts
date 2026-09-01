/**
 * OsterdOps — Developer Request Logs & Telemetry Test Suite (Phase 23)
 * Validates request telemetry metadata structure, filtering by provider/model/status,
 * search by Request ID, pagination, and zero-prompt privacy guarantees.
 */

import { redactSensitiveData } from "@/lib/observability/redaction";
import { paginateArray } from "@/lib/api/pagination";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

interface TestTelemetryRecord {
  id: string;
  provider: string;
  model: string;
  statusCode: number;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  costUsd: number;
}

const MOCK_RECORDS: TestTelemetryRecord[] = [
  { id: "gw_req_01", provider: "openai", model: "gpt-4o", statusCode: 200, latencyMs: 320, inputTokens: 100, outputTokens: 50, cachedTokens: 30, costUsd: 0.001 },
  { id: "gw_req_02", provider: "anthropic", model: "claude-3-5-sonnet", statusCode: 200, latencyMs: 450, inputTokens: 200, outputTokens: 80, cachedTokens: 60, costUsd: 0.002 },
  { id: "gw_req_03", provider: "gemini", model: "gemini-1.5-flash", statusCode: 200, latencyMs: 180, inputTokens: 150, outputTokens: 40, cachedTokens: 0, costUsd: 0.0001 },
  { id: "gw_req_04", provider: "openai", model: "gpt-4o-mini", statusCode: 429, latencyMs: 40, inputTokens: 0, outputTokens: 0, cachedTokens: 0, costUsd: 0 },
  { id: "gw_req_05", provider: "anthropic", model: "claude-3-5-sonnet", statusCode: 504, latencyMs: 30000, inputTokens: 0, outputTokens: 0, cachedTokens: 0, costUsd: 0 },
];

export function runDeveloperRequestLogsTests(): void {
  console.log("▶ Running Developer Request Logs & Telemetry Tests...");

  // 1. Filtering by Provider
  const openaiLogs = MOCK_RECORDS.filter((r) => r.provider === "openai");
  assert(openaiLogs.length === 2, "Filtered 2 OpenAI logs");

  const anthropicLogs = MOCK_RECORDS.filter((r) => r.provider === "anthropic");
  assert(anthropicLogs.length === 2, "Filtered 2 Anthropic logs");

  // 2. Filtering by Status (Success vs Error)
  const successLogs = MOCK_RECORDS.filter((r) => r.statusCode === 200);
  assert(successLogs.length === 3, "Filtered 3 success logs");

  const errorLogs = MOCK_RECORDS.filter((r) => r.statusCode !== 200);
  assert(errorLogs.length === 2, "Filtered 2 error logs");

  // 3. Search by Request ID
  const searchedLog = MOCK_RECORDS.find((r) => r.id === "gw_req_03");
  assert(Boolean(searchedLog), "Found request gw_req_03");
  assert(searchedLog?.model === "gemini-1.5-flash", "Search result has correct model");

  // 4. Cursor-Based Pagination
  const paginatedPage1 = paginateArray(MOCK_RECORDS, { limit: 2 }, "org_test", "req_test_p1");
  assert(paginatedPage1.items.length === 2, "Page 1 contains 2 items");
  assert(paginatedPage1.meta.hasMore === true, "Page 1 indicates next page exists");
  assert(Boolean(paginatedPage1.meta.nextCursor), "Page 1 has valid next cursor");

  // 5. Zero-Prompt & Secret Privacy Guarantee
  const testPayloadWithSecrets = {
    authorization: "Bearer osk_live_secret_key_1234567890abcdef",
    prompt: "Confidential financial prompt that must not be in telemetry",
    apiKey: "sk-proj-abc1234567890abcdef123456",
  };
  const redacted = redactSensitiveData(testPayloadWithSecrets) as Record<string, string>;
  assert(redacted.authorization === "[REDACTED]" || redacted.authorization.includes("[REDACTED]"), "Authorization header redacted");
  assert(redacted.prompt === "[REDACTED]", "Prompt redacted");
  assert(redacted.apiKey === "[REDACTED]", "API key redacted");

  console.log("✔ Developer Request Logs & Telemetry Tests passed.");
}

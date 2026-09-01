/**
 * Unit Tests — API Security, Request Correlation & Headers
 */

import { extractOrGenerateRequestId } from "@/lib/observability/request-context";
import { applyVersionHeaders } from "@/lib/api/versioning";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runApiSecurityTests() {
  // 1. Request correlation preservation
  const customId = "req_custom_tracer_9918";
  const headers = new Headers();
  headers.set("x-osterdops-request-id", customId);
  assert(extractOrGenerateRequestId(headers) === customId, "Must preserve custom request ID.");

  // 2. Request correlation generation when missing
  const emptyHeaders = new Headers();
  const generatedId = extractOrGenerateRequestId(emptyHeaders);
  assert(generatedId.startsWith("req_"), "Generated ID must start with req_ prefix.");

  // 3. Security & Version headers applied to response
  const resHeaders = new Headers();
  applyVersionHeaders(resHeaders, "v1");
  assert(resHeaders.get("x-api-version") === "v1", "Must apply x-api-version.");
}

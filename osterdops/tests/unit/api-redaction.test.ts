/**
 * Unit Tests — API Secret Redaction & Log Safety
 */

import { StandardApiError } from "@/lib/api/errors";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runApiRedactionTests() {
  const secretOsk = "osk_live_94f2a188c9f4d1e204b78912";
  const secretAnthropic = "sk-ant-1234567890abcdef1234";
  const secretOpenAi = "sk-proj-1234567890abcdef1234";
  const bearerToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9";

  const rawMessage = `Failure during request: auth=${bearerToken}, osk=${secretOsk}, ant=${secretAnthropic}, oai=${secretOpenAi}`;

  const err = new StandardApiError("BAD_REQUEST", rawMessage, 400);

  // Assert all raw secrets are redacted
  assert(!err.message.includes(secretOsk), "OsterdOps secret must be redacted.");
  assert(!err.message.includes(secretAnthropic), "Anthropic secret must be redacted.");
  assert(!err.message.includes(secretOpenAi), "OpenAI secret must be redacted.");
  assert(!err.message.includes("eyJhbGciOiJSUzI1Ni"), "Bearer JWT must be redacted.");

  assert(err.message.includes("[REDACTED_API_KEY]"), "Placeholder must be inserted for API key.");
  assert(err.message.includes("[REDACTED_PROVIDER_KEY]"), "Placeholder must be inserted for provider key.");
  assert(err.message.includes("[REDACTED_TOKEN]"), "Placeholder must be inserted for Bearer token.");
}

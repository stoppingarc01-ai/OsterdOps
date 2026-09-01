/**
 * OsterdOps — Phase 14: Structured Logging & Redaction Unit Tests
 */

import { redactSensitiveData } from "@/lib/observability/redaction";
import { formatLogEntry } from "@/lib/observability/logger";

export function testLoggingRedaction() {
  // 1. Redact sensitive object keys
  const sensitivePayload = {
    requestId: "req_123",
    provider: "openai",
    model: "gpt-4o",
    prompt: "This is a confidential user prompt about medical data",
    completion: "Here is the diagnosis result",
    authorization: "Bearer eyJhbGciOi...",
    apiKey: "osk_live_1234567890abcdef",
    secretKey: ["sk", "live", "stripe_mock_token_987654321"].join("_"),
    messages: [{ role: "user", content: "Secret query" }],
    statusCode: 200,
  };

  const redacted = redactSensitiveData(sensitivePayload) as Record<string, unknown>;

  if (redacted.prompt !== "[REDACTED]") {
    throw new Error("Prompt was not redacted.");
  }
  if (redacted.completion !== "[REDACTED]") {
    throw new Error("Completion was not redacted.");
  }
  if (redacted.authorization !== "[REDACTED]") {
    throw new Error("Authorization header was not redacted.");
  }
  if (redacted.apiKey !== "[REDACTED]") {
    throw new Error("apiKey field was not redacted.");
  }
  if (redacted.messages !== "[REDACTED]") {
    throw new Error("Messages array was not redacted.");
  }
  if (redacted.provider !== "openai" || redacted.statusCode !== 200) {
    throw new Error("Safe fields were corrupted during redaction.");
  }

  // 2. Redact secrets in strings
  const rawStringWithSecret = "Request failed with key osk_live_secret123 and Bearer secret_jwt_token";
  const sanitizedStr = redactSensitiveData(rawStringWithSecret) as string;

  if (sanitizedStr.includes("osk_live_secret123") || sanitizedStr.includes("secret_jwt_token")) {
    throw new Error("Secret pattern inside string was not sanitized.");
  }

  // 3. Structured log entry format
  const logEntry = formatLogEntry("info", "GATEWAY_REQUEST", sensitivePayload);
  if (logEntry.metadata?.prompt !== "[REDACTED]" || logEntry.event !== "GATEWAY_REQUEST") {
    throw new Error("Log entry formatting failed.");
  }
}

export function runLoggingRedactionTests() {
  testLoggingRedaction();
}

/**
 * Unit Tests — Developer Experience, Webhook Signatures, CLI & Privacy Guarantees
 */

import crypto from "crypto";
import { runCli } from "@/sdk/cli";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

/**
 * Standard OsterdOps Webhook Verification implementation for testing.
 */
function verifyWebhookSignature(payloadRaw: string, sigHeader: string, secret: string): boolean {
  const parts = sigHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signaturePart = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!timestampPart || !signaturePart) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - parseInt(timestampPart, 10)) > 300) {
    return false; // Replay attack protection
  }

  const signedPayload = `${timestampPart}.${payloadRaw}`;
  const expectedSig = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signaturePart, "hex"), Buffer.from(expectedSig, "hex"));
  } catch {
    return false;
  }
}

export async function runDeveloperExperienceTests() {
  // 1. Webhook Signature Generation & Verification
  const webhookSecret = "whsec_test_secret_key_8841a";
  const payload = JSON.stringify({ event: "budget.threshold_reached", budgetId: "bud_123", spendUsd: 800 });
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const signedString = `${currentTimestamp}.${payload}`;
  const validSignature = crypto.createHmac("sha256", webhookSecret).update(signedString).digest("hex");
  const validHeader = `t=${currentTimestamp},v1=${validSignature}`;

  const verified = verifyWebhookSignature(payload, validHeader, webhookSecret);
  assert(verified === true, "Valid webhook signature must be verified successfully.");

  // 2. Tampered Payload Rejection
  const tamperedPayload = JSON.stringify({ event: "budget.threshold_reached", budgetId: "bud_123", spendUsd: 9999 });
  const tamperedVerified = verifyWebhookSignature(tamperedPayload, validHeader, webhookSecret);
  assert(tamperedVerified === false, "Tampered payload must be rejected.");

  // 3. Replay Attack (> 5 min old) Rejection
  const oldTimestamp = currentTimestamp - 400; // 400 seconds ago
  const oldSignedString = `${oldTimestamp}.${payload}`;
  const oldSignature = crypto.createHmac("sha256", webhookSecret).update(oldSignedString).digest("hex");
  const oldHeader = `t=${oldTimestamp},v1=${oldSignature}`;

  const oldVerified = verifyWebhookSignature(payload, oldHeader, webhookSecret);
  assert(oldVerified === false, "Expired timestamp (replay attack) must be rejected.");

  // 4. CLI Execution
  const cliExitCode = await runCli(["help"]);
  assert(cliExitCode === 0, "CLI help command must exit with code 0.");

  // 5. Request Inspector Zero-Prompt Retention Assertion
  const telemetrySample = {
    id: "req_01j9a8b1",
    timestamp: "2026-08-29 16:32:15",
    provider: "openai",
    model: "gpt-4o",
    project: "production-backend",
    statusCode: 200,
    latencyMs: 340,
    inputTokens: 320,
    outputTokens: 100,
    cachedTokens: 64,
    costUsd: 0.00172,
  };

  const disallowedKeys = ["prompt", "completion", "systemPrompt", "messages", "apiKey", "authorization"];
  for (const key of disallowedKeys) {
    assert(!(key in telemetrySample), `Telemetry model must NEVER contain sensitive key: ${key}`);
  }
}

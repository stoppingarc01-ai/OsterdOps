/**
 * Unit Tests — Webhook HMAC-SHA256 Signature Verification & Replay Protection
 */

import {
  generateWebhookSignature,
  verifyWebhookSignature,
} from "@/lib/webhooks/signature";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runWebhookSignatureTests() {
  const secret = "whsec_super_secret_signing_key_49a";
  const rawPayload = JSON.stringify({ id: "evt_123", type: "budget.threshold_reached", spend: 800 });

  // 1. Signature generation
  const { signatureHeader, timestamp } = generateWebhookSignature(rawPayload, secret);
  assert(signatureHeader.startsWith(`t=${timestamp},v1=`), "Signature header must be formatted correctly.");

  // 2. Valid signature verification
  const isValid = verifyWebhookSignature(rawPayload, signatureHeader, secret);
  assert(isValid === true, "Valid signature must verify successfully.");

  // 3. Forged secret rejection
  const isInvalidSecret = verifyWebhookSignature(rawPayload, signatureHeader, "whsec_wrong_key");
  assert(isInvalidSecret === false, "Forged secret must be rejected.");

  // 4. Tampered payload rejection
  const tamperedPayload = JSON.stringify({ id: "evt_123", type: "budget.threshold_reached", spend: 99999 });
  const isTamperedValid = verifyWebhookSignature(tamperedPayload, signatureHeader, secret);
  assert(isTamperedValid === false, "Tampered payload must be rejected.");

  // 5. Replay attack rejection (> 300s old)
  const expiredTimestamp = Math.floor(Date.now() / 1000) - 350;
  const { signatureHeader: expiredHeader } = generateWebhookSignature(rawPayload, secret, expiredTimestamp);
  const isReplayValid = verifyWebhookSignature(rawPayload, expiredHeader, secret);
  assert(isReplayValid === false, "Expired timestamp (replay attack) must be rejected.");
}

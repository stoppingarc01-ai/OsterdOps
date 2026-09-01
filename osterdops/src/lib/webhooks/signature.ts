/**
 * OsterdOps — Webhook HMAC-SHA256 Signature Engine (Phase 18)
 * Cryptographic signature generation, timing-safe verification, and replay protection.
 */

import crypto from "crypto";

export const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 300; // 5 minutes

/**
 * Generates an HMAC-SHA256 signed header for a raw webhook payload string.
 */
export function generateWebhookSignature(
  payloadRaw: string,
  secret: string,
  timestamp = Math.floor(Date.now() / 1000)
): { signatureHeader: string; timestamp: number } {
  const signedPayload = `${timestamp}.${payloadRaw}`;
  const signature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  const signatureHeader = `t=${timestamp},v1=${signature}`;
  return { signatureHeader, timestamp };
}

/**
 * Validates a webhook HMAC-SHA256 signature with constant-time equality and replay attack tolerance.
 */
export function verifyWebhookSignature(
  payloadRaw: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = DEFAULT_WEBHOOK_TOLERANCE_SECONDS
): boolean {
  if (!signatureHeader || !secret || !payloadRaw) {
    return false;
  }

  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signaturePart = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!timestampPart || !signaturePart) {
    return false;
  }

  const timestamp = parseInt(timestampPart, 10);
  if (isNaN(timestamp)) {
    return false;
  }

  // 1. Replay attack verification (5 minute tolerance)
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTimestamp - timestamp) > toleranceSeconds) {
    return false;
  }

  // 2. Recompute expected signature
  const signedPayload = `${timestamp}.${payloadRaw}`;
  const expectedSig = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  // 3. Constant-time comparison
  try {
    const signatureBuffer = Buffer.from(signaturePart, "hex");
    const expectedBuffer = Buffer.from(expectedSig, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * OsterdOps — Operational Log & Telemetry Redaction Engine (Phase 14)
 * Pure utility function to guarantee zero sensitive secrets or prompt/completion persistence.
 */

const SENSITIVE_KEYS = new Set([
  "prompt",
  "completion",
  "message",
  "messages",
  "content",
  "system",
  "text",
  "body",
  "authorization",
  "x-api-key",
  "apikey",
  "api_key",
  "secret",
  "secretkey",
  "secret_key",
  "keyiv",
  "key_iv",
  "keytag",
  "key_tag",
  "encryptedkey",
  "encrypted_key",
  "password",
  "token",
  "cookie",
  "cookies",
  "creditcard",
  "credit_card",
  "cvv",
  "stripe_secret_key",
  "stripe_webhook_secret",
]);

/**
 * Sanitizes strings to mask raw API keys, bearer tokens, or provider secrets.
 */
function sanitizeString(str: string): string {
  // Mask Bearer tokens
  let result = str.replace(/Bearer\s+[A-Za-z0-9_\-\.]+/gi, "Bearer [REDACTED]");
  // Mask OsterdOps API keys
  result = result.replace(/osk_(live|test)_[A-Za-z0-9]+/g, "osk_$1_[REDACTED]");
  // Mask Stripe Secret keys
  result = result.replace(/sk_(live|test)_[A-Za-z0-9]+/g, "sk_$1_[REDACTED]");
  // Mask Stripe Webhook secrets
  result = result.replace(/whsec_[A-Za-z0-9]+/g, "whsec_[REDACTED]");
  return result;
}

/**
 * Recursively sanitizes any payload, redacting prompt content, user messages, and private secrets.
 */
export function redactSensitiveData(data: unknown, depth = 0): unknown {
  if (depth > 8) return "[MAX_DEPTH_REACHED]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    return sanitizeString(data);
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, depth + 1));
  }

  if (typeof data === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        cleaned[key] = "[REDACTED]";
      } else {
        cleaned[key] = redactSensitiveData(val, depth + 1);
      }
    }
    return cleaned;
  }

  return "[UNSUPPORTED_TYPE]";
}

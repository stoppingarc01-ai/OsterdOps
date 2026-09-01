/**
 * OsterdOps — Secret Leak Prevention Scanner (Phase 15)
 * Scans runtime payloads, logs, or configurations to prevent accidental secret leakage.
 */

import { redactSensitiveData } from "@/lib/observability/redaction";

export interface SecretScanResult {
  foundSecrets: boolean;
  secretTypesDetected: string[];
  sanitized: unknown;
}

const SECRET_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "OsterdOps API Key", regex: /osk_(live|test)_[a-f0-9]{32,64}/i },
  { name: "Stripe Secret Key", regex: /sk_(live|test)_[a-zA-Z0-9]{24,}/i },
  { name: "Stripe Webhook Secret", regex: /whsec_[a-zA-Z0-9]{24,}/i },
  { name: "OpenAI API Key", regex: /sk-(proj-)?[a-zA-Z0-9_-]{32,}/i },
  { name: "Anthropic API Key", regex: /sk-ant-[a-zA-Z0-9_-]{32,}/i },
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "Bearer JWT Token", regex: /Bearer\s+eyJ[a-zA-Z0-9_\-\.]{20,}/i },
  { name: "Private RSA/EC Key", regex: /-----BEGIN\s+(RSA|EC|OPENSSH)?\s*PRIVATE\s+KEY-----/i },
];

/**
 * Scans data for credential patterns and returns sanitized output without leaking raw secret strings.
 */
export function scanForSecrets(data: unknown): SecretScanResult {
  const secretTypes = new Set<string>();

  function searchStrings(val: unknown, depth = 0): void {
    if (depth > 6 || val === null || val === undefined) return;

    if (typeof val === "string") {
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(val)) {
          secretTypes.add(pattern.name);
        }
      }
      return;
    }

    if (Array.isArray(val)) {
      for (const item of val) {
        searchStrings(item, depth + 1);
      }
      return;
    }

    if (typeof val === "object") {
      for (const v of Object.values(val as Record<string, unknown>)) {
        searchStrings(v, depth + 1);
      }
    }
  }

  searchStrings(data);
  const sanitized = redactSensitiveData(data);

  return {
    foundSecrets: secretTypes.size > 0,
    secretTypesDetected: Array.from(secretTypes),
    sanitized,
  };
}

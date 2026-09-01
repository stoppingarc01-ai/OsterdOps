/**
 * Unit Tests — Integration Secret Redaction & Log Safety
 */

import { maskSecret } from "@/lib/integrations/credential-store";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runIntegrationRedactionTests() {
  const secret = "whsec_super_secret_production_key_abcdef123456";
  const masked = maskSecret(secret);

  assert(!masked.includes("super_secret"), "Masked secret must not leak secret substrings.");
  assert(!masked.includes("abcdef"), "Masked secret must not leak inner characters.");
  assert(masked.startsWith("whsec"), "Prefix is preserved for identification.");
}

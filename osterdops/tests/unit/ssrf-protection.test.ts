/**
 * Unit Tests — Outbound SSRF Protection
 */

import { validateDestinationUrl, isSafeDestinationUrl } from "@/lib/integrations/ssrf";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runSsrfProtectionTests() {
  // 1. Loopback addresses blocked
  assert(!isSafeDestinationUrl("https://localhost/api"), "localhost must be blocked.");
  assert(!isSafeDestinationUrl("https://127.0.0.1/api"), "127.0.0.1 must be blocked.");
  assert(!isSafeDestinationUrl("https://127.0.0.254/api"), "127.0.0.254 loopback subnet must be blocked.");

  // 2. Private networks blocked
  assert(!isSafeDestinationUrl("https://10.0.0.1/webhook"), "10.0.0.0/8 private range must be blocked.");
  assert(!isSafeDestinationUrl("https://172.16.0.1/webhook"), "172.16.0.0/12 private range must be blocked.");
  assert(!isSafeDestinationUrl("https://172.31.255.255/webhook"), "172.31.255.255 private range must be blocked.");
  assert(!isSafeDestinationUrl("https://192.168.1.1/webhook"), "192.168.0.0/16 private range must be blocked.");

  // 3. Link-local and Cloud metadata blocked
  assert(!isSafeDestinationUrl("https://169.254.169.254/latest/meta-data"), "Cloud metadata IP must be blocked.");
  assert(!isSafeDestinationUrl("https://metadata.google.internal/computeMetadata/v1"), "GCP metadata hostname must be blocked.");

  // 4. Non-HTTP protocols blocked
  assert(!isSafeDestinationUrl("file:///etc/passwd"), "file:// scheme must be blocked.");
  assert(!isSafeDestinationUrl("javascript:alert(1)"), "javascript: scheme must be blocked.");
  assert(!isSafeDestinationUrl("data:text/plain;base64,SGVsbG8="), "data: scheme must be blocked.");
}

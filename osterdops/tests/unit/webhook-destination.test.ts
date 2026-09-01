/**
 * Unit Tests — Webhook Destination Validation
 */

import { validateDestinationUrl, isSafeDestinationUrl } from "@/lib/integrations/ssrf";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runWebhookDestinationTests() {
  // 1. Valid HTTPS URL
  assert(isSafeDestinationUrl("https://api.external.com/webhooks"), "Valid HTTPS URL must pass.");
  assert(isSafeDestinationUrl("https://hooks.slack.com/services/T00/B00/X00"), "Valid Slack URL must pass.");

  // 2. HTTP without testing flag is blocked
  assert(!isSafeDestinationUrl("http://api.external.com/webhooks"), "Plain HTTP must be blocked by default.");

  // 3. Malformed URLs
  assert(!isSafeDestinationUrl("not-a-url"), "Malformed URL string must fail.");
  assert(!isSafeDestinationUrl(""), "Empty URL string must fail.");
}

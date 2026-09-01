/**
 * OsterdOps — Phase 15: Security Events Engine Unit Tests
 */

import { recordSecurityEvent } from "@/lib/security/security-event.service";

export async function testSecurityEventsEngine() {
  const orgId = "org_sec_event_test";

  // 1. Record security event with sensitive metadata to ensure redaction
  const event = await recordSecurityEvent({
    type: "API_KEY_AUTH_FAILED",
    organizationId: orgId,
    actorId: "unknown",
    rawIp: "203.0.113.195",
    metadata: {
      triedSecret: "osk_live_secret12345",
      prompt: "Confidential prompt snippet",
    },
  });

  if (event.type !== "API_KEY_AUTH_FAILED" || event.severity !== "HIGH") {
    throw new Error("Security event severity mismatch.");
  }
  if (!event.ipHash || event.ipHash.includes("203.0.113.195")) {
    throw new Error("Raw IP was not pseudonymized in security event.");
  }
  if (event.metadata?.prompt !== "[REDACTED]") {
    throw new Error("Prompt snippet was not redacted from security event metadata.");
  }

  // 2. Critical cross-tenant block event
  const crossTenantEvent = await recordSecurityEvent({
    type: "CROSS_TENANT_ACCESS_BLOCKED",
    organizationId: orgId,
  });
  if (crossTenantEvent.severity !== "CRITICAL") {
    throw new Error("CROSS_TENANT_ACCESS_BLOCKED must be CRITICAL severity.");
  }
}

export async function runSecurityEventsTests() {
  await testSecurityEventsEngine();
}

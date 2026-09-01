/**
 * OsterdOps — Phase 15: Request Security & Abuse Prevention Unit Tests
 */

import {
  validateRequestPayloadSize,
  validateContentType,
  validateAllowedOrigin,
  hashClientIp,
  detectSuspiciousHeaders,
} from "@/lib/security/request-security";

export function testRequestSecurity() {
  // 1. Payload size validation
  const largeReq = new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-length": "15000000" }, // 15MB
  });
  const sizeCheck = validateRequestPayloadSize(largeReq, 10_000_000); // 10MB limit
  if (sizeCheck.valid || sizeCheck.errorCode !== "PAYLOAD_TOO_LARGE") {
    throw new Error("Payload size limit check failed to reject large request.");
  }

  const normalReq = new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-length": "5000" },
  });
  if (!validateRequestPayloadSize(normalReq, 10_000_000).valid) {
    throw new Error("Normal request size was incorrectly rejected.");
  }

  // 2. Content-Type validation
  const invalidContentReq = new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "text/plain" },
  });
  const contentCheck = validateContentType(invalidContentReq, "application/json");
  if (contentCheck.valid || contentCheck.errorCode !== "INVALID_CONTENT_TYPE") {
    throw new Error("Invalid content-type should be rejected for POST requests.");
  }

  // 3. Allowed Origin check
  if (!validateAllowedOrigin("https://app.osterdops.com", ["https://app.osterdops.com"])) {
    throw new Error("Exact origin match was rejected.");
  }
  if (validateAllowedOrigin("https://malicious-site.com", ["https://app.osterdops.com"])) {
    throw new Error("Unlisted origin should be rejected when whitelist is active.");
  }

  // 4. Privacy IP Hashing
  const rawIp = "192.168.1.105";
  const ipHash = hashClientIp(rawIp, "test_salt");
  if (!ipHash.startsWith("iph_") || ipHash.includes(rawIp)) {
    throw new Error("IP hashing failed to pseudonymize raw IP address.");
  }

  // 5. Suspicious header detection
  const maliciousHeaders = { host: "example.com\r\ninjected-header: true" };
  const suspiciousCheck = detectSuspiciousHeaders(maliciousHeaders);
  if (!suspiciousCheck.suspicious) {
    throw new Error("Header with CRLF injection was not flagged as suspicious.");
  }
}

export function runRequestSecurityTests() {
  testRequestSecurity();
}

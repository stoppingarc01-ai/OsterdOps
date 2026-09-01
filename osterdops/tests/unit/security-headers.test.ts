/**
 * OsterdOps — Phase 15: Security Headers Unit Tests
 */

import { getSecurityHeaders } from "@/lib/security/headers";

export function testSecurityHeaders() {
  const prodHeaders = getSecurityHeaders({ isProduction: true, enableHsts: true });

  // 1. Content Security Policy
  if (!prodHeaders["Content-Security-Policy"] || !prodHeaders["Content-Security-Policy"].includes("default-src 'self'")) {
    throw new Error("Content-Security-Policy header is missing or malformed.");
  }

  // 2. Clickjacking protection (X-Frame-Options & frame-ancestors)
  if (prodHeaders["X-Frame-Options"] !== "DENY" || !prodHeaders["Content-Security-Policy"].includes("frame-ancestors 'none'")) {
    throw new Error("X-Frame-Options must be DENY.");
  }

  // 3. MIME sniffing protection
  if (prodHeaders["X-Content-Type-Options"] !== "nosniff") {
    throw new Error("X-Content-Type-Options must be nosniff.");
  }

  // 4. Referrer Policy
  if (prodHeaders["Referrer-Policy"] !== "strict-origin-when-cross-origin") {
    throw new Error("Referrer-Policy must be strict-origin-when-cross-origin.");
  }

  // 5. HSTS in production
  if (!prodHeaders["Strict-Transport-Security"] || !prodHeaders["Strict-Transport-Security"].includes("max-age=31536000")) {
    throw new Error("Strict-Transport-Security must be configured in production.");
  }

  // 6. Cross-Origin policies
  if (prodHeaders["Cross-Origin-Opener-Policy"] !== "same-origin" || prodHeaders["Cross-Origin-Resource-Policy"] !== "same-origin") {
    throw new Error("Cross-Origin isolation headers missing.");
  }
}

export function runSecurityHeadersTests() {
  testSecurityHeaders();
}

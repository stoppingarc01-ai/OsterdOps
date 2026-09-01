/**
 * OsterdOps — Phase 15: Session & Authentication Security Unit Tests
 */

import {
  getSecureCookieOptions,
  isSessionExpired,
  isPrivilegedRole,
  canPerformPrivilegedAction,
} from "@/lib/security/session-security";

export function testSessionSecurity() {
  // 1. Secure cookie options
  const cookieOpts = getSecureCookieOptions();
  if (!cookieOpts.httpOnly || cookieOpts.sameSite !== "lax" || cookieOpts.path !== "/") {
    throw new Error("Cookie security attributes do not meet enterprise standards.");
  }

  // 2. Session expiration
  const nowSec = Math.floor(Date.now() / 1000);
  const recentAuth = nowSec - 300; // 5 min ago
  if (isSessionExpired(recentAuth, 60)) {
    throw new Error("Recent session was incorrectly flagged as expired.");
  }

  const oldAuth = nowSec - (120 * 60); // 2 hours ago
  if (!isSessionExpired(oldAuth, 60)) {
    throw new Error("Old session was not flagged as expired.");
  }

  // 3. Privileged role validation
  if (!isPrivilegedRole("OWNER") || !isPrivilegedRole("ADMIN")) {
    throw new Error("OWNER and ADMIN must be recognized as privileged roles.");
  }
  if (isPrivilegedRole("DEVELOPER") || isPrivilegedRole("VIEWER")) {
    throw new Error("DEVELOPER and VIEWER must not be privileged roles.");
  }

  // 4. Privileged action verification
  if (!canPerformPrivilegedAction("OWNER", "security:delete") || !canPerformPrivilegedAction("ADMIN", "security:manage")) {
    throw new Error("Privileged actions denied for OWNER/ADMIN.");
  }
  if (canPerformPrivilegedAction("DEVELOPER", "security:delete")) {
    throw new Error("Privileged actions allowed for non-privileged role.");
  }
}

export function runSessionSecurityTests() {
  testSessionSecurity();
}

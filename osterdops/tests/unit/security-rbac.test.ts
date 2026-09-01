/**
 * OsterdOps — Phase 15: Security RBAC & Authorization Unit Tests
 */

import { hasPermission } from "@/lib/auth/permissions";

export function testSecurityRbacMatrix() {
  // OWNER has full security access
  if (
    !hasPermission("OWNER", "security:read") ||
    !hasPermission("OWNER", "security:manage") ||
    !hasPermission("OWNER", "security:export") ||
    !hasPermission("OWNER", "security:delete")
  ) {
    throw new Error("OWNER must have full security permissions.");
  }

  // ADMIN has full security access
  if (
    !hasPermission("ADMIN", "security:read") ||
    !hasPermission("ADMIN", "security:manage") ||
    !hasPermission("ADMIN", "security:export") ||
    !hasPermission("ADMIN", "security:delete")
  ) {
    throw new Error("ADMIN must have full security permissions.");
  }

  // DEVELOPER has read-only security access
  if (!hasPermission("DEVELOPER", "security:read")) {
    throw new Error("DEVELOPER should have security:read.");
  }
  if (
    hasPermission("DEVELOPER", "security:manage") ||
    hasPermission("DEVELOPER", "security:export") ||
    hasPermission("DEVELOPER", "security:delete")
  ) {
    throw new Error("DEVELOPER must not have security management, export, or deletion permissions.");
  }

  // VIEWER has no security permissions
  if (
    hasPermission("VIEWER", "security:read") ||
    hasPermission("VIEWER", "security:manage") ||
    hasPermission("VIEWER", "security:export") ||
    hasPermission("VIEWER", "security:delete")
  ) {
    throw new Error("VIEWER must have no security permissions.");
  }
}

export function runSecurityRbacTests() {
  testSecurityRbacMatrix();
}

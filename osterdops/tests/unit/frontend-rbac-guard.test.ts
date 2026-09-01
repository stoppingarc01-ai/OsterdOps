/**
 * OsterdOps — Phase 16: Frontend RBAC Guard Unit Tests
 */

import { hasPermission } from "@/lib/auth/permissions";

export function testFrontendRbacGuard() {
  // 1. Billing Management UI Action Guard
  if (!hasPermission("OWNER", "billing:manage")) {
    throw new Error("OWNER must be permitted to manage billing.");
  }
  if (hasPermission("ADMIN", "billing:manage")) {
    throw new Error("ADMIN must NOT be permitted to modify billing subscriptions.");
  }
  if (hasPermission("DEVELOPER", "billing:manage")) {
    throw new Error("DEVELOPER must NOT be permitted to modify billing subscriptions.");
  }

  // 2. Budget Creation Guard
  if (!hasPermission("OWNER", "budgets:manage") || !hasPermission("ADMIN", "budgets:manage")) {
    throw new Error("OWNER and ADMIN must be permitted to create/manage budgets.");
  }
  if (hasPermission("DEVELOPER", "budgets:manage")) {
    throw new Error("DEVELOPER must NOT be permitted to create budgets.");
  }

  // 3. Security Settings & Deletion Guard
  if (!hasPermission("OWNER", "security:manage") || !hasPermission("ADMIN", "security:manage")) {
    throw new Error("OWNER and ADMIN must be permitted to modify security settings.");
  }
  if (hasPermission("DEVELOPER", "security:manage") || hasPermission("VIEWER", "security:manage")) {
    throw new Error("Non-admin roles must NOT be permitted to modify security settings.");
  }
}

export function runFrontendRbacGuardTests() {
  testFrontendRbacGuard();
}

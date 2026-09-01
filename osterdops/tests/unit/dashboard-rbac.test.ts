/**
 * Unit Tests — Dashboard RBAC Action Guarding & Privileged Features
 */

import { hasPermission } from "@/lib/auth/permissions";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runDashboardRbacTests() {
  // 1. Dashboard core metrics read access
  assert(hasPermission("VIEWER", "usage:read") === true, "VIEWER can view dashboard stats.");
  assert(hasPermission("DEVELOPER", "usage:read") === true, "DEVELOPER can view dashboard stats.");
  assert(hasPermission("ADMIN", "usage:read") === true, "ADMIN can view dashboard stats.");
  assert(hasPermission("OWNER", "usage:read") === true, "OWNER can view dashboard stats.");

  // 2. Budget action guarding
  assert(hasPermission("VIEWER", "budgets:read") === true, "VIEWER can view budgets.");
  assert(hasPermission("VIEWER", "budgets:manage") === false, "VIEWER cannot mutate budgets.");
  assert(hasPermission("DEVELOPER", "budgets:manage") === false, "DEVELOPER cannot mutate budgets.");
  assert(hasPermission("ADMIN", "budgets:manage") === true, "ADMIN can mutate budgets.");
  assert(hasPermission("OWNER", "budgets:manage") === true, "OWNER can mutate budgets.");

  // 3. Organization member administration guarding
  assert(hasPermission("DEVELOPER", "members:manage") === false, "DEVELOPER cannot invite or remove members.");
  assert(hasPermission("ADMIN", "members:manage") === true, "ADMIN can invite and manage members.");
  assert(hasPermission("OWNER", "members:manage") === true, "OWNER can invite and manage members.");
}

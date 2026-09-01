/**
 * Unit Tests — Integration & Automation RBAC Permission Matrix
 */

import { hasPermission } from "@/lib/auth/permissions";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runIntegrationRbacTests() {
  // 1. OWNER permissions
  assert(hasPermission("OWNER", "integrations:manage") === true, "OWNER can manage integrations.");
  assert(hasPermission("OWNER", "automations:manage") === true, "OWNER can manage automations.");
  assert(hasPermission("OWNER", "workflows:manage") === true, "OWNER can manage workflows.");

  // 2. ADMIN permissions
  assert(hasPermission("ADMIN", "integrations:manage") === true, "ADMIN can manage integrations.");
  assert(hasPermission("ADMIN", "automations:manage") === true, "ADMIN can manage automations.");
  assert(hasPermission("ADMIN", "workflows:manage") === true, "ADMIN can manage workflows.");

  // 3. DEVELOPER permissions
  assert(hasPermission("DEVELOPER", "integrations:read") === true, "DEVELOPER can read integrations.");
  assert(hasPermission("DEVELOPER", "automations:manage") === true, "DEVELOPER can manage automations.");
  assert(hasPermission("DEVELOPER", "workflows:manage") === true, "DEVELOPER can manage workflows.");

  // 4. VIEWER permissions
  assert(hasPermission("VIEWER", "integrations:read") === false, "VIEWER cannot read integrations.");
  assert(hasPermission("VIEWER", "automations:read") === true, "VIEWER can read automations.");
  assert(hasPermission("VIEWER", "workflows:read") === true, "VIEWER can read workflows.");
  assert(hasPermission("VIEWER", "automations:manage") === false, "VIEWER cannot manage automations.");
  assert(hasPermission("VIEWER", "workflows:manage") === false, "VIEWER cannot manage workflows.");
}

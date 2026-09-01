/**
 * Unit Tests — API RBAC Matrix & Developer Permissions
 */

import { hasPermission } from "@/lib/auth/permissions";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runApiRbacTests() {
  // 1. OWNER has full API permissions
  assert(hasPermission("OWNER", "api:read") === true, "OWNER must have api:read.");
  assert(hasPermission("OWNER", "api:manage") === true, "OWNER must have api:manage.");
  assert(hasPermission("OWNER", "api:keys:manage") === true, "OWNER must have api:keys:manage.");
  assert(hasPermission("OWNER", "webhooks:manage") === true, "OWNER must have webhooks:manage.");

  // 2. ADMIN has API management permissions
  assert(hasPermission("ADMIN", "api:read") === true, "ADMIN must have api:read.");
  assert(hasPermission("ADMIN", "api:keys:manage") === true, "ADMIN must have api:keys:manage.");
  assert(hasPermission("ADMIN", "webhooks:manage") === true, "ADMIN must have webhooks:manage.");

  // 3. DEVELOPER has read and gateway execution permissions
  assert(hasPermission("DEVELOPER", "api:read") === true, "DEVELOPER must have api:read.");
  assert(hasPermission("DEVELOPER", "api:keys:read") === true, "DEVELOPER must have api:keys:read.");
  assert(hasPermission("DEVELOPER", "gateway:invoke") === true, "DEVELOPER must have gateway:invoke.");
  assert(hasPermission("DEVELOPER", "api:manage") === false, "DEVELOPER must not have api:manage.");
  assert(hasPermission("DEVELOPER", "webhooks:manage") === false, "DEVELOPER must not have webhooks:manage.");

  // 4. VIEWER has read-only permissions
  assert(hasPermission("VIEWER", "api:read") === true, "VIEWER must have api:read.");
  assert(hasPermission("VIEWER", "webhooks:read") === true, "VIEWER must have webhooks:read.");
  assert(hasPermission("VIEWER", "keys:manage") === false, "VIEWER must not have keys:manage.");
  assert(hasPermission("VIEWER", "gateway:invoke") === false, "VIEWER must not have gateway:invoke.");
}

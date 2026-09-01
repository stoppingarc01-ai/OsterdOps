/**
 * Unit Tests — Enterprise Control Plane Architecture & State Guards
 */

import { can, hasRole } from "@/lib/auth/client-permissions";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runControlPlaneTests() {
  // 1. Role hierarchy rank evaluation
  assert(hasRole("OWNER", "OWNER") === true, "OWNER has OWNER role.");
  assert(hasRole("ADMIN", "OWNER") === true, "OWNER meets ADMIN rank.");
  assert(hasRole("DEVELOPER", "ADMIN") === true, "ADMIN meets DEVELOPER rank.");
  assert(hasRole("ADMIN", "DEVELOPER") === false, "DEVELOPER does not meet ADMIN rank.");
  assert(hasRole("DEVELOPER", "VIEWER") === false, "VIEWER does not meet DEVELOPER rank.");

  // 2. Permission checks via client can() helper
  assert(can("org:settings:manage", "OWNER") === true, "OWNER can manage org settings.");
  assert(can("org:settings:manage", "DEVELOPER") === false, "DEVELOPER cannot manage org settings.");
  assert(can("usage:read", "VIEWER") === true, "VIEWER can read usage.");
  assert(can("keys:manage", "VIEWER") === false, "VIEWER cannot manage keys.");

  // 3. Null / undefined handling
  assert(can("usage:read", null) === false, "Null role has no permissions.");
  assert(hasRole("ADMIN", null) === false, "Null role has no rank.");
}

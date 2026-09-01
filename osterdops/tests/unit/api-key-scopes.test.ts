/**
 * Unit Tests — API Key Scoping, RBAC Intersection & Privilege Escalation Prevention
 */

import {
  hasEffectiveApiKeyPermission,
  ApiKeyScope,
} from "@/lib/auth/permissions";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runApiKeyScopesTests() {
  // 1. Unscoped key inherits full role permissions
  assert(hasEffectiveApiKeyPermission("OWNER", undefined, "projects:manage") === true, "Unscoped OWNER key has projects:manage.");
  assert(hasEffectiveApiKeyPermission("DEVELOPER", undefined, "keys:read") === true, "Unscoped DEVELOPER key has keys:read.");
  assert(hasEffectiveApiKeyPermission("DEVELOPER", undefined, "billing:manage") === false, "Unscoped DEVELOPER key cannot billing:manage.");

  // 2. Scoped key restricted to subset of role permissions
  const gatewayOnlyScopes: ApiKeyScope[] = ["gateway:invoke"];
  assert(hasEffectiveApiKeyPermission("OWNER", gatewayOnlyScopes, "gateway:invoke") === true, "OWNER key with gateway:invoke has gateway:invoke.");
  assert(hasEffectiveApiKeyPermission("OWNER", gatewayOnlyScopes, "projects:manage") === false, "OWNER key scoped to gateway cannot manage projects.");
  assert(hasEffectiveApiKeyPermission("OWNER", gatewayOnlyScopes, "billing:manage") === false, "OWNER key scoped to gateway cannot manage billing.");

  // 3. Privilege escalation prevention: Key scope CANNOT grant what role lacks
  const adminScopes: ApiKeyScope[] = ["billing:manage", "projects:write"];
  assert(hasEffectiveApiKeyPermission("DEVELOPER", adminScopes, "billing:manage") === false, "DEVELOPER role cannot escalate to billing:manage even if requested in scope.");
  assert(hasEffectiveApiKeyPermission("VIEWER", adminScopes, "projects:manage") === false, "VIEWER role cannot escalate to projects:manage.");
}

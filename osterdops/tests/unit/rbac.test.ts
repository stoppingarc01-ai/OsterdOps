/**
 * OsterdOps — RBAC & Server Authorization Tests
 */

import { hasMinimumRole, ROLE_HIERARCHY } from "@/lib/auth/rbac-rules";
import type { OrganizationRole } from "@/types";

export function testRoleHierarchy() {
  const roles: OrganizationRole[] = ["OWNER", "ADMIN", "DEVELOPER", "VIEWER"];

  // 1. Validate numerical ranking order
  if (ROLE_HIERARCHY.OWNER <= ROLE_HIERARCHY.ADMIN) {
    throw new Error("OWNER must rank strictly higher than ADMIN");
  }
  if (ROLE_HIERARCHY.ADMIN <= ROLE_HIERARCHY.DEVELOPER) {
    throw new Error("ADMIN must rank strictly higher than DEVELOPER");
  }
  if (ROLE_HIERARCHY.DEVELOPER <= ROLE_HIERARCHY.VIEWER) {
    throw new Error("DEVELOPER must rank strictly higher than VIEWER");
  }

  // 2. OWNER can perform any role's actions
  for (const role of roles) {
    if (!hasMinimumRole("OWNER", role)) {
      throw new Error(`OWNER should satisfy minimum role '${role}'`);
    }
  }

  // 3. ADMIN can perform DEVELOPER and VIEWER actions, but NOT OWNER
  if (!hasMinimumRole("ADMIN", "ADMIN")) throw new Error("ADMIN should satisfy ADMIN");
  if (!hasMinimumRole("ADMIN", "DEVELOPER")) throw new Error("ADMIN should satisfy DEVELOPER");
  if (!hasMinimumRole("ADMIN", "VIEWER")) throw new Error("ADMIN should satisfy VIEWER");
  if (hasMinimumRole("ADMIN", "OWNER")) throw new Error("ADMIN must NOT satisfy OWNER");

  // 4. DEVELOPER cannot perform ADMIN or OWNER actions
  if (!hasMinimumRole("DEVELOPER", "DEVELOPER")) throw new Error("DEVELOPER should satisfy DEVELOPER");
  if (!hasMinimumRole("DEVELOPER", "VIEWER")) throw new Error("DEVELOPER should satisfy VIEWER");
  if (hasMinimumRole("DEVELOPER", "ADMIN")) throw new Error("DEVELOPER must NOT satisfy ADMIN");
  if (hasMinimumRole("DEVELOPER", "OWNER")) throw new Error("DEVELOPER must NOT satisfy OWNER");

  // 5. VIEWER cannot perform mutations
  if (!hasMinimumRole("VIEWER", "VIEWER")) throw new Error("VIEWER should satisfy VIEWER");
  if (hasMinimumRole("VIEWER", "DEVELOPER")) throw new Error("VIEWER must NOT satisfy DEVELOPER");
  if (hasMinimumRole("VIEWER", "ADMIN")) throw new Error("VIEWER must NOT satisfy ADMIN");
  if (hasMinimumRole("VIEWER", "OWNER")) throw new Error("VIEWER must NOT satisfy OWNER");

  return true;
}

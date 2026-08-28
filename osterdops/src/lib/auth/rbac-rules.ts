/**
 * OsterdOps — RBAC Role Definitions & Permission Comparison Rules
 * Pure utility functions with no I/O side-effects.
 */

import type { OrganizationRole } from "@/types";

export const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  DEVELOPER: 2,
  VIEWER: 1,
};

/**
 * Compares two roles to check if current role meets or exceeds required minimum role.
 */
export function hasMinimumRole(
  currentRole: OrganizationRole,
  minimumRole: OrganizationRole
): boolean {
  const currentRank = ROLE_HIERARCHY[currentRole] ?? 0;
  const requiredRank = ROLE_HIERARCHY[minimumRole] ?? 0;
  return currentRank >= requiredRank;
}

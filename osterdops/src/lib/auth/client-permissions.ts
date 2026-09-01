/**
 * OsterdOps — Client-Side Authorization & RBAC Helper (Phase 19)
 * Pure utility functions for UI visibility guarding.
 * NOTE: Server-side authorization remains authoritative; client checks only guard UI rendering.
 */

import { hasPermission, Permission } from "./permissions";
import type { OrganizationRole } from "@/types";

const ROLE_RANKS: Record<OrganizationRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  DEVELOPER: 2,
  VIEWER: 1,
};

/**
 * Checks whether the current user's role has the required permission for UI rendering.
 */
export function can(permission: Permission, role?: OrganizationRole | null): boolean {
  if (!role) return false;
  return hasPermission(role, permission);
}

/**
 * Checks whether currentRole meets or exceeds the required role rank.
 * Hierarchy: OWNER (4) > ADMIN (3) > DEVELOPER (2) > VIEWER (1)
 */
export function hasRole(requiredRole: OrganizationRole, currentRole?: OrganizationRole | null): boolean {
  if (!currentRole) return false;
  const currentRank = ROLE_RANKS[currentRole] || 0;
  const requiredRank = ROLE_RANKS[requiredRole] || 0;
  return currentRank >= requiredRank;
}

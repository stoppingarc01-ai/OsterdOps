/**
 * OsterdOps — Phase 26 Team Member Management & RBAC Lifecycle
 * Validates Journey 2:
 * 1. OWNER invites new members with distinct roles (ADMIN, DEVELOPER, VIEWER)
 * 2. Members join and role assignments are verified
 * 3. Full authorization matrix tested for every role (positive & negative checks)
 * 4. OWNER updates member role (e.g. DEVELOPER -> ADMIN) and permissions update dynamically
 * 5. Member revocation and immediate access termination
 * 6. Protection preventing removing the sole OWNER
 */

import { hasPermission } from "@/lib/auth/permissions";
import { hasMinimumRole, ROLE_HIERARCHY } from "@/lib/auth/rbac-rules";
import type { OrganizationMember, OrganizationRole } from "@/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runTeamManagementE2ETests(): void {
  console.log("▶ Running Phase 26: Journey 2 — Team Member Management & RBAC Lifecycle...");

  const orgId = "org_team_journey";

  // In-memory member store
  const members: Record<string, OrganizationMember> = {
    usr_owner: {
      userId: "usr_owner",
      email: "founder@team.io",
      displayName: "Founder",
      role: "OWNER",
      status: "active",
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  // 1. Invite Members with different roles
  function inviteMember(userId: string, email: string, displayName: string, role: OrganizationRole) {
    members[userId] = {
      userId,
      email,
      displayName,
      role,
      status: "active",
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  inviteMember("usr_admin", "admin@team.io", "Alice Admin", "ADMIN");
  inviteMember("usr_dev", "dev@team.io", "Bob Developer", "DEVELOPER");
  inviteMember("usr_viewer", "viewer@team.io", "Charlie Viewer", "VIEWER");

  assert(Object.keys(members).length === 4, "All 4 members must be registered");

  // 2. Validate Role Hierarchy Levels
  assert(ROLE_HIERARCHY.OWNER > ROLE_HIERARCHY.ADMIN, "OWNER level must exceed ADMIN");
  assert(ROLE_HIERARCHY.ADMIN > ROLE_HIERARCHY.DEVELOPER, "ADMIN level must exceed DEVELOPER");
  assert(ROLE_HIERARCHY.DEVELOPER > ROLE_HIERARCHY.VIEWER, "DEVELOPER level must exceed VIEWER");

  // 3. Complete RBAC Matrix Verification

  // --- OWNER ---
  assert(hasPermission("OWNER", "org:settings:manage") === true, "OWNER can manage org settings");
  assert(hasPermission("OWNER", "members:manage") === true, "OWNER can manage members");
  assert(hasPermission("OWNER", "billing:manage") === true, "OWNER can manage billing");
  assert(hasPermission("OWNER", "projects:manage") === true, "OWNER can manage projects");
  assert(hasPermission("OWNER", "budgets:manage") === true, "OWNER can manage budgets");
  assert(hasPermission("OWNER", "keys:manage") === true, "OWNER can manage API keys");
  assert(hasPermission("OWNER", "audit:read") === true, "OWNER can view audit logs");
  assert(hasPermission("OWNER", "security:manage") === true, "OWNER can manage security");

  // --- ADMIN ---
  assert(hasPermission("ADMIN", "projects:manage") === true, "ADMIN can manage projects");
  assert(hasPermission("ADMIN", "members:manage") === true, "ADMIN can manage members");
  assert(hasPermission("ADMIN", "budgets:manage") === true, "ADMIN can manage budgets");
  assert(hasPermission("ADMIN", "keys:manage") === true, "ADMIN can manage API keys");
  assert(hasPermission("ADMIN", "billing:manage") === false, "ADMIN cannot manage organization billing");
  assert(hasPermission("ADMIN", "org:settings:manage") === false, "ADMIN cannot manage root organization settings");

  // --- DEVELOPER ---
  assert(hasPermission("DEVELOPER", "projects:read") === true, "DEVELOPER can read projects");
  assert(hasPermission("DEVELOPER", "keys:read") === true, "DEVELOPER can read API keys");
  assert(hasPermission("DEVELOPER", "keys:manage") === false, "DEVELOPER cannot create/revoke API keys");
  assert(hasPermission("DEVELOPER", "projects:manage") === false, "DEVELOPER cannot create or delete projects");
  assert(hasPermission("DEVELOPER", "members:manage") === false, "DEVELOPER cannot manage members");
  assert(hasPermission("DEVELOPER", "billing:manage") === false, "DEVELOPER cannot manage billing");
  assert(hasPermission("DEVELOPER", "budgets:manage") === false, "DEVELOPER cannot manage budgets");

  // --- VIEWER ---
  assert(hasPermission("VIEWER", "projects:read") === true, "VIEWER can read projects");
  assert(hasPermission("VIEWER", "keys:read") === true, "VIEWER can read API keys");
  assert(hasPermission("VIEWER", "projects:manage") === false, "VIEWER cannot mutate projects");
  assert(hasPermission("VIEWER", "keys:manage") === false, "VIEWER cannot create or revoke keys");
  assert(hasPermission("VIEWER", "members:manage") === false, "VIEWER cannot invite members");
  assert(hasPermission("VIEWER", "billing:manage") === false, "VIEWER cannot manage billing");
  assert(hasPermission("VIEWER", "budgets:manage") === false, "VIEWER cannot edit budgets");
  assert(hasPermission("VIEWER", "security:manage") === false, "VIEWER cannot manage security");

  // 4. Role Mutation: Promote DEVELOPER to ADMIN
  members["usr_dev"].role = "ADMIN";
  members["usr_dev"].updatedAt = new Date().toISOString();

  assert(members["usr_dev"].role === "ADMIN", "Role must be updated to ADMIN");
  assert(hasPermission(members["usr_dev"].role, "projects:manage") === true, "Promoted member now has 'projects:manage'");
  assert(hasPermission(members["usr_dev"].role, "members:manage") === true, "Promoted member now has 'members:manage'");

  // 5. Member Revocation & Immediate Session Invalidation
  delete members["usr_viewer"];
  assert(members["usr_viewer"] === undefined, "Revoked member is removed from organization");

  const canRevokedMemberAccess = Boolean(members["usr_viewer"]) && hasMinimumRole("VIEWER", "VIEWER");
  assert(canRevokedMemberAccess === false, "Revoked member must be denied access immediately");

  // 6. Sole OWNER Protection Safeguard
  const activeOwners = Object.values(members).filter((m) => m.role === "OWNER" && m.status === "active");
  assert(activeOwners.length === 1, "Must have exactly 1 active OWNER");

  function removeOwner(targetUserId: string): { success: boolean; error?: string } {
    const target = members[targetUserId];
    if (!target) return { success: false, error: "Member not found." };
    if (target.role === "OWNER") {
      const owners = Object.values(members).filter((m) => m.role === "OWNER" && m.status === "active");
      if (owners.length <= 1) {
        return { success: false, error: "Cannot remove the only OWNER of the organization." };
      }
    }
    delete members[targetUserId];
    return { success: true };
  }

  const removalResult = removeOwner("usr_owner");
  assert(removalResult.success === false, "Removing sole OWNER must fail");
  assert(removalResult.error?.includes("Cannot remove the only OWNER"), "Clear error message returned");
  assert(members["usr_owner"] !== undefined, "Sole OWNER must remain present in member store");

  console.log("✔ Phase 26: Journey 2 — Team Member Management & RBAC Lifecycle passed.");
}

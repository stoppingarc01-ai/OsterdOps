/**
 * OsterdOps — Granular RBAC Permissions & Role Mapping
 * Pure utility functions with no I/O side-effects.
 */

import type { OrganizationRole } from "@/types";

export type Permission =
  // Organization lifecycle & root settings
  | "org:delete"
  | "org:settings:manage"
  | "org:settings:read"
  // Team membership management
  | "members:manage"
  | "members:read"
  // Billing & subscriptions
  | "billing:manage"
  | "billing:read"
  // Upstream AI provider integrations
  | "integrations:manage"
  | "integrations:read"
  // Projects & workspaces
  | "projects:manage"
  | "projects:read"
  // Project API Keys
  | "keys:manage"
  | "keys:read"
  // Budgets & spending limits
  | "budgets:manage"
  | "budgets:read"
  | "budgets:enforce"
  | "budget:manage"
  | "budget:read"
  | "budget:enforce"
  // Alerts & notifications
  | "alerts:manage"
  | "alerts:read"
  | "notifications:manage"
  | "notifications:read"
  // System diagnostics & production operations (Phase 14)
  | "system:manage"
  | "system:read"
  // Security, compliance & privacy (Phase 15)
  | "security:read"
  | "security:manage"
  | "security:export"
  | "security:delete"
  // Telemetry, usage & logs
  | "usage:read"
  | "analytics:read"
  | "audit:read"
  // API & Webhook developer platform (Phase 18)
  | "api:read"
  | "api:manage"
  | "api:keys:read"
  | "api:keys:manage"
  | "webhooks:read"
  | "webhooks:manage"
  | "gateway:invoke"
  // Integrations, Automation & Workflows (Phase 20)
  | "automations:read"
  | "automations:manage"
  | "workflows:read"
  | "workflows:manage";

export type ApiKeyScope =
  | "gateway:invoke"
  | "projects:read"
  | "projects:write"
  | "keys:read"
  | "keys:write"
  | "usage:read"
  | "analytics:read"
  | "budgets:read"
  | "budgets:write"
  | "billing:read"
  | "billing:manage"
  | "alerts:read"
  | "alerts:write"
  | "security:read";

/**
 * Maps API Key Scope to concrete RBAC permissions.
 */
export const API_KEY_SCOPE_TO_PERMISSIONS: Record<ApiKeyScope, Permission[]> = {
  "gateway:invoke": ["gateway:invoke"],
  "projects:read": ["projects:read"],
  "projects:write": ["projects:manage", "projects:read"],
  "keys:read": ["keys:read", "api:keys:read"],
  "keys:write": ["keys:manage", "keys:read", "api:keys:manage", "api:keys:read"],
  "usage:read": ["usage:read"],
  "analytics:read": ["analytics:read", "usage:read"],
  "budgets:read": ["budgets:read", "budget:read"],
  "budgets:write": ["budgets:manage", "budgets:read", "budget:manage", "budget:read", "budgets:enforce", "budget:enforce"],
  "billing:read": ["billing:read"],
  "billing:manage": ["billing:manage", "billing:read"],
  "alerts:read": ["alerts:read"],
  "alerts:write": ["alerts:manage", "alerts:read"],
  "security:read": ["security:read"],
};

/**
 * Role-to-Permissions mapping matrix.
 */
export const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  OWNER: [
    "org:delete",
    "org:settings:manage",
    "org:settings:read",
    "members:manage",
    "members:read",
    "billing:manage",
    "billing:read",
    "integrations:manage",
    "integrations:read",
    "projects:manage",
    "projects:read",
    "keys:manage",
    "keys:read",
    "budgets:manage",
    "budgets:read",
    "budgets:enforce",
    "budget:manage",
    "budget:read",
    "budget:enforce",
    "alerts:manage",
    "alerts:read",
    "notifications:manage",
    "notifications:read",
    "system:manage",
    "system:read",
    "security:read",
    "security:manage",
    "security:export",
    "security:delete",
    "usage:read",
    "analytics:read",
    "audit:read",
    "api:read",
    "api:manage",
    "api:keys:read",
    "api:keys:manage",
    "webhooks:read",
    "webhooks:manage",
    "gateway:invoke",
    "automations:read",
    "automations:manage",
    "workflows:read",
    "workflows:manage",
  ],
  ADMIN: [
    "org:settings:read",
    "members:manage",
    "members:read",
    "billing:read",
    "integrations:manage",
    "integrations:read",
    "projects:manage",
    "projects:read",
    "keys:manage",
    "keys:read",
    "budgets:manage",
    "budgets:read",
    "budgets:enforce",
    "budget:manage",
    "budget:read",
    "budget:enforce",
    "alerts:manage",
    "alerts:read",
    "notifications:manage",
    "notifications:read",
    "system:manage",
    "system:read",
    "security:read",
    "security:manage",
    "security:export",
    "security:delete",
    "usage:read",
    "analytics:read",
    "audit:read",
    "api:read",
    "api:manage",
    "api:keys:read",
    "api:keys:manage",
    "webhooks:read",
    "webhooks:manage",
    "gateway:invoke",
    "automations:read",
    "automations:manage",
    "workflows:read",
    "workflows:manage",
  ],
  DEVELOPER: [
    "org:settings:read",
    "members:read",
    "integrations:read",
    "projects:read",
    "keys:read",
    "budgets:read",
    "budget:read",
    "alerts:read",
    "notifications:read",
    "system:read",
    "security:read",
    "usage:read",
    "analytics:read",
    "api:read",
    "api:keys:read",
    "webhooks:read",
    "gateway:invoke",
    "automations:read",
    "automations:manage",
    "workflows:read",
    "workflows:manage",
  ],
  VIEWER: [
    "org:settings:read",
    "projects:read",
    "keys:read",
    "budgets:read",
    "budget:read",
    "alerts:read",
    "notifications:read",
    "system:read",
    "usage:read",
    "analytics:read",
    "api:read",
    "webhooks:read",
    "automations:read",
    "workflows:read",
  ],
};

/**
 * Checks if a role has a specific permission (with plural/singular alias resolution).
 */
export function hasPermission(role: OrganizationRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes(permission)) return true;

  // Check alias mappings
  if (permission === "budget:read" && permissions.includes("budgets:read")) return true;
  if (permission === "budgets:read" && permissions.includes("budget:read")) return true;
  if (permission === "budget:manage" && permissions.includes("budgets:manage")) return true;
  if (permission === "budgets:manage" && permissions.includes("budget:manage")) return true;
  if (permission === "budget:enforce" && permissions.includes("budgets:enforce")) return true;
  if (permission === "budgets:enforce" && permissions.includes("budget:enforce")) return true;
  if (permission === "keys:read" && permissions.includes("api:keys:read")) return true;
  if (permission === "api:keys:read" && permissions.includes("keys:read")) return true;
  if (permission === "keys:manage" && permissions.includes("api:keys:manage")) return true;
  if (permission === "api:keys:manage" && permissions.includes("keys:manage")) return true;

  return false;
}

/**
 * Evaluates effective permission for an API Key actor:
 * minimum(rolePermissions, keyScopes) — prevents privilege escalation.
 */
export function hasEffectiveApiKeyPermission(
  role: OrganizationRole,
  keyScopes: ApiKeyScope[] | undefined,
  requiredPermission: Permission
): boolean {
  // 1. Role must have the permission
  if (!hasPermission(role, requiredPermission)) {
    return false;
  }

  // 2. If no explicit scopes specified, inherits all role permissions
  if (!keyScopes || keyScopes.length === 0) {
    return true;
  }

  // 3. Otherwise, key scopes must explicitly grant the required permission
  for (const scope of keyScopes) {
    const grantedPermissions = API_KEY_SCOPE_TO_PERMISSIONS[scope] || [];
    if (grantedPermissions.includes(requiredPermission)) {
      return true;
    }
  }

  return false;
}

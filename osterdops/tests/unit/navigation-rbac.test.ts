/**
 * Unit Tests — Navigation Section Visibility & RBAC Protection
 */

import { hasPermission, Permission } from "@/lib/auth/permissions";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runNavigationRbacTests() {
  interface NavItemConfig {
    id: string;
    path: string;
    permission?: Permission;
  }

  const items: NavItemConfig[] = [
    { id: "dashboard", path: "/dashboard" },
    { id: "analytics", path: "/dashboard/analytics", permission: "usage:read" },
    { id: "budgets", path: "/dashboard/budgets", permission: "budgets:read" },
    { id: "keys", path: "/dashboard/api-keys", permission: "keys:read" },
    { id: "members", path: "/dashboard/members", permission: "members:read" },
    { id: "audit", path: "/dashboard/audit-logs", permission: "audit:read" },
    { id: "settings_org", path: "/dashboard/settings/organization", permission: "org:settings:read" },
    { id: "settings_bill", path: "/dashboard/settings/billing", permission: "billing:manage" },
  ];

  // 1. OWNER can view all navigation items
  const ownerVisible = items.filter((item) => !item.permission || hasPermission("OWNER", item.permission));
  assert(ownerVisible.length === items.length, "OWNER can view all navigation items.");

  // 2. DEVELOPER navigation items
  const devVisible = items.filter((item) => !item.permission || hasPermission("DEVELOPER", item.permission));
  const devIds = devVisible.map((i) => i.id);
  assert(devIds.includes("dashboard"), "DEVELOPER can view dashboard.");
  assert(devIds.includes("analytics"), "DEVELOPER can view analytics.");
  assert(devIds.includes("keys"), "DEVELOPER can view api keys.");
  assert(!devIds.includes("settings_bill"), "DEVELOPER cannot view billing settings navigation item.");

  // 3. ADMIN navigation items
  const adminVisible = items.filter((item) => !item.permission || hasPermission("ADMIN", item.permission));
  const adminIds = adminVisible.map((i) => i.id);
  assert(adminIds.includes("audit"), "ADMIN can view audit logs.");
  assert(adminIds.includes("members"), "ADMIN can view members.");

  // 4. VIEWER navigation items
  const viewerVisible = items.filter((item) => !item.permission || hasPermission("VIEWER", item.permission));
  const viewerIds = viewerVisible.map((i) => i.id);
  assert(viewerIds.includes("dashboard"), "VIEWER can view dashboard.");
  assert(viewerIds.includes("analytics"), "VIEWER can view analytics.");
  assert(!viewerIds.includes("audit"), "VIEWER cannot view compliance audit logs.");
  assert(!viewerIds.includes("settings_bill"), "VIEWER cannot view billing settings.");
}

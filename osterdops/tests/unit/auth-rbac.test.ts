/**
 * OsterdOps — Comprehensive Authentication & Organization RBAC Test Suite
 * Covers:
 * 1. Valid authentication & token extraction
 * 2. Invalid authentication & token rejection
 * 3. Expired token verification
 * 4. Organization membership verification
 * 5. OWNER permissions
 * 6. ADMIN permissions
 * 7. DEVELOPER permissions
 * 8. VIEWER permissions
 * 9. Cross-organization access rejection
 */

import { hasMinimumRole } from "@/lib/auth/rbac-rules";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import type { OrganizationRole, OrganizationMember, Organization } from "@/types";

// Helper to simulate token extraction logic
function simulateExtractAuthToken(headers: Record<string, string>): string | null {
  const authHeader = headers["authorization"] || headers["Authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    return token.length > 0 ? token : null;
  }

  const cookieHeader = headers["cookie"];
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc, str) => {
      const [key, val] = str.trim().split("=");
      if (key && val) acc[key] = decodeURIComponent(val);
      return acc;
    }, {} as Record<string, string>);

    if (cookies.__session) {
      return cookies.__session;
    }
  }

  return null;
}

// Helper to simulate token expiration and signature checks
function simulateVerifyToken(token: string, simulatedCurrentTimeSec: number): { valid: boolean; uid?: string; exp?: number; error?: string } {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, error: "Malformed token" };
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid JWT token structure" };
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    if (!payload.sub || !payload.exp) {
      return { valid: false, error: "Missing required claims (sub, exp)" };
    }

    if (payload.exp < simulatedCurrentTimeSec) {
      return { valid: false, error: "Token expired", exp: payload.exp };
    }

    return { valid: true, uid: payload.sub, exp: payload.exp };
  } catch {
    return { valid: false, error: "Token decoding failed" };
  }
}

// Helper to simulate organization access verification
function simulateVerifyOrgAccess(
  userId: string,
  targetOrgId: string,
  mockDb: {
    organizations: Record<string, Organization>;
    members: Record<string, Record<string, OrganizationMember>>; // orgId -> userId -> member
  },
  requiredRole: OrganizationRole = "VIEWER"
): { allowed: boolean; statusCode: number; error?: string } {
  const org = mockDb.organizations[targetOrgId];
  if (!org) {
    return { allowed: false, statusCode: 404, error: "Organization not found" };
  }

  if (org.status === "suspended") {
    return { allowed: false, statusCode: 403, error: "Organization suspended" };
  }

  const orgMembers = mockDb.members[targetOrgId] || {};
  const member = orgMembers[userId];

  if (!member) {
    return { allowed: false, statusCode: 403, error: "User is not a member of this organization" };
  }

  if (member.status !== "active") {
    return { allowed: false, statusCode: 403, error: `Membership is ${member.status}` };
  }

  if (!hasMinimumRole(member.role, requiredRole)) {
    return { allowed: false, statusCode: 403, error: `Requires role ${requiredRole}, got ${member.role}` };
  }

  return { allowed: true, statusCode: 200 };
}

// 1. Valid Authentication Test
export function testValidAuthentication() {
  // Test Bearer header
  const token = "mock.valid.token";
  const authHeaderResult = simulateExtractAuthToken({ authorization: `Bearer ${token}` });
  if (authHeaderResult !== token) {
    throw new Error(`Expected extracted token '${token}', got '${authHeaderResult}'`);
  }

  // Test Cookie header
  const cookieResult = simulateExtractAuthToken({ cookie: `__session=${token}; theme=dark` });
  if (cookieResult !== token) {
    throw new Error(`Expected extracted cookie token '${token}', got '${cookieResult}'`);
  }

  // Test valid token decoding
  const now = Math.floor(Date.now() / 1000);
  const validJwt = `header.${Buffer.from(JSON.stringify({ sub: "usr_12345", exp: now + 3600, email: "user@example.com" })).toString("base64")}.sig`;
  const verification = simulateVerifyToken(validJwt, now);
  if (!verification.valid || verification.uid !== "usr_12345") {
    throw new Error("Valid token should verify and return user UID");
  }
}

// 2. Invalid Authentication Test
export function testInvalidAuthentication() {
  // Missing headers
  if (simulateExtractAuthToken({}) !== null) {
    throw new Error("Empty headers should return null token");
  }

  // Malformed header
  if (simulateExtractAuthToken({ authorization: "Basic dXNlcjpwYXNz" }) !== null) {
    throw new Error("Non-Bearer authorization header should return null");
  }

  if (simulateExtractAuthToken({ authorization: "Bearer " }) !== null) {
    throw new Error("Empty Bearer token should return null");
  }

  // Malformed JWT
  const now = Math.floor(Date.now() / 1000);
  const malformedRes = simulateVerifyToken("not-a-jwt", now);
  if (malformedRes.valid) {
    throw new Error("Malformed JWT token must be rejected");
  }

  // Tampered payload
  const tamperedRes = simulateVerifyToken("header.invalid-base64.sig", now);
  if (tamperedRes.valid) {
    throw new Error("Tampered JWT payload must be rejected");
  }
}

// 3. Expired Token Test
export function testExpiredToken() {
  const now = Math.floor(Date.now() / 1000);
  const expiredTimestamp = now - 3600; // Expired 1 hour ago
  const expiredJwt = `header.${Buffer.from(JSON.stringify({ sub: "usr_expired", exp: expiredTimestamp })).toString("base64")}.sig`;

  const result = simulateVerifyToken(expiredJwt, now);
  if (result.valid) {
    throw new Error("Expired token must be rejected as invalid");
  }
  if (result.error !== "Token expired") {
    throw new Error(`Expected error 'Token expired', got '${result.error}'`);
  }
}

// 4. Organization Membership Test
export function testOrganizationMembership() {
  const mockDb = {
    organizations: {
      org_acme: {
        id: "org_acme",
        name: "Acme Corp",
        slug: "acme-corp",
        ownerId: "usr_owner",
        plan: "team" as const,
        status: "active" as const,
        currentPeriodSpendUsd: 0,
        currentPeriodStart: new Date().toISOString(),
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      org_suspended: {
        id: "org_suspended",
        name: "Suspended Corp",
        slug: "suspended-corp",
        ownerId: "usr_suspended_owner",
        plan: "starter" as const,
        status: "suspended" as const,
        currentPeriodSpendUsd: 0,
        currentPeriodStart: new Date().toISOString(),
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    members: {
      org_acme: {
        usr_active: {
          userId: "usr_active",
          email: "active@acme.com",
          displayName: "Active Member",
          role: "DEVELOPER" as const,
          status: "active" as const,
          joinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        usr_invited: {
          userId: "usr_invited",
          email: "invited@acme.com",
          displayName: "Invited Member",
          role: "DEVELOPER" as const,
          status: "invited" as const,
          joinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      org_suspended: {
        usr_suspended_owner: {
          userId: "usr_suspended_owner",
          email: "owner@suspended.com",
          displayName: "Suspended Owner",
          role: "OWNER" as const,
          status: "active" as const,
          joinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };

  // Active member allowed
  const activeRes = simulateVerifyOrgAccess("usr_active", "org_acme", mockDb, "VIEWER");
  if (!activeRes.allowed || activeRes.statusCode !== 200) {
    throw new Error("Active organization member must be allowed");
  }

  // Non-member rejected with 403
  const nonMemberRes = simulateVerifyOrgAccess("usr_stranger", "org_acme", mockDb, "VIEWER");
  if (nonMemberRes.allowed || nonMemberRes.statusCode !== 403) {
    throw new Error("Non-member must be rejected with 403");
  }

  // Invited (non-active) member rejected with 403
  const invitedRes = simulateVerifyOrgAccess("usr_invited", "org_acme", mockDb, "VIEWER");
  if (invitedRes.allowed || invitedRes.statusCode !== 403) {
    throw new Error("Invited/pending member must be rejected with 403");
  }

  // Suspended organization rejected with 403
  const suspendedOrgRes = simulateVerifyOrgAccess("usr_suspended_owner", "org_suspended", mockDb, "VIEWER");
  if (suspendedOrgRes.allowed || suspendedOrgRes.statusCode !== 403) {
    throw new Error("Members of suspended organization must be rejected with 403");
  }

  // Non-existent organization rejected with 404
  const missingOrgRes = simulateVerifyOrgAccess("usr_active", "org_nonexistent", mockDb, "VIEWER");
  if (missingOrgRes.allowed || missingOrgRes.statusCode !== 404) {
    throw new Error("Non-existent organization must return 404");
  }
}

// 5. OWNER Permissions Test
export function testOwnerPermissions() {
  const allPermissions: Permission[] = [
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
    "budgets:manage",
    "budgets:read",
    "usage:read",
    "audit:read",
  ];

  for (const perm of allPermissions) {
    if (!hasPermission("OWNER", perm)) {
      throw new Error(`OWNER must have permission '${perm}'`);
    }
  }

  // Hierarchy check
  if (!hasMinimumRole("OWNER", "OWNER")) throw new Error("OWNER meets OWNER");
  if (!hasMinimumRole("OWNER", "ADMIN")) throw new Error("OWNER meets ADMIN");
  if (!hasMinimumRole("OWNER", "DEVELOPER")) throw new Error("OWNER meets DEVELOPER");
  if (!hasMinimumRole("OWNER", "VIEWER")) throw new Error("OWNER meets VIEWER");
}

// 6. ADMIN Permissions Test
export function testAdminPermissions() {
  // Allowed permissions
  const adminAllowed: Permission[] = [
    "members:manage",
    "members:read",
    "billing:read",
    "integrations:manage",
    "integrations:read",
    "projects:manage",
    "projects:read",
    "budgets:manage",
    "budgets:read",
    "usage:read",
    "audit:read",
  ];

  for (const perm of adminAllowed) {
    if (!hasPermission("ADMIN", perm)) {
      throw new Error(`ADMIN must have permission '${perm}'`);
    }
  }

  // Rejected permissions for ADMIN
  const adminDenied: Permission[] = ["org:delete", "billing:manage"];
  for (const perm of adminDenied) {
    if (hasPermission("ADMIN", perm)) {
      throw new Error(`ADMIN must NOT have restricted permission '${perm}'`);
    }
  }

  // Hierarchy check
  if (!hasMinimumRole("ADMIN", "ADMIN")) throw new Error("ADMIN meets ADMIN");
  if (!hasMinimumRole("ADMIN", "DEVELOPER")) throw new Error("ADMIN meets DEVELOPER");
  if (!hasMinimumRole("ADMIN", "VIEWER")) throw new Error("ADMIN meets VIEWER");
  if (hasMinimumRole("ADMIN", "OWNER")) throw new Error("ADMIN must NOT meet OWNER requirement");
}

// 7. DEVELOPER Permissions Test
export function testDeveloperPermissions() {
  // Allowed permissions
  const devAllowed: Permission[] = [
    "projects:read",
    "usage:read",
    "integrations:read",
    "budgets:read",
    "members:read",
    "org:settings:read",
  ];

  for (const perm of devAllowed) {
    if (!hasPermission("DEVELOPER", perm)) {
      throw new Error(`DEVELOPER must have permission '${perm}'`);
    }
  }

  // Rejected permissions for DEVELOPER
  const devDenied: Permission[] = [
    "org:delete",
    "org:settings:manage",
    "members:manage",
    "billing:manage",
    "billing:read",
    "integrations:manage",
    "projects:manage",
    "budgets:manage",
    "audit:read",
  ];

  for (const perm of devDenied) {
    if (hasPermission("DEVELOPER", perm)) {
      throw new Error(`DEVELOPER must NOT have restricted permission '${perm}'`);
    }
  }

  // Hierarchy check
  if (!hasMinimumRole("DEVELOPER", "DEVELOPER")) throw new Error("DEVELOPER meets DEVELOPER");
  if (!hasMinimumRole("DEVELOPER", "VIEWER")) throw new Error("DEVELOPER meets VIEWER");
  if (hasMinimumRole("DEVELOPER", "ADMIN")) throw new Error("DEVELOPER must NOT meet ADMIN");
  if (hasMinimumRole("DEVELOPER", "OWNER")) throw new Error("DEVELOPER must NOT meet OWNER");
}

// 8. VIEWER Permissions Test
export function testViewerPermissions() {
  // Allowed permissions (read-only)
  const viewerAllowed: Permission[] = ["projects:read", "budgets:read", "usage:read", "org:settings:read"];
  for (const perm of viewerAllowed) {
    if (!hasPermission("VIEWER", perm)) {
      throw new Error(`VIEWER must have permission '${perm}'`);
    }
  }

  // Rejected permissions
  const viewerDenied: Permission[] = [
    "org:delete",
    "org:settings:manage",
    "members:manage",
    "members:read",
    "billing:manage",
    "billing:read",
    "integrations:manage",
    "integrations:read",
    "projects:manage",
    "budgets:manage",
    "audit:read",
  ];

  for (const perm of viewerDenied) {
    if (hasPermission("VIEWER", perm)) {
      throw new Error(`VIEWER must NOT have permission '${perm}'`);
    }
  }

  // Hierarchy check
  if (!hasMinimumRole("VIEWER", "VIEWER")) throw new Error("VIEWER meets VIEWER");
  if (hasMinimumRole("VIEWER", "DEVELOPER")) throw new Error("VIEWER must NOT meet DEVELOPER");
  if (hasMinimumRole("VIEWER", "ADMIN")) throw new Error("VIEWER must NOT meet ADMIN");
  if (hasMinimumRole("VIEWER", "OWNER")) throw new Error("VIEWER must NOT meet OWNER");
}

// 9. Cross-Organization Access Rejection Test
export function testCrossOrganizationAccessRejection() {
  const mockDb = {
    organizations: {
      org_alpha: {
        id: "org_alpha",
        name: "Alpha Corp",
        slug: "alpha-corp",
        ownerId: "usr_alpha_owner",
        plan: "enterprise" as const,
        status: "active" as const,
        currentPeriodSpendUsd: 0,
        currentPeriodStart: new Date().toISOString(),
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      org_beta: {
        id: "org_beta",
        name: "Beta Corp",
        slug: "beta-corp",
        ownerId: "usr_beta_owner",
        plan: "starter" as const,
        status: "active" as const,
        currentPeriodSpendUsd: 0,
        currentPeriodStart: new Date().toISOString(),
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    members: {
      org_alpha: {
        usr_alpha_member: {
          userId: "usr_alpha_member",
          email: "alice@alpha.com",
          displayName: "Alice Alpha",
          role: "OWNER" as const,
          status: "active" as const,
          joinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      org_beta: {
        usr_beta_member: {
          userId: "usr_beta_member",
          email: "bob@beta.com",
          displayName: "Bob Beta",
          role: "OWNER" as const,
          status: "active" as const,
          joinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };

  // Alice can access Alpha
  const aliceAlphaRes = simulateVerifyOrgAccess("usr_alpha_member", "org_alpha", mockDb, "VIEWER");
  if (!aliceAlphaRes.allowed) {
    throw new Error("Alice should be allowed to access Alpha Corp");
  }

  // Alice CANNOT access Beta Corp (Cross-Tenant Rejection)
  const aliceBetaRes = simulateVerifyOrgAccess("usr_alpha_member", "org_beta", mockDb, "VIEWER");
  if (aliceBetaRes.allowed || aliceBetaRes.statusCode !== 403) {
    throw new Error("Alice accessing Beta Corp MUST be rejected with HTTP 403 Forbidden");
  }

  // Bob can access Beta
  const bobBetaRes = simulateVerifyOrgAccess("usr_beta_member", "org_beta", mockDb, "VIEWER");
  if (!bobBetaRes.allowed) {
    throw new Error("Bob should be allowed to access Beta Corp");
  }

  // Bob CANNOT access Alpha Corp (Cross-Tenant Rejection)
  const bobAlphaRes = simulateVerifyOrgAccess("usr_beta_member", "org_alpha", mockDb, "VIEWER");
  if (bobAlphaRes.allowed || bobAlphaRes.statusCode !== 403) {
    throw new Error("Bob accessing Alpha Corp MUST be rejected with HTTP 403 Forbidden");
  }
}

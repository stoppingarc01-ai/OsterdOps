/**
 * OsterdOps — Session & Authentication Security Hardening (Phase 15)
 * Secure cookie configurations, token expiration validation, and privileged action safeguards.
 */

import type { OrganizationRole } from "@/types";

export interface SecureCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge?: number;
}

export function getSecureCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7): SecureCookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function isSessionExpired(authTimeSeconds: number, maxSessionAgeMinutes = 60 * 24): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxAgeSeconds = maxSessionAgeMinutes * 60;
  return nowSeconds - authTimeSeconds > maxAgeSeconds;
}

export function isPrivilegedRole(role: OrganizationRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canPerformPrivilegedAction(
  role: OrganizationRole,
  _action: "security:manage" | "security:delete" | "billing:manage"
): boolean {
  if (role === "OWNER" || role === "ADMIN") {
    return true;
  }
  return false;
}

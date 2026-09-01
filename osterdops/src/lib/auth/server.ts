/**
 * OsterdOps — Server Authentication & Token Verification
 * STRICTLY SERVER-SIDE: Uses Firebase Admin Auth to verify ID tokens and sessions.
 */

import "server-only";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ApiErrors } from "@/lib/api/response";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { NextResponse } from "next/server";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  token: DecodedIdToken;
}

export type AuthResult =
  | { user: AuthenticatedUser; errorResponse?: never }
  | { user?: never; errorResponse: NextResponse };

/**
 * Extracts a bearer token or session cookie from an incoming Next.js Request.
 */
export function extractAuthToken(request: Request): string | null {
  // 1. Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Cookie header (__session cookie standard in Firebase hosting)
  const cookieHeader = request.headers.get("cookie");
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

/**
 * Verifies a Firebase ID token and returns the decoded token.
 */
export async function verifyUserToken(idToken: string): Promise<DecodedIdToken | null> {
  try {
    const adminAuth = getAdminAuth();
    return await adminAuth.verifyIdToken(idToken, true);
  } catch (err) {
    console.error("[OsterdOps Auth] Token verification failed:", (err as Error).message);
    return null;
  }
}

/**
 * Resolves the authenticated user from a Request without generating HTTP error responses.
 * Useful for optional authentication contexts and internal middleware.
 */
export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  const token = extractAuthToken(request);
  if (!token) return null;

  const decoded = await verifyUserToken(token);
  if (!decoded) return null;

  return {
    uid: decoded.uid,
    email: decoded.email || "",
    displayName: decoded.name || decoded.email?.split("@")[0] || "User",
    photoURL: decoded.picture,
    token: decoded,
  };
}

/**
 * Server-side guard: Ensures the request is authenticated with a valid Firebase ID token.
 * Returns either the AuthenticatedUser context or a 401 Unauthorized response.
 */
export async function requireAuth(request: Request): Promise<AuthResult> {
  const token = extractAuthToken(request);
  if (!token) {
    return {
      errorResponse: ApiErrors.unauthorized("Authentication required. Missing Bearer token or session cookie."),
    };
  }

  const decoded = await verifyUserToken(token);
  if (!decoded) {
    return {
      errorResponse: ApiErrors.unauthorized("Invalid or expired authentication token."),
    };
  }

  const user: AuthenticatedUser = {
    uid: decoded.uid,
    email: decoded.email || "",
    displayName: decoded.name || decoded.email?.split("@")[0] || "User",
    photoURL: decoded.picture,
    token: decoded,
  };

  return { user };
}

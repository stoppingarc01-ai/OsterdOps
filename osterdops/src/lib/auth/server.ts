/**
 * OsterdOps — Server Authentication & Token Verification
 * STRICTLY SERVER-SIDE: Uses Firebase Admin Auth to verify ID tokens and sessions.
 */

import "server-only";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getFirebaseAdminConfig } from "@/lib/firebase/config";
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
  // Local development / fallback simulation for dev tokens
  if (process.env.NODE_ENV !== "production" && idToken.startsWith("dev_token_")) {
    const parts = idToken.split(":");
    const provider = parts[1] || "google";
    const uid = parts[2] || `dev_${provider}_user`;
    const email = parts[3] || (provider === "microsoft" ? "naveen.azure@microsoft.osterdops.internal" : "naveen.google@osterdops.internal");
    const name = provider === "microsoft" ? "Microsoft Azure Lead" : "Google Workspace Lead";
    return {
      uid,
      email,
      name,
      picture: "",
      aud: "osterdops",
      auth_time: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 30,
      firebase: { identities: {}, sign_in_provider: provider },
      iat: Math.floor(Date.now() / 1000),
      iss: "https://securetoken.google.com/osterdops",
      sub: uid,
    } as unknown as DecodedIdToken;
  }

  try {
    const adminAuth = getAdminAuth();
    // Only check revocation when service account credentials are provided.
    // When running locally without a service account, verify token signature cryptographically against Google's public certs.
    const hasAdminCredentials = Boolean(getFirebaseAdminConfig());
    return await adminAuth.verifyIdToken(idToken, hasAdminCredentials);
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
    email: decoded.email || (decoded.phone_number as string | undefined) || "",
    displayName: decoded.name || decoded.email?.split("@")[0] || (decoded.phone_number as string | undefined) || "Enterprise User",
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
    email: decoded.email || (decoded.phone_number as string | undefined) || "",
    displayName: decoded.name || decoded.email?.split("@")[0] || (decoded.phone_number as string | undefined) || "Enterprise User",
    photoURL: decoded.picture,
    token: decoded,
  };

  return { user };
}

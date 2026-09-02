/**
 * OsterdOps — Cryptographic API Key Utilities
 * Handles secure token generation, one-way SHA-256 hashing, masking, and timing-safe comparisons.
 */

import crypto from "crypto";
import type { ApiKeyEnvironment } from "@/types";

export interface GeneratedKeySecret {
  secret: string;     // e.g. "ost_live_4a8f9c1e..."
  keyPrefix: string;  // e.g. "ost_live_••••••••••••94f2"
  keyHash: string;    // SHA-256 hex digest
}

/**
 * Generates a cryptographically secure OsterdOps API key.
 * Format: `ost_<env>_<48_random_hex_chars>` (192 bits of cryptographic entropy)
 */
export function generateApiKeySecret(
  environment: ApiKeyEnvironment = "production"
): GeneratedKeySecret {
  const envPrefix = environment === "production" ? "live" : environment === "staging" ? "stg" : "test";
  const randomBytes = crypto.randomBytes(24).toString("hex"); // 48 chars of high entropy
  const secret = `ost_${envPrefix}_${randomBytes}`;

  const keyHash = hashApiKey(secret);

  const suffix = randomBytes.slice(-4);
  const keyPrefix = `ost_${envPrefix}_••••••••••••${suffix}`;

  return {
    secret,
    keyPrefix,
    keyHash,
  };
}

/**
 * Computes the SHA-256 hash of a raw API key secret.
 */
export function hashApiKey(secret: string): string {
  return crypto.createHash("sha256").update(secret.trim()).digest("hex");
}

/**
 * Validates the basic structural format of an OsterdOps API key secret.
 * Supports both `ost_` and `osk_` prefixes.
 */
export function isValidApiKeyFormat(secret: string): boolean {
  if (!secret || typeof secret !== "string") return false;
  return /^(ost|osk|ors)_(live|stg|test)_[a-f0-9]{32,64}$/.test(secret.trim());
}

export const validateApiKeyFormat = isValidApiKeyFormat;

/**
 * Compares two SHA-256 hashes in constant time to prevent timing attacks.
 */
export function timingSafeHashMatch(hashA: string, hashB: string): boolean {
  if (!hashA || !hashB || hashA.length !== hashB.length) {
    return false;
  }
  const bufA = Buffer.from(hashA, "utf-8");
  const bufB = Buffer.from(hashB, "utf-8");
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Safely masks a raw API key secret, displaying only the prefix and the final 4 characters.
 */
export function maskApiKey(secret: string): string {
  if (!secret || typeof secret !== "string") return "";
  const parts = secret.split("_");
  if (parts.length >= 3) {
    const prefix = `${parts[0]}_${parts[1]}_`;
    const suffix = secret.slice(-4);
    return `${prefix}••••••••••••${suffix}`;
  }
  return `••••••••${secret.slice(-4)}`;
}

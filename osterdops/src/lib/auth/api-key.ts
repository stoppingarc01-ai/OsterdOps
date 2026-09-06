/**
 * OsterdOps — Cryptographic API Key Utilities
 * Handles secure token generation, one-way SHA-256 hashing, masking, and timing-safe comparisons.
 */

import crypto from "crypto";
import type { ApiKeyEnvironment } from "@/types";

export interface GeneratedKeySecret {
  secret: string;     // e.g. "ost_live_4a8f9c1e..."
  rawKey: string;     // Full unmasked plaintext key
  keyPrefix: string;  // e.g. "ost_live_••••••••••••94f2"
  displayPrefix: string; // e.g. "ost_live_4a8f..."
  prefix: string;     // alias for displayPrefix
  keyHash: string;    // SHA-256 hex digest
}

/**
 * Generates a cryptographically secure, collision-proof OsterdOps API key.
 * Format: `ost_<env>_<64_hex_chars>` (32 bytes / 256 bits of native cryptographic entropy)
 */
export function generateApiKeySecret(
  environment: ApiKeyEnvironment = "production"
): GeneratedKeySecret {
  const envPrefix = environment === "production" ? "live" : environment === "staging" ? "stg" : "test";
  const hexEntropy = crypto.randomBytes(32).toString("hex"); // 32 bytes = 256 bits of astronomical entropy
  const rawKey = `ost_${envPrefix}_${hexEntropy}`;

  const keyHash = hashApiKey(rawKey);

  const displayPrefix = rawKey.slice(0, 13) + "...";
  const suffix = hexEntropy.slice(-4);
  const keyPrefix = `ost_${envPrefix}_••••••••••••${suffix}`;

  return {
    secret: rawKey,
    rawKey,
    keyPrefix,
    displayPrefix,
    prefix: displayPrefix,
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

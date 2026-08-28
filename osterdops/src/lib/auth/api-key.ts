/**
 * OsterdOps — Cryptographic API Key Utilities
 * Handles secure token generation, one-way SHA-256 hashing, masking, and timing-safe comparisons.
 */

import crypto from "crypto";
import type { ApiKeyEnvironment } from "@/types";

export interface GeneratedKeySecret {
  secret: string;     // e.g. "osk_live_4a8f9c1e..."
  keyPrefix: string;  // e.g. "osk_live_••••••••••••94f2"
  keyHash: string;    // SHA-256 hex digest
}

/**
 * Generates a cryptographically secure OsterdOps API key.
 * Format: `osk_<env>_<32_random_bytes_hex>`
 */
export function generateApiKeySecret(
  environment: ApiKeyEnvironment = "production"
): GeneratedKeySecret {
  const envPrefix = environment === "production" ? "live" : environment === "staging" ? "stg" : "test";
  const randomBytes = crypto.randomBytes(24).toString("hex"); // 48 chars of high entropy
  const secret = `osk_${envPrefix}_${randomBytes}`;

  const keyHash = hashApiKey(secret);

  const suffix = randomBytes.slice(-4);
  const keyPrefix = `osk_${envPrefix}_••••••••••••${suffix}`;

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
 */
export function isValidApiKeyFormat(secret: string): boolean {
  if (!secret || typeof secret !== "string") return false;
  return /^osk_(live|stg|test)_[a-f0-9]{48}$/.test(secret.trim());
}

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

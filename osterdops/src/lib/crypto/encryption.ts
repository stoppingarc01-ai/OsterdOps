/**
 * OsterdOps — AES-256-GCM Secret Encryption & Decryption
 * Protects upstream AI provider API keys stored in Firestore.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Resolves the 32-byte encryption key from environment variables.
 */
function getEncryptionKey(): Buffer {
  const raw = process.env.OSTERDOPS_ENCRYPTION_KEY || "";
  if (!raw) {
    // Deterministic fallback for dev / test environments if key is omitted
    return crypto.createHash("sha256").update("osterdops_default_development_secret_key").digest();
  }

  if (raw.length === 64) {
    return Buffer.from(raw, "hex");
  }
  return crypto.createHash("sha256").update(raw).digest();
}

export interface EncryptedPayload {
  ciphertext: string; // hex
  iv: string;         // hex
  tag: string;        // hex
}

/**
 * Encrypts a plaintext secret using AES-256-GCM.
 */
export function encryptSecret(plaintext: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let ciphertext = cipher.update(plaintext, "utf-8", "hex");
  ciphertext += cipher.final("hex");

  const tag = cipher.getAuthTag().toString("hex");

  return {
    ciphertext,
    iv: iv.toString("hex"),
    tag,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted payload.
 */
export function decryptSecret(payload: EncryptedPayload): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(payload.iv, "hex");
  const tag = Buffer.from(payload.tag, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(tag);

  let decrypted = decipher.update(payload.ciphertext, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

/**
 * Generates a masked string preview of a provider secret (e.g. `sk-proj-••••49a1`).
 */
export function maskProviderKey(key: string): string {
  if (!key || key.length < 8) return "••••••••";
  const prefix = key.slice(0, 7);
  const suffix = key.slice(-4);
  return `${prefix}••••${suffix}`;
}

/**
 * OsterdOps — Enterprise Idempotency Engine (Phase 18)
 * Request fingerprinting, tenant-scoped replay caching, and collision detection.
 */

import crypto from "crypto";
import { IdempotencyConflictError } from "./errors";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface IdempotencyRecord {
  key: string;
  organizationId: string;
  endpoint: string;
  requestHash: string;
  status: "PROCESSING" | "COMPLETED";
  statusCode?: number;
  responseBody?: unknown;
  createdAt: string;
  expiresAt: string;
}

// In-memory fallback cache for development, testing, or fallback
const inMemoryIdempotencyStore = new Map<string, IdempotencyRecord>();

/**
 * Extracts Idempotency-Key from Request headers.
 */
export function extractIdempotencyKey(headers: Headers | Record<string, string | null | undefined>): string | null {
  if (typeof (headers as Headers).get === "function") {
    const h = headers as Headers;
    const key = h.get("idempotency-key") || h.get("x-idempotency-key");
    return key?.trim() || null;
  }
  const obj = headers as Record<string, string | null | undefined>;
  const key = obj["idempotency-key"] || obj["Idempotency-Key"] || obj["x-idempotency-key"] || obj["X-Idempotency-Key"];
  return key?.trim() || null;
}

/**
 * Computes deterministic SHA-256 fingerprint for a request payload under tenant and endpoint scope.
 */
export function computeRequestFingerprint(
  organizationId: string,
  endpoint: string,
  body: unknown
): string {
  const normalizedBody = body ? (typeof body === "string" ? body : JSON.stringify(body)) : "";
  const payload = `${organizationId}:${endpoint}:${normalizedBody}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Checks idempotency state for an incoming request.
 * Returns { replayed: true, record } if a cached response exists,
 * or { replayed: false } if the operation should proceed.
 * Throws IdempotencyConflictError if key is reused with a different payload.
 */
export async function checkIdempotency(
  organizationId: string,
  endpoint: string,
  idempotencyKey: string,
  body: unknown,
  requestId?: string
): Promise<{ replayed: boolean; record?: IdempotencyRecord }> {
  const requestHash = computeRequestFingerprint(organizationId, endpoint, body);
  const compositeKey = `${organizationId}:${endpoint}:${idempotencyKey}`;

  // 1. Check in-memory store
  const memRecord = inMemoryIdempotencyStore.get(compositeKey);
  if (memRecord) {
    if (memRecord.requestHash !== requestHash) {
      throw new IdempotencyConflictError(
        `Idempotency-Key '${idempotencyKey}' was previously used with a different request payload.`,
        { requestId, details: { idempotencyKey, endpoint } }
      );
    }
    if (memRecord.status === "COMPLETED") {
      return { replayed: true, record: memRecord };
    }
    // Still processing
    return { replayed: false };
  }

  // 2. Check Firestore if configured
  if (process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT) {
    try {
      const db = getAdminFirestore();
      const docRef = db
        .collection("organizations")
        .doc(organizationId)
        .collection("idempotencyKeys")
        .doc(idempotencyKey);

      const snap = await docRef.get();
      if (snap.exists) {
        const data = snap.data() as IdempotencyRecord;
        if (data.requestHash !== requestHash) {
          throw new IdempotencyConflictError(
            `Idempotency-Key '${idempotencyKey}' was previously used with a different request payload.`,
            { requestId, details: { idempotencyKey, endpoint } }
          );
        }
        if (data.status === "COMPLETED") {
          return { replayed: true, record: data };
        }
      } else {
        // Mark as PROCESSING
        const now = new Date();
        const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        await docRef.set({
          key: idempotencyKey,
          organizationId,
          endpoint,
          requestHash,
          status: "PROCESSING",
          createdAt: FieldValue.serverTimestamp(),
          expiresAt: expires.toISOString(),
        });
      }
    } catch (err) {
      if (err instanceof IdempotencyConflictError) throw err;
      // Fallback silently if firestore is unavailable
    }
  }

  // Mark in-memory as processing
  const now = new Date();
  inMemoryIdempotencyStore.set(compositeKey, {
    key: idempotencyKey,
    organizationId,
    endpoint,
    requestHash,
    status: "PROCESSING",
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  });

  return { replayed: false };
}

/**
 * Saves completed idempotency result.
 */
export async function saveIdempotencyResult(
  organizationId: string,
  endpoint: string,
  idempotencyKey: string,
  statusCode: number,
  responseBody: unknown
): Promise<void> {
  const compositeKey = `${organizationId}:${endpoint}:${idempotencyKey}`;
  const existing = inMemoryIdempotencyStore.get(compositeKey);
  const now = new Date();

  const completedRecord: IdempotencyRecord = {
    key: idempotencyKey,
    organizationId,
    endpoint,
    requestHash: existing?.requestHash || "",
    status: "COMPLETED",
    statusCode,
    responseBody,
    createdAt: existing?.createdAt || now.toISOString(),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  };

  inMemoryIdempotencyStore.set(compositeKey, completedRecord);

  if (process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT) {
    try {
      const db = getAdminFirestore();
      await db
        .collection("organizations")
        .doc(organizationId)
        .collection("idempotencyKeys")
        .doc(idempotencyKey)
        .set({
          ...completedRecord,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch {
      // Best effort persistence
    }
  }
}

/**
 * Clears in-memory idempotency cache (used for unit testing).
 */
export function clearIdempotencyCache(): void {
  inMemoryIdempotencyStore.clear();
}

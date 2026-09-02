/**
 * OsterdOps — User Service Layer
 * Manages Firestore non-sensitive user profile records with simulated fallback for local development.
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getFirebaseAdminConfig } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import type { User } from "@/types";

export interface SyncUserData {
  email: string;
  displayName?: string;
  photoURL?: string;
  defaultOrgId?: string;
}

// In-memory simulated storage for local development (persisted across HMR on globalThis)
const globalForUsers = globalThis as unknown as { simulatedUsers?: Map<string, User> };
const simulatedUsers = globalForUsers.simulatedUsers || new Map<string, User>();
if (process.env.NODE_ENV !== "production") {
  globalForUsers.simulatedUsers = simulatedUsers;
}

function syncSimulatedUser(uid: string, data: SyncUserData): User {
  const existing = simulatedUsers.get(uid);
  const now = new Date().toISOString();
  if (!existing) {
    const newUser: User = {
      id: uid,
      email: data.email,
      name: data.displayName || data.email.split("@")[0] || "User",
      avatarUrl: data.photoURL || "",
      role: "member",
      createdAt: now,
      updatedAt: now,
    };
    simulatedUsers.set(uid, newUser);
    return newUser;
  }

  const updated: User = {
    ...existing,
    name: data.displayName || existing.name,
    avatarUrl: data.photoURL !== undefined ? data.photoURL : existing.avatarUrl,
    updatedAt: now,
  };
  simulatedUsers.set(uid, updated);
  return updated;
}

/**
 * Creates or updates the non-sensitive Firestore user profile document.
 * Note: Never store passwords or raw secrets in Firestore.
 */
export async function syncUserRecord(
  uid: string,
  data: SyncUserData
): Promise<User> {
  const adminConfig = getFirebaseAdminConfig();
  if (!adminConfig) {
    return syncSimulatedUser(uid, data);
  }

  try {
    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(uid);
    const snap = await userRef.get();

    const now = FieldValue.serverTimestamp();

    if (!snap.exists) {
      const newUser = {
        id: uid,
        uid,
        email: data.email,
        displayName: data.displayName || data.email.split("@")[0] || "User",
        name: data.displayName || data.email.split("@")[0] || "User",
        photoURL: data.photoURL || "",
        avatarUrl: data.photoURL || "",
        defaultOrgId: data.defaultOrgId || "",
        role: "member" as const,
        createdAt: now,
        updatedAt: now,
      };
      await userRef.set(newUser);
      return {
        ...newUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const existing = snap.data();
    const updates: Record<string, unknown> = {
      updatedAt: now,
    };
    if (data.displayName && data.displayName !== existing?.displayName) {
      updates.displayName = data.displayName;
      updates.name = data.displayName;
    }
    if (data.photoURL && data.photoURL !== existing?.photoURL) {
      updates.photoURL = data.photoURL;
      updates.avatarUrl = data.photoURL;
    }
    if (data.defaultOrgId && data.defaultOrgId !== existing?.defaultOrgId) {
      updates.defaultOrgId = data.defaultOrgId;
    }

    await userRef.update(updates);

    return {
      id: uid,
      name: (updates.displayName as string) || existing?.displayName || existing?.name || "User",
      email: existing?.email || data.email,
      avatarUrl: (updates.photoURL as string) || existing?.photoURL || existing?.avatarUrl,
      role: existing?.role || "member",
      createdAt: existing?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("[OsterdOps User] Firestore unavailable, using simulated store:", (err as Error).message);
    return syncSimulatedUser(uid, data);
  }
}

export async function getUserById(uid: string): Promise<User | null> {
  const adminConfig = getFirebaseAdminConfig();
  if (!adminConfig) {
    return simulatedUsers.get(uid) || null;
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection("users").doc(uid).get();
    if (!snap.exists) return null;

    const data = snap.data();
    return {
      id: snap.id,
      name: data?.displayName || data?.name || "",
      email: data?.email || "",
      avatarUrl: data?.photoURL || data?.avatarUrl,
      role: data?.role || "member",
      createdAt: data?.createdAt?.toDate?.()?.toISOString() || "",
      updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || "",
    };
  } catch (err) {
    console.warn("[OsterdOps User] Firestore unavailable, using simulated store:", (err as Error).message);
    return simulatedUsers.get(uid) || null;
  }
}

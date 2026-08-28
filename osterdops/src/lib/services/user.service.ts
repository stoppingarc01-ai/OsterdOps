/**
 * OsterdOps — User Service Layer
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { User } from "@/types";

export async function syncUserRecord(
  uid: string,
  data: {
    email: string;
    displayName?: string;
    photoURL?: string;
  }
): Promise<User> {
  const db = getAdminFirestore();
  const userRef = db.collection("users").doc(uid);
  const snap = await userRef.get();

  const now = FieldValue.serverTimestamp();

  if (!snap.exists) {
    const newUser = {
      id: uid,
      email: data.email,
      name: data.displayName || data.email.split("@")[0] || "User",
      avatarUrl: data.photoURL || "",
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
  if (data.displayName && data.displayName !== existing?.name) {
    updates.name = data.displayName;
  }
  if (data.photoURL && data.photoURL !== existing?.avatarUrl) {
    updates.avatarUrl = data.photoURL;
  }

  await userRef.update(updates);

  return {
    id: uid,
    name: (updates.name as string) || existing?.name || "User",
    email: existing?.email || data.email,
    avatarUrl: (updates.avatarUrl as string) || existing?.avatarUrl,
    role: existing?.role || "member",
    createdAt: existing?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getUserById(uid: string): Promise<User | null> {
  const db = getAdminFirestore();
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) return null;

  const data = snap.data();
  return {
    id: snap.id,
    name: data?.name || "",
    email: data?.email || "",
    avatarUrl: data?.avatarUrl,
    role: data?.role || "member",
    createdAt: data?.createdAt?.toDate?.()?.toISOString() || "",
    updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || "",
  };
}

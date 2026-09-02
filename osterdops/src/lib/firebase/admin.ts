/**
 * OsterdOps — Server-Side Firebase Admin SDK Initialization
 * STRICTLY SERVER-SIDE: Used for authorization, gateway routing, and Firestore admin operations.
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getFirebaseAdminConfig, DEFAULT_FIREBASE_CONFIG } from "./config";

let adminAppInstance: App | undefined;
let adminAuthInstance: Auth | undefined;
let adminDbInstance: Firestore | undefined;

/**
 * Initializes or returns the singleton Firebase Admin App.
 */
export function getFirebaseAdminApp(): App {
  if (typeof window !== "undefined") {
    throw new Error("SECURITY VIOLATION: Firebase Admin SDK cannot be executed on the client.");
  }

  if (adminAppInstance) return adminAppInstance;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminAppInstance = existingApps[0];
    return adminAppInstance;
  }

  const config = getFirebaseAdminConfig();

  if (config) {
    adminAppInstance = initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      }),
      projectId: config.projectId,
    });
  } else {
    // Fallback for local development or when environment variables will be provided at runtime
    const fallbackProjectId =
      process.env.FIREBASE_ADMIN_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      DEFAULT_FIREBASE_CONFIG.projectId;

    adminAppInstance = initializeApp({
      projectId: fallbackProjectId,
    });
  }

  return adminAppInstance;
}

/**
 * Returns the Firebase Admin Auth instance for token verification and user lookup.
 */
export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    const app = getFirebaseAdminApp();
    adminAuthInstance = getAuth(app);
  }
  return adminAuthInstance;
}

import { inMemoryDb } from "./in-memory-firestore";

/**
 * Returns the Firebase Admin Firestore instance for multi-tenant data access.
 * Automatically delegates to the zero-latency in-memory store in local dev / offline mode
 * to eliminate 30-second Google Cloud metadata socket timeouts.
 */
export function getAdminFirestore(): Firestore {
  const config = getFirebaseAdminConfig();
  if (!config) {
    return inMemoryDb as unknown as Firestore;
  }

  if (!adminDbInstance) {
    const app = getFirebaseAdminApp();
    adminDbInstance = getFirestore(app);
  }
  return adminDbInstance;
}

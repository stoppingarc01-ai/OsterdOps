/**
 * OsterdOps — Server-Side Firebase Admin SDK Initialization
 * STRICTLY SERVER-SIDE: Used for authorization, gateway routing, and Firestore admin operations.
 */

import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getFirebaseAdminConfig } from "./config";

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
    // Fallback for local emulator or when environment variables will be provided at runtime
    adminAppInstance = initializeApp();
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

/**
 * Returns the Firebase Admin Firestore instance for multi-tenant data access.
 */
export function getAdminFirestore(): Firestore {
  if (!adminDbInstance) {
    const app = getFirebaseAdminApp();
    adminDbInstance = getFirestore(app);
  }
  return adminDbInstance;
}

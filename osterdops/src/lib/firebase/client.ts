/**
 * OsterdOps — Client-Side Firebase SDK Initialization
 * Used exclusively in browser components for Auth, Firestore & Analytics.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirebaseClientConfig } from "./config";

let clientApp: FirebaseApp | undefined;
let clientAuth: Auth | undefined;
let clientDb: Firestore | undefined;
let clientAnalytics: Analytics | undefined;

/**
 * Initializes or returns the singleton client-side Firebase App.
 */
export function getFirebaseClientApp(): FirebaseApp {
  if (clientApp) return clientApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    clientApp = existingApps[0];
    return clientApp;
  }

  const config = getFirebaseClientConfig();
  clientApp = initializeApp(config);
  return clientApp;
}

/**
 * Returns the client-side Firebase Auth instance.
 */
export function getFirebaseAuth(): Auth {
  if (!clientAuth) {
    const app = getFirebaseClientApp();
    clientAuth = getAuth(app);
  }
  return clientAuth;
}

/**
 * Returns the client-side Firestore instance.
 */
export function getFirebaseFirestore(): Firestore {
  if (!clientDb) {
    const app = getFirebaseClientApp();
    clientDb = getFirestore(app);
  }
  return clientDb;
}

/**
 * Initializes and returns Firebase Analytics if supported in the current environment (browser-only).
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (clientAnalytics) return clientAnalytics;

  try {
    const supported = await isSupported();
    if (supported) {
      const app = getFirebaseClientApp();
      clientAnalytics = getAnalytics(app);
      return clientAnalytics;
    }
  } catch (err) {
    console.warn("[OsterdOps Analytics] Firebase Analytics initialization note:", err);
  }
  return null;
}

// Convenient singletons for direct import
export const app = typeof window !== "undefined" ? getFirebaseClientApp() : undefined;

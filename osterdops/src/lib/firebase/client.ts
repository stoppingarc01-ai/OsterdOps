/**
 * OsterdOps — Client-Side Firebase SDK Initialization
 * Used exclusively in browser components for Auth & Client Firestore.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseClientConfig } from "./config";

let clientApp: FirebaseApp | undefined;
let clientAuth: Auth | undefined;
let clientDb: Firestore | undefined;

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

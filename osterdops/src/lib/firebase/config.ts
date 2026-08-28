/**
 * OsterdOps — Firebase Configuration & Environment Verification
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * Default fallback Firebase configuration provided for OsterdOps.
 */
export const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: "AIzaSyAZMDMsBZC5IltAVVnFdcdyyYQ-1TOdvSw",
  authDomain: "osterdops.firebaseapp.com",
  projectId: "osterdops",
  storageBucket: "osterdops.firebasestorage.app",
  messagingSenderId: "105623223533",
  appId: "1:105623223533:web:16b1ef8f75256b71f120e4",
  measurementId: "G-8X7W89BGCZ",
};

/**
 * Returns and validates the client-side Firebase configuration.
 * Safe to be bundled into the browser via NEXT_PUBLIC_* variables.
 */
export function getFirebaseClientConfig(): FirebaseClientConfig {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };
}

/**
 * Returns and validates server-side Firebase Admin credentials.
 * NEVER call this on the client.
 */
export function getFirebaseAdminConfig(): FirebaseAdminConfig | null {
  if (typeof window !== "undefined") {
    throw new Error("SECURITY VIOLATION: Attempted to load Firebase Admin credentials on the client.");
  }

  // Check for single JSON / Service Account string first
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      const parsed = JSON.parse(serviceAccountKey);
      return {
        projectId: parsed.project_id || parsed.projectId || "",
        clientEmail: parsed.client_email || parsed.clientEmail || "",
        privateKey: (parsed.private_key || parsed.privateKey || "").replace(/\\n/g, "\n"),
      };
    } catch {
      console.error("[OsterdOps Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON string.");
    }
  }

  // Otherwise, use individual env vars
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "";
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
  const privateKey = rawKey.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

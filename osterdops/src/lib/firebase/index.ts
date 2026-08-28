/**
 * OsterdOps — Firebase Modules Entrypoint
 */

export * from "./config";
export * from "./client";
export * from "./firestore-client";
// Note: admin and server-only firestore are imported explicitly from '@/lib/firebase/admin' and '@/lib/firebase/firestore' in server contexts to preserve bundler separation.

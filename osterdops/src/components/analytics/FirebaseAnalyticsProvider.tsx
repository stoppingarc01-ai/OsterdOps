"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase/client";

/**
 * Initializes Firebase Analytics in the browser environment on mount.
 */
export function FirebaseAnalyticsProvider() {
  useEffect(() => {
    getFirebaseAnalytics().catch((err) => {
      console.warn("[OsterdOps Analytics] Failed to initialize:", err);
    });
  }, []);

  return null;
}

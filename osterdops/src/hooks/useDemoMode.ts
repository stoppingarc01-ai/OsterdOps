"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function checkIsDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    new URLSearchParams(window.location.search).get("demo") === "true" ||
    sessionStorage.getItem("osterdops_demo_mode") === "true" ||
    document.cookie.includes("osterdops_demo_mode=true")
  );
}

export function useDemoMode() {
  const router = useRouter();
  const { user, loginWithDevProvider } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => checkIsDemoMode());
  const [isActivating, setIsActivating] = useState<boolean>(false);

  // Sync state from URL, sessionStorage, and cookie
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlDemo = urlParams.get("demo") === "true";
    const sessionDemo = sessionStorage.getItem("osterdops_demo_mode") === "true";
    const cookieDemo = document.cookie.split("; ").some((c) => c.startsWith("osterdops_demo_mode=true"));

    const active = urlDemo || sessionDemo || cookieDemo;
    setIsDemoMode(active);

    // If active via URL, persist to storage & cookie
    if (urlDemo) {
      sessionStorage.setItem("osterdops_demo_mode", "true");
      document.cookie = "osterdops_demo_mode=true; path=/; max-age=86400; SameSite=Lax";
    }

    // If demo mode is active but visitor is not signed in, auto-initialize sandboxed demo user
    if (active && !user && !isActivating) {
      setIsActivating(true);
      loginWithDevProvider("google", "Demo Lead (Sandbox)", "demo@osterdops.internal")
        .catch((err) => {
          console.warn("[OsterdOps DemoMode] Auto-sandbox init note:", err);
        })
        .finally(() => {
          setIsActivating(false);
        });
    }
  }, [user, loginWithDevProvider, isActivating]);

  const enterDemoMode = useCallback(async () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("osterdops_demo_mode", "true");
      document.cookie = "osterdops_demo_mode=true; path=/; max-age=86400; SameSite=Lax";
    }
    setIsDemoMode(true);

    try {
      if (!user) {
        await loginWithDevProvider("google", "Demo Lead (Sandbox)", "demo@osterdops.internal");
      }
    } catch (err) {
      console.warn("[OsterdOps DemoMode] Sandbox login note:", err);
    }

    router.push("/dashboard?demo=true");
  }, [user, loginWithDevProvider, router]);

  const exitDemoMode = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("osterdops_demo_mode");
      document.cookie = "osterdops_demo_mode=; path=/; max-age=0; SameSite=Lax";
    }
    setIsDemoMode(false);
    router.push("/sign-in");
  }, [router]);

  return {
    isDemoMode,
    isActivating,
    enterDemoMode,
    exitDemoMode,
  };
}

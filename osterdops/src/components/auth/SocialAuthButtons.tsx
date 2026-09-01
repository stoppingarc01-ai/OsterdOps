"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function SocialAuthButtons() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch {
      // Handled in context
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2.5 w-full">
      {/* Google */}
      <button
        type="button"
        disabled={googleLoading}
        onClick={handleGoogleAuth}
        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#ffffff] hover:bg-[#faf7f0] border border-[#e5e0d4] hover:border-[#cfc9bc] rounded-xl text-[12.5px] font-semibold text-[#2c303b] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>{googleLoading ? "..." : "Google"}</span>
      </button>

      {/* Microsoft */}
      <button
        type="button"
        onClick={() => {}}
        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#ffffff] hover:bg-[#faf7f0] border border-[#e5e0d4] hover:border-[#cfc9bc] rounded-xl text-[12.5px] font-semibold text-[#2c303b] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-sm transition-all duration-150 cursor-pointer"
      >
        <svg viewBox="0 0 23 23" className="h-3.5 w-3.5 shrink-0">
          <rect x="1" y="1" width="10" height="10" fill="#F25022" />
          <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
          <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
          <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
        </svg>
        <span>Microsoft</span>
      </button>

      {/* Slack */}
      <button
        type="button"
        onClick={() => {}}
        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#ffffff] hover:bg-[#faf7f0] border border-[#e5e0d4] hover:border-[#cfc9bc] rounded-xl text-[12.5px] font-semibold text-[#2c303b] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-sm transition-all duration-150 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
          <path
            d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
            fill="#E01E5A"
          />
          <path
            d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
            fill="#36C5F0"
          />
          <path
            d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
            fill="#2EB67D"
          />
          <path
            d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
            fill="#ECB22E"
          />
        </svg>
        <span>Slack</span>
      </button>
    </div>
  );
}

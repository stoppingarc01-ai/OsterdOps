"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RotateCw, Home, Terminal, Sparkles } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to local telemetry audit pipeline
    console.error("[OsterdOps Global Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none selection:bg-[#DFB277] selection:text-[#080808]">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#DFB277]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 text-center space-y-6">
        {/* OsterdOps Dragon Crest Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-[#0E0E0E] border border-[#262626] shadow-[0_0_30px_rgba(223,178,119,0.15)] flex items-center justify-center relative group">
            <svg
              className="w-10 h-10 text-[#DFB277] transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#EF4444]" />
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-mono">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Resilient Guard Intercept</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Telemetry Connection Interrupted
          </h2>

          <p className="text-sm text-neutral-400 leading-relaxed">
            The OsterdOps Sentinel boundary isolated an unexpected telemetry pipeline exception. Existing financial ledgers and token guards remain protected.
          </p>

          {error?.digest && (
            <div className="mt-2 inline-block px-2.5 py-1 rounded bg-[#141414] border border-[#222222] text-[11px] font-mono text-neutral-500">
              Digest: {error.digest}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-semibold text-sm transition-all duration-200 shadow-[0_2px_14px_rgba(223,178,119,0.3)] hover:shadow-[0_4px_20px_rgba(223,178,119,0.45)] cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>Retry Telemetry Handshake</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E0E0E] border border-[#222222] hover:border-[#333333] text-neutral-300 hover:text-white font-medium text-sm transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Safe Dashboard</span>
          </Link>
        </div>

        {/* Footer Audit Code */}
        <div className="text-[11px] font-mono text-neutral-600 flex items-center justify-center gap-2">
          <span>OST-SENTINEL-100</span>
          <span>•</span>
          <span>Zero Prompt Storage</span>
          <span>•</span>
          <span>AES-256</span>
        </div>
      </div>
    </div>
  );
}

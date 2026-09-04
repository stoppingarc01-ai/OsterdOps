"use client";

import React, { useEffect } from "react";
import { ShieldAlert, RotateCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Forward critical root exception to security and telemetry pipeline
    console.error("[OsterdOps Global Critical Error]:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080808] text-neutral-200 antialiased font-sans selection:bg-[#DFB277] selection:text-[#080808] m-0 p-0">
        <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#DFB277]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-md w-full relative z-10 text-center space-y-6">
            {/* Orsted Dragon Crest */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-[#0E0E0E] border border-[#262626] shadow-[0_0_35px_rgba(223,178,119,0.18)] flex items-center justify-center relative group">
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

            {/* Error Message */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-mono">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Critical Engine Intercept</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                System Boundary Fault
              </h1>

              <p className="text-sm text-neutral-400 leading-relaxed">
                An unexpected boundary fault occurred at the application root. Pre-flight telemetry and cryptographic proxies have been safely isolated.
              </p>

              {error?.digest && (
                <div className="mt-2 inline-block px-2.5 py-1 rounded bg-[#141414] border border-[#222222] text-[11px] font-mono text-neutral-500">
                  Digest: {error.digest}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-semibold text-sm transition-all duration-200 shadow-[0_2px_14px_rgba(223,178,119,0.3)] hover:shadow-[0_4px_20px_rgba(223,178,119,0.45)] cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Retry Telemetry Handshake</span>
              </button>
            </div>

            {/* Security Stamp */}
            <div className="text-[11px] font-mono text-neutral-600 flex items-center justify-center gap-2 pt-4">
              <span>OST-CRITICAL-500</span>
              <span>•</span>
              <span>Sub-Millisecond Sentinel</span>
              <span>•</span>
              <span>Protected</span>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

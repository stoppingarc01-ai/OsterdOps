"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useDemoMode } from "@/hooks/useDemoMode";

function DemoBannerContent() {
  const { isDemoMode, exitDemoMode } = useDemoMode();

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="relative z-50 w-full bg-[#0D0E14] border-b border-[#DFB277]/30 px-4 py-2.5 sm:py-2 text-white shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#DFB277]/10 via-transparent to-[#DFB277]/10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 relative z-10">
        {/* Left: Badge + Descriptive Message */}
        <div className="flex items-center gap-2.5 text-center sm:text-left flex-wrap justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DFB277]/15 border border-[#DFB277]/30 text-[#DFB277] text-[10.5px] font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#DFB277] animate-pulse" />
            <span>Interactive Demo</span>
          </span>

          <p className="text-xs sm:text-[13px] text-neutral-200 font-medium">
            You are viewing the OsterdOps Interactive Demo —{" "}
            <span className="text-neutral-400">Sign up to connect live keys.</span>
          </p>
        </div>

        {/* Right: Get Started CTA + Exit Demo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] text-xs font-bold font-mono transition-all duration-150 shadow-[0_2px_10px_rgba(223,178,119,0.3)] hover:shadow-[0_4px_16px_rgba(223,178,119,0.45)] hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
          </Link>

          <button
            type="button"
            onClick={exitDemoMode}
            title="Exit Demo Mode"
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer rounded hover:bg-white/5"
          >
            <span>Exit Demo</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DemoBanner() {
  return (
    <React.Suspense fallback={null}>
      <DemoBannerContent />
    </React.Suspense>
  );
}

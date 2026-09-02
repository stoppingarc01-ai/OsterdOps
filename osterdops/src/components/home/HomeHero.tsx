"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { DashboardHeroPreview } from "./DashboardHeroPreview";

export function HomeHero() {
  return (
    <section className="relative pt-12 pb-16 md:pt-18 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Headline & Subline */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            The Financial Firewall for{" "}
            <span className="text-[#DFB277]">LLM Applications.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed font-sans">
            Enforce hard budgets, prevent runaway agent loops, and auto-downgrade expensive models in real time. Zero SDK lock-in.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-bold text-xs font-mono transition-colors cursor-pointer"
            >
              <span>Deploy Free Perimeter</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <a
              href="#simulator"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0E0E0E] hover:bg-[#141414] border border-[#1A1A1A] hover:border-[#262626] text-neutral-200 font-medium text-xs font-mono transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#DFB277] fill-[#DFB277]" />
              <span>Live Simulator</span>
            </a>
          </div>

          {/* Subdued monospace metadata */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 font-mono pt-1">
            <span>drop-in proxy</span>
            <span>•</span>
            <span>&lt;10ms overhead</span>
            <span>•</span>
            <span>zero prompt egress</span>
          </div>
        </div>

        {/* Embedded High-Fidelity Dashboard Preview */}
        <div className="max-w-6xl mx-auto px-2 sm:px-4 mt-12">
          <DashboardHeroPreview />
        </div>
      </div>
    </section>
  );
}

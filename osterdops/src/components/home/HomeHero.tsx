"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Boxes, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { PerspectiveDashboardMockup } from "./PerspectiveDashboardMockup";

export function HomeHero() {
  return (
    <section className="relative pt-6 pb-12 md:pt-10 md:pb-18 overflow-x-clip bg-[#080808]">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[360px] bg-[radial-gradient(ellipse_at_top,rgba(223,178,119,0.07),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full min-w-0">
          {/* Hero Left Column (Value Proposition & Trust Proofs) */}
          <div className="lg:col-span-5 w-full min-w-0 space-y-4 sm:space-y-5 text-left">
            {/* Kicker Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/25 text-[#DFB277] text-[11px] font-mono font-semibold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-[#DFB277]" />
              <span>AI GATEWAY &amp; FINOPS PLATFORM</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-extrabold tracking-tight text-white leading-[1.1] font-sans">
              The AI Gateway <br />
              Built for Speed, <br />
              <span className="text-[#DFB277]">Control &amp; Savings.</span>
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed max-w-xl">
              One drop-in proxy to connect 64+ frontier models with low-latency routing, pre-flight controls, automatic failover, and zero-PII egress — built for production AI.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              {/* Primary: Deploy in 60 Seconds → */}
              <Link
                href="/sign-up"
                className="group flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-bold text-xs sm:text-sm font-mono transition-all duration-200 shadow-[0_4px_20px_rgba(223,178,119,0.25)] hover:shadow-[0_6px_28px_rgba(223,178,119,0.4)] hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Deploy in 60 Seconds</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Secondary: View Live Dashboard */}
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0D0D0D] hover:bg-[#141414] border border-[#222222] hover:border-[#333333] text-neutral-200 hover:text-white font-medium text-xs sm:text-sm font-mono transition-all cursor-pointer shadow-sm"
              >
                <span>View Live Dashboard</span>
              </Link>
            </div>

            {/* Key Metrics Strip (Inline row with Circular Gold Ring Icons) */}
            <div className="pt-4 flex items-center gap-5 sm:gap-7 flex-wrap sm:flex-nowrap">
              {/* Metric 1 */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#12131A] border border-[#DFB277]/40 flex items-center justify-center text-[#DFB277] shrink-0 shadow-[0_0_8px_rgba(223,178,119,0.15)]">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-white tracking-tight leading-none">
                    &lt;8.4ms
                  </div>
                  <div className="text-[10px] text-neutral-400 font-sans mt-0.5 whitespace-nowrap">
                    Global P95 Overhead
                  </div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#12131A] border border-[#DFB277]/40 flex items-center justify-center text-[#DFB277] shrink-0 shadow-[0_0_8px_rgba(223,178,119,0.15)]">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-white tracking-tight leading-none">
                    64+
                  </div>
                  <div className="text-[10px] text-neutral-400 font-sans mt-0.5 whitespace-nowrap">
                    Frontier Models
                  </div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#12131A] border border-[#DFB277]/40 flex items-center justify-center text-[#DFB277] shrink-0 shadow-[0_0_8px_rgba(223,178,119,0.15)]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-white tracking-tight leading-none">
                    99.99%
                  </div>
                  <div className="text-[10px] text-neutral-400 font-sans mt-0.5 whitespace-nowrap">
                    Edge SLA Uptime
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Column (Integrated Dashboard Mockup) */}
          <div className="lg:col-span-7 w-full min-w-0">
            <PerspectiveDashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Lock,
  Activity,
  ChevronRight,
  TrendingDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { OpenAILogo, GoogleGeminiLogo, AnthropicLogo, KimiLogo } from "@/components/ui/ModelLogos";

export function HomeHero() {
  const [activeReqIndex, setActiveReqIndex] = useState(0);

  // Simulated live gateway streaming requests
  const liveRequests = [
    {
      id: "req_9f21",
      model: "gpt-4o",
      downgradedTo: "gpt-4o-mini",
      saved: "$0.0039",
      savedPct: "-94%",
      tokens: "248 tok",
      latency: "42ms",
      status: 200,
      badge: "Auto-Downgraded",
    },
    {
      id: "req_8e10",
      model: "claude-3-5-haiku-20241022",
      downgradedTo: null,
      saved: null,
      savedPct: null,
      tokens: "182 tok",
      latency: "68ms",
      status: 200,
      badge: "Healthy Route",
    },
    {
      id: "req_7a3b",
      model: "kimi-k1.5",
      downgradedTo: null,
      saved: null,
      savedPct: null,
      tokens: "410 tok",
      latency: "94ms",
      status: 200,
      badge: "Zero Egress",
    },
    {
      id: "req_6c8d",
      model: "gemini-1.5-flash",
      downgradedTo: null,
      saved: null,
      savedPct: null,
      tokens: "512 tok",
      latency: "39ms",
      status: 200,
      badge: "Cached P95",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReqIndex((prev) => (prev + 1) % liveRequests.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [liveRequests.length]);

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Subtle background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#DFB277]/10 via-[#DFB277]/[0.02] to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Badging & Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/30 text-xs font-mono text-[#DFB277]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-semibold tracking-wide uppercase">ACTIVE FINOPS PERIMETER & AI GATEWAY</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300">SUB-5MS SLA</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Stop Passive Logging.{" "}
            <br className="hidden sm:inline" />
            Take Active Control of Your{" "}
            <span className="bg-gradient-to-r from-[#DFB277] via-[#F3D7A8] to-[#DFB277] bg-clip-text text-transparent">
              AI Perimeter.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-sans">
            The sub-5ms intelligent proxy gateway that actively halts runaway agent loops, enforces hierarchical hard spend ceilings, and dynamically downgrades models before budgets breach.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-bold text-sm font-mono transition-all shadow-[0_0_25px_rgba(223,178,119,0.25)] hover:shadow-[0_0_35px_rgba(223,178,119,0.4)] cursor-pointer"
            >
              <span>Deploy AI Perimeter Free</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <a
              href="#simulator"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0E0E0E] hover:bg-[#161616] border border-[#1A1A1A] hover:border-[#DFB277]/50 text-white font-medium text-sm font-mono transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#DFB277] fill-[#DFB277]" />
              <span>Live Interactive Simulator</span>
            </a>
          </div>

          {/* Quick Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-neutral-400 font-mono pt-3">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              1-Line OpenAI Drop-in
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              Zero Raw Prompt Egress
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              No Credit Card Required
            </span>
          </div>
        </div>

        {/* High-Contrast Dashboard Preview Mockup */}
        <div className="mt-12 lg:mt-16 max-w-5xl mx-auto">
          <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Terminal / Browser Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-[#1A1A1A]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#262626]" />
                <div className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#262626]" />
                <div className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#262626]" />
                <span className="text-xs font-mono text-neutral-500 ml-2 hidden sm:inline">
                  https://gateway.osterdops.com/v1/chat/completions
                </span>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-[11px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Circuit Closed (Healthy)</span>
              </div>
            </div>

            {/* Dashboard Telemetry Cards */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* 3 Metrics Micro-Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616]">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">Inline Proxy Overhead</div>
                  <div className="text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-2">
                    <span>3.8ms</span>
                    <span className="text-xs text-[#10B981] font-normal">P95 &lt; 5.2ms</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">In-memory pre-flight check</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616]">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">Monthly Budget Utilization</div>
                  <div className="text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-2">
                    <span>$1,420.50</span>
                    <span className="text-xs text-[#DFB277] font-normal">71.0% of $2,000</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Auto-downgrade arms at 80%</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616]">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">Runaway Loop Protection</div>
                  <div className="text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-2">
                    <span>Active Guard</span>
                    <span className="text-xs text-[#10B981] font-normal">0 Trips</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">30s velocity window: 15 req max</div>
                </div>
              </div>

              {/* Live Streaming Gateway Transaction Stream */}
              <div className="rounded-xl bg-[#080808] border border-[#161616] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#161616]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#DFB277]" />
                    <span className="text-xs font-bold font-mono text-white uppercase tracking-wide">
                      Live Gateway Transaction Pipeline
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                    STREAMING LIVE
                  </span>
                </div>

                <div className="space-y-2">
                  {liveRequests.map((req, idx) => {
                    const isHighlighted = idx === activeReqIndex;
                    return (
                      <div
                        key={req.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border transition-all ${
                          isHighlighted
                            ? "bg-[#0E0E0E] border-[#DFB277]/40 shadow-[0_0_15px_rgba(223,178,119,0.05)]"
                            : "bg-[#0A0A0A] border-[#161616] opacity-75"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono text-neutral-500">{req.id}</span>

                          <div className="flex items-center gap-1.5">
                            {req.model.includes("gpt") && <OpenAILogo className="w-3.5 h-3.5 text-white" />}
                            {req.model.includes("claude") && <AnthropicLogo className="w-3.5 h-3.5 text-[#DFB277]" />}
                            {req.model.includes("gemini") && <GoogleGeminiLogo className="w-3.5 h-3.5 text-white" />}
                            {req.model.includes("kimi") && <KimiLogo className="w-3.5 h-3.5 text-white" />}

                            <span className="text-xs font-mono font-medium text-white">{req.model}</span>

                            {req.downgradedTo && (
                              <div className="flex items-center gap-1 text-[11px] font-mono text-[#10B981]">
                                <ChevronRight className="w-3 h-3 text-neutral-500" />
                                <span className="font-bold">{req.downgradedTo}</span>
                                <span className="px-1.5 py-0.2 rounded bg-[#10B981]/15 text-[10px]">
                                  {req.savedPct}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span className="text-neutral-400">{req.tokens}</span>
                          <span className="text-neutral-500">{req.latency}</span>
                          <span className="px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-[10px] font-bold">
                            {req.status} OK
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Coins,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { OpenAILogo, AnthropicLogo, GoogleGeminiLogo, KimiLogo } from "@/components/ui/ModelLogos";

export function DashboardHeroPreview() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // SVG Line Chart points for 14-day spend trend
  const chartPoints = [
    { day: "Day 1", spend: 32 },
    { day: "Day 2", spend: 45 },
    { day: "Day 3", spend: 40 },
    { day: "Day 4", spend: 68 },
    { day: "Day 5", spend: 55 },
    { day: "Day 6", spend: 78 },
    { day: "Day 7", spend: 70 },
    { day: "Day 8", spend: 95 },
    { day: "Day 9", spend: 84 },
    { day: "Day 10", spend: 110 },
    { day: "Day 11", spend: 98 },
    { day: "Day 12", spend: 125 },
    { day: "Day 13", spend: 115 },
    { day: "Day 14", spend: 142 },
  ];

  // SVG dimensions
  const svgWidth = 420;
  const svgHeight = 110;
  const maxSpend = 160;
  const minSpend = 20;

  const getCoordinates = () => {
    return chartPoints
      .map((p, i) => {
        const x = (i / (chartPoints.length - 1)) * (svgWidth - 20) + 10;
        const y = svgHeight - 10 - ((p.spend - minSpend) / (maxSpend - minSpend)) * (svgHeight - 24);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const polylinePoints = getCoordinates();
  const areaPoints = `10,${svgHeight - 10} ${polylinePoints} ${svgWidth - 10},${svgHeight - 10}`;

  return (
    <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      {/* 1. Frame & Chrome Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0A0A] border-b border-[#1A1A1A]">
        {/* Subtle Window Dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
        </div>

        {/* Center Pill */}
        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-[#080808] border border-[#1A1A1A] text-[11px] font-mono text-neutral-500">
          <span>app.osterdops.com</span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-300">dashboard</span>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="hidden sm:inline text-neutral-400">100% Operational • Edge US-East</span>
        </div>
      </div>

      {/* Main Dashboard Canvas */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* 2. Mock Live Metric Cards (Top Row) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Metric 1 */}
          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#222222] transition-colors">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">Total Spend</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
              $1,428.50
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Past 30 days</div>
          </div>

          {/* Metric 2 */}
          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#222222] transition-colors">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">Projected Spend</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
              $1,820.00
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Based on velocity</div>
          </div>

          {/* Metric 3 */}
          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#DFB277]/40 transition-colors">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">Runaway Loops Blocked</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#DFB277] mt-1">
              42 incidents
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">30s velocity trigger</div>
          </div>

          {/* Metric 4 */}
          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#10B981]/40 transition-colors">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">Cache Hit Savings</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#10B981] mt-1">
              $340.20
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Semantic vector hits</div>
          </div>
        </div>

        {/* 3. Live Proxy Gateway Pipeline (Center Visual) */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0A0A0A] border border-[#161616] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#161616]">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <Activity className="w-3.5 h-3.5 text-[#DFB277]" />
              <span className="font-semibold text-neutral-200">Gateway Pipeline</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">
              Direct Wire Routing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3 py-1">
            {/* Node 1: Client Request */}
            <div
              onMouseEnter={() => setHoveredNode("sdk")}
              onMouseLeave={() => setHoveredNode(null)}
              className="md:col-span-3 p-3 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all space-y-1"
            >
              <div className="text-[10px] font-mono text-neutral-500 uppercase">Ingress</div>
              <div className="text-xs font-mono font-medium text-white flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                <span>Client Request (SDK)</span>
              </div>
              <div className="text-[10px] font-mono text-neutral-400">
                base_url: <span className="text-[#DFB277]">proxy.osterdops.com</span>
              </div>
            </div>

            {/* Divider Arrow 1 */}
            <div className="md:col-span-1 flex items-center justify-center py-1 md:py-0">
              <div className="flex items-center gap-1 text-neutral-600 font-mono text-xs">
                <span className="hidden md:inline">──────</span>
                <span className="text-[#DFB277]">▶</span>
              </div>
            </div>

            {/* Node 2: OsterdOps Gateway */}
            <div
              onMouseEnter={() => setHoveredNode("gateway")}
              onMouseLeave={() => setHoveredNode(null)}
              className="md:col-span-3 p-3 rounded-lg bg-[#0E0E0E] border border-[#DFB277]/40 shadow-[0_0_15px_rgba(223,178,119,0.06)] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#DFB277] uppercase font-semibold">Active Perimeter</span>
                <span className="px-1.5 py-0.2 rounded bg-[#10B981]/15 text-[#10B981] text-[9px] font-mono font-bold">
                  Pre-Flight: &lt;4ms
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#DFB277]" />
                <span>OsterdOps Gateway</span>
              </div>
              <div className="text-[10px] font-mono text-neutral-400">
                Hard caps • Loop breaker • Auto-downgrade
              </div>
            </div>

            {/* Divider Arrow 2 */}
            <div className="md:col-span-1 flex items-center justify-center py-1 md:py-0">
              <div className="flex items-center gap-1 text-neutral-600 font-mono text-xs">
                <span className="hidden md:inline">──────</span>
                <span className="text-[#DFB277]">▶</span>
              </div>
            </div>

            {/* Node 3: Upstream LLM */}
            <div
              onMouseEnter={() => setHoveredNode("llm")}
              onMouseLeave={() => setHoveredNode(null)}
              className="md:col-span-3 p-3 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all space-y-1.5"
            >
              <div className="text-[10px] font-mono text-neutral-500 uppercase">Egress</div>
              <div className="text-xs font-mono font-medium text-white">
                Upstream LLM Provider
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <OpenAILogo className="w-3.5 h-3.5 text-white" />
                <AnthropicLogo className="w-3.5 h-3.5 text-[#DFB277]" />
                <GoogleGeminiLogo className="w-3.5 h-3.5 text-white" />
                <KimiLogo className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Spend & Latency Split Chart (Bottom Row) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Chart: Spend Trend */}
          <div className="lg:col-span-6 p-4 rounded-xl bg-[#0A0A0A] border border-[#161616] space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#161616]">
              <span className="text-xs font-mono font-semibold text-neutral-300">
                Daily Spend Velocity
              </span>
              <span className="text-[10px] font-mono text-neutral-500">14-Day Trajectory</span>
            </div>

            {/* SVG Line Chart */}
            <div className="w-full pt-1">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24 overflow-visible">
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DFB277" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#DFB277" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area Fill */}
                <polygon points={areaPoints} fill="url(#spendGradient)" />
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#DFB277"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                />
                {/* Last point dot */}
                <circle cx={svgWidth - 10} cy={20} r="3" fill="#DFB277" className="animate-pulse" />
              </svg>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-neutral-500 pt-1">
              <span>Day 1: $32/day</span>
              <span className="text-[#DFB277]">Day 14: $142/day (Controlled)</span>
            </div>
          </div>

          {/* Right Activity Ticker */}
          <div className="lg:col-span-6 p-4 rounded-xl bg-[#0A0A0A] border border-[#161616] space-y-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1 border-b border-[#161616]">
              <span className="text-xs font-mono font-semibold text-neutral-300">
                Recent Proxy Ingress
              </span>
              <span className="text-[10px] font-mono text-[#10B981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                Live Feed
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Row 1 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E0E0E] border border-[#161616] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <OpenAILogo className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-medium">gpt-4o</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400">
                  <span className="text-[#10B981]">200 OK</span>
                  <span>8.2ms</span>
                  <span className="text-neutral-300 font-bold">$0.0040</span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E0E0E] border border-[#161616] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <AnthropicLogo className="w-3.5 h-3.5 text-[#DFB277]" />
                  <span className="text-white font-medium">claude-3-5-sonnet</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400">
                  <span className="text-[#10B981]">200 OK</span>
                  <span>11.1ms</span>
                  <span className="text-neutral-300 font-bold">$0.0090</span>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E0E0E] border border-[#161616] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <GoogleGeminiLogo className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-medium">gemini-1.5-flash</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400">
                  <span className="text-[#10B981]">200 OK</span>
                  <span>5.4ms</span>
                  <span className="text-neutral-300 font-bold">$0.0003</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-neutral-500 flex items-center justify-between pt-1">
              <span>All calls encrypted with TLS 1.3</span>
              <span className="text-neutral-400">Zero raw prompts saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

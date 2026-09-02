"use client";

import React from "react";
import { TrendingUp, DollarSign, Cpu, BarChart3, Sparkles, Loader2, ArrowUpRight } from "lucide-react";
import { useLiveTelemetry, type LiveTelemetryData } from "@/hooks/useLiveTelemetry";

interface StatCardsBarProps {
  telemetry?: LiveTelemetryData;
  isLoading?: boolean;
}

export function StatCardsBar({ telemetry: externalTelemetry, isLoading: externalLoading }: StatCardsBarProps) {
  const internalHook = useLiveTelemetry();
  const data = externalTelemetry || internalHook.data;
  const loading = externalLoading !== undefined ? externalLoading : internalHook.isLoading;

  const spendFormatted = `$${data.totalSpendUsd.toFixed(2)}`;
  const projectedFormatted = `$${data.projectedSpendUsd.toFixed(2)}`;
  const tokensFormatted =
    data.totalTokens >= 1_000_000
      ? `${(data.totalTokens / 1_000_000).toFixed(2)}M`
      : data.totalTokens.toLocaleString();
  const requestsFormatted = data.totalRequests.toLocaleString();
  const savingsFormatted = `$${data.cacheSavingsUsd.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Stat 1: Total Spend (This Month) */}
      <div className="p-4 bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl flex flex-col justify-between transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-neutral-400">
            <span>Total Spend (30d)</span>
            <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#D4A362] group-hover:scale-105 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#DFB277] mt-1" /> : spendFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono mt-1">
            <span>Real-time Incurred Spend</span>
          </div>
        </div>

        <div className="h-6 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25">
            <path
              d="M 0,20 Q 25,14 50,12 T 100,4 L 100,25 L 0,25 Z"
              fill="rgba(223, 178, 119, 0.08)"
            />
            <path
              d="M 0,20 Q 25,14 50,12 T 100,4"
              fill="none"
              stroke="#DFB277"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Stat 2: Projected Spend */}
      <div className="p-4 bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl flex flex-col justify-between transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-neutral-400">
            <span>Projected Spend</span>
            <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#D4A362] group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#DFB277] mt-1" /> : projectedFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono mt-1">
            <span>Month-end Run Rate</span>
          </div>
        </div>

        <div className="h-6 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25">
            <path
              d="M 0,22 Q 35,16 65,10 T 100,4 L 100,25 L 0,25 Z"
              fill="rgba(223, 178, 119, 0.08)"
            />
            <path
              d="M 0,22 Q 35,16 65,10 T 100,4"
              fill="none"
              stroke="#DFB277"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Stat 3: Total Metered Tokens */}
      <div className="p-4 bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl flex flex-col justify-between transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-neutral-400">
            <span>Total Tokens</span>
            <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#D4A362] group-hover:scale-105 transition-transform">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#DFB277] mt-1" /> : tokensFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono mt-1">
            <span>Input + Output Volume</span>
          </div>
        </div>

        <div className="h-6 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25">
            <path
              d="M 0,22 C 20,18 40,8 70,12 S 100,4 100,4 L 100,25 L 0,25 Z"
              fill="rgba(223, 178, 119, 0.08)"
            />
            <path
              d="M 0,22 C 20,18 40,8 70,12 S 100,4 100,4"
              fill="none"
              stroke="#DFB277"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Stat 4: Proxied Gateway Requests */}
      <div className="p-4 bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl flex flex-col justify-between transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-neutral-400">
            <span>Total Requests</span>
            <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#D4A362] group-hover:scale-105 transition-transform">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#DFB277] mt-1" /> : requestsFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono mt-1">
            <span>Gateway Completions</span>
          </div>
        </div>

        <div className="h-6 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25">
            <path
              d="M 0,20 Q 20,14 40,16 T 70,10 T 100,3 L 100,25 L 0,25 Z"
              fill="rgba(223, 178, 119, 0.08)"
            />
            <path
              d="M 0,20 Q 20,14 40,16 T 70,10 T 100,3"
              fill="none"
              stroke="#DFB277"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Stat 5: Cache & FinOps Savings */}
      <div className="p-4 bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl flex flex-col justify-between transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-neutral-400">
            <span>Cache Savings</span>
            <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#10B981] tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#10B981] mt-1" /> : savingsFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono mt-1">
            <span>{data.cacheHitRatePercent}% hit efficiency</span>
          </div>
        </div>

        <div className="h-6 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25">
            <path
              d="M 0,22 Q 30,12 60,15 T 100,5 L 100,25 L 0,25 Z"
              fill="rgba(16, 185, 129, 0.08)"
            />
            <path
              d="M 0,22 Q 30,12 60,15 T 100,5"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { TrendingUp, DollarSign, Cpu, BarChart3, Sparkles, Loader2, Zap } from "lucide-react";
import { useLiveTelemetry, type LiveTelemetryData } from "@/hooks/useLiveTelemetry";
import { useGatewayTelemetry } from "@/hooks/useGatewayTelemetry";

interface StatCardsBarProps {
  telemetry?: LiveTelemetryData;
  isLoading?: boolean;
}

export function StatCardsBar({ telemetry: externalTelemetry, isLoading: externalLoading }: StatCardsBarProps) {
  const internalHook = useLiveTelemetry();
  const { data: gatewayData, isLive, isLoading: gatewayLoading } = useGatewayTelemetry(3000);

  const data = externalTelemetry || internalHook.data;
  const loading = (externalLoading !== undefined ? externalLoading : internalHook.isLoading) && gatewayLoading;

  // Real-Time Spend: computed USD with nanodollar precision ($X.XXXXXX) when live
  const spendFormatted = isLive
    ? `$${gatewayData.totalSpendUsd.toFixed(6)}`
    : `$${data.totalSpendUsd.toFixed(2)}`;

  // System Overhead: P50 / P95 latency from engine buffer when live, else projected run rate
  const overheadFormatted = isLive
    ? `${gatewayData.p50LatencyMs}ms / ${gatewayData.p95LatencyMs}ms`
    : `$${data.projectedSpendUsd.toFixed(2)}`;

  // Token volume with prompt vs. completion breakdown
  const totalTokens = isLive ? gatewayData.totalTokens : data.totalTokens;
  const tokensFormatted =
    totalTokens >= 1_000_000
      ? `${(totalTokens / 1_000_000).toFixed(2)}M`
      : totalTokens.toLocaleString();

  const tokenBreakdown = isLive
    ? `${gatewayData.promptTokens.toLocaleString()} in · ${gatewayData.completionTokens.toLocaleString()} out`
    : "Input + Output Volume";

  // Total Requests with live count & error percentage
  const totalRequests = isLive ? gatewayData.totalRequests : data.totalRequests;
  const requestsFormatted = totalRequests.toLocaleString();
  const requestBreakdown = isLive
    ? `${gatewayData.errorRatePercent}% err rate (${gatewayData.failedRequests} errs)`
    : "Gateway Completions";

  // Cache & FinOps savings
  const savingsFormatted = isLive
    ? `$${gatewayData.cacheSavingsUsd.toFixed(4)}`
    : `$${data.cacheSavingsUsd.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Stat 1: Real-Time Spend */}
      <div className="p-4 bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl flex flex-col justify-between transition-all duration-200 group relative overflow-hidden">
        {isLive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[9.5px] font-mono text-[#10B981] border border-[#10B981]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>LIVE</span>
          </div>
        )}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-neutral-400">
            <span>Real-Time Spend</span>
            <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#D4A362] group-hover:scale-105 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#DFB277] mt-1" /> : spendFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono mt-1">
            <span>{isLive ? "Nanodollar Precision ($1 = 10⁹ nanos)" : "Incurred Gateway Spend"}</span>
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

      {/* Stat 2: System Overhead (P50/P95 Latency) */}
      <div className="p-4 bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl flex flex-col justify-between transition-all duration-200 group relative overflow-hidden">
        {isLive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[9.5px] font-mono text-[#10B981] border border-[#10B981]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>P50/P95</span>
          </div>
        )}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-neutral-400">
            <span>{isLive ? "System Overhead" : "Projected Spend"}</span>
            <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#D4A362] group-hover:scale-105 transition-transform">
              {isLive ? <Zap className="w-3.5 h-3.5 text-[#DFB277]" /> : <TrendingUp className="w-3.5 h-3.5" />}
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#DFB277] mt-1" /> : overheadFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono mt-1">
            <span>
              {isLive
                ? `Pre-flight: ${gatewayData.preflightLatencyUs}µs guard`
                : "Month-end Run Rate"}
            </span>
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

      {/* Stat 3: Token Volume (Prompt vs. Completion Breakdown) */}
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
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono mt-1 truncate" title={tokenBreakdown}>
            <span>{tokenBreakdown}</span>
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
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono mt-1 truncate" title={requestBreakdown}>
            <span>{requestBreakdown}</span>
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
            <span>{isLive ? `${gatewayData.cachedTokens.toLocaleString()} cached tokens` : `${data.cacheHitRatePercent}% hit efficiency`}</span>
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

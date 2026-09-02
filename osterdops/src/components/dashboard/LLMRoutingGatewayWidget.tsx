"use client";

import React from "react";
import { Server, ShieldCheck, ArrowRight, Zap, Loader2, Sparkles } from "lucide-react";
import { useLiveTelemetry, type LiveTelemetryData } from "@/hooks/useLiveTelemetry";

interface LLMRoutingGatewayWidgetProps {
  telemetry?: LiveTelemetryData;
  isLoading?: boolean;
}

export function LLMRoutingGatewayWidget({ telemetry: externalTelemetry, isLoading: externalLoading }: LLMRoutingGatewayWidgetProps) {
  const internalHook = useLiveTelemetry();
  const data = externalTelemetry || internalHook.data;
  const loading = externalLoading !== undefined ? externalLoading : internalHook.isLoading;

  const totalRequests = data.totalRequests;
  const latency = data.averageLatencyMs;
  const cacheHitRate = data.cacheHitRatePercent;
  const isOperational = totalRequests > 0;

  return (
    <div className="p-5 bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl space-y-4 relative overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#DFB277]" />
          <h3 className="text-sm font-bold text-white tracking-tight">Live Proxy Gateway Pipeline</h3>
        </div>

        {isOperational ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-[10.5px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
            Operational · Serving Traffic {latency > 0 ? `(${latency}ms avg)` : ""}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#161616] border border-[#222222] text-neutral-400 text-[10.5px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
            Standby · Ready for Traffic
          </span>
        )}
      </div>

      {/* Gateway Flow Node Diagram */}
      <div className="p-4 bg-[#0A0A0A] border border-[#161616] rounded-xl relative flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Node 1: Client Apps */}
        <div className="p-3 bg-[#111111] border border-[#1F1F1F] rounded-xl flex items-center gap-2.5 z-10 w-full md:w-auto">
          <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#DFB277]">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">App Requests</div>
            <div className="text-[10px] text-neutral-400 font-mono">
              {loading ? "..." : `${totalRequests.toLocaleString()} requests`}
            </div>
          </div>
        </div>

        {/* Conduit 1 */}
        <div className="hidden md:flex items-center text-[#DFB277]">
          <ArrowRight className={`w-4 h-4 ${isOperational ? "animate-pulse text-[#10B981]" : "text-neutral-600"}`} />
        </div>

        {/* Node 2: OsterdOps Proxy & Cache */}
        <div className="p-3 bg-[#12110E] border border-[#DFB277]/40 rounded-xl flex items-center gap-2.5 z-10 shadow-[0_0_20px_rgba(223,178,119,0.12)] w-full md:w-auto">
          <div className="w-8 h-8 rounded-lg bg-[#DFB277]/15 border border-[#DFB277]/40 flex items-center justify-center text-[#DFB277]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>OsterdOps Gateway</span>
              <span className="text-[9px] px-1 bg-[#DFB277]/20 text-[#DFB277] rounded font-mono">Proxy</span>
            </div>
            <div className="text-[10px] text-[#10B981] font-mono">
              {cacheHitRate > 0 ? `${cacheHitRate}% Cache Hit Rate` : "AES-256-GCM Vault"}
            </div>
          </div>
        </div>

        {/* Conduit 2 */}
        <div className="hidden md:flex items-center text-[#DFB277]">
          <ArrowRight className={`w-4 h-4 ${isOperational ? "animate-pulse text-[#10B981]" : "text-neutral-600"}`} />
        </div>

        {/* Node 3: Upstream Providers */}
        <div className="p-3 bg-[#111111] border border-[#1F1F1F] rounded-xl flex items-center gap-2.5 z-10 w-full md:w-auto">
          <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#10B981]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Multi-Model Routing</div>
            <div className="text-[10px] text-neutral-400 font-mono">
              {data.providerDistribution.length > 0
                ? `${data.providerDistribution.length} active providers`
                : "OpenAI, Anthropic, Gemini, Kimi"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

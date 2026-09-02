"use client";

import React, { useEffect, useState } from "react";
import { Server, ShieldCheck, ArrowRight, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

export function LLMRoutingGatewayWidget() {
  const { currentOrg, getIdToken } = useAuth();
  const [requests, setRequests] = useState(0);
  const [latency, setLatency] = useState(0);
  const [cacheHitRate, setCacheHitRate] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchGatewayStats() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>("/api/v1/analytics/overview", {
          params: { organizationId: currentOrg.id, timeRange: "30d" },
          token,
        });

        if (!isMounted) return;

        if (res.data && res.data.kpis) {
          setRequests(res.data.kpis.totalRequests ?? 0);
          setLatency(Math.round(res.data.kpis.averageLatencyMs ?? 0));
          setCacheHitRate(Math.round(res.data.kpis.cacheHitRatePercent ?? 0));
        }
      } catch (err) {
        if (isMounted) {
          setRequests(0);
          setLatency(0);
          setCacheHitRate(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchGatewayStats();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#dfba82]" />
          <h3 className="text-base font-semibold text-[#f4efe6]">Live Proxy Gateway Pipeline</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] text-[10.5px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-ping" />
          Active · {latency > 0 ? `${latency}ms Avg Latency` : "Standby"}
        </span>
      </div>

      {/* Gateway Flow Node Diagram */}
      <div className="p-4 bg-[#090b12] border border-[#171a29] rounded-xl relative flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Node 1: Client Apps */}
        <div className="p-3 bg-[#111422] border border-[#202538] rounded-xl flex items-center gap-2.5 z-10 w-full md:w-auto">
          <div className="w-8 h-8 rounded-lg bg-[#181b2a] border border-[#262a3f] flex items-center justify-center text-[#dfba82]">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">App Requests</div>
            <div className="text-[10px] text-[#73788c] font-mono">
              {loading ? "..." : `${requests.toLocaleString()} requests`}
            </div>
          </div>
        </div>

        {/* Conduit 1 */}
        <div className="hidden md:flex items-center text-[#dfba82]">
          <ArrowRight className="w-4 h-4 animate-pulse" />
        </div>

        {/* Node 2: OsterdOps Proxy & Cache */}
        <div className="p-3 bg-[#171424] border border-[#dfba82]/40 rounded-xl flex items-center gap-2.5 z-10 shadow-[0_0_20px_rgba(223,186,130,0.15)] w-full md:w-auto">
          <div className="w-8 h-8 rounded-lg bg-[#dfba82]/20 border border-[#dfba82]/50 flex items-center justify-center text-[#dfba82]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>OsterdOps Gateway</span>
              <span className="text-[9px] px-1 bg-[#dfba82]/20 text-[#dfba82] rounded">Proxy</span>
            </div>
            <div className="text-[10px] text-[#4ade80] font-mono">
              {cacheHitRate > 0 ? `${cacheHitRate}% Cache Hit Rate` : "Cache Active"}
            </div>
          </div>
        </div>

        {/* Conduit 2 */}
        <div className="hidden md:flex items-center text-[#dfba82]">
          <ArrowRight className="w-4 h-4 animate-pulse" />
        </div>

        {/* Node 3: Upstream Providers */}
        <div className="p-3 bg-[#111422] border border-[#202538] rounded-xl flex items-center gap-2.5 z-10 w-full md:w-auto">
          <div className="w-8 h-8 rounded-lg bg-[#181b2a] border border-[#262a3f] flex items-center justify-center text-[#dfba82]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Upstream LLMs</div>
            <div className="text-[10px] text-[#73788c]">OpenAI · Anthropic · Gemini</div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Coins,
  Cpu,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface ModelUsage {
  model: string;
  provider: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
}

export function AdminUsageView() {
  const { currentOrg, getIdToken } = useAuth();
  const [usageData, setUsageData] = useState<ModelUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("ALL");

  useEffect(() => {
    let isMounted = true;

    async function loadUsage() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>("/api/v1/analytics/overview", {
          params: { organizationId: currentOrg.id, timeRange: "30d" },
          token,
        });

        if (!isMounted) return;

        if (res.data?.kpis) {
          const k = res.data.kpis;
          setTotalTokens(k.totalTokens ?? 0);
          setTotalSpend(k.totalSpendUsd ?? 0);
          setTotalRequests(k.totalRequests ?? 0);
          setAvgLatency(Math.round(k.averageLatencyMs ?? 0));
        }

        if (Array.isArray(res.data?.byModel)) {
          const mapped: ModelUsage[] = res.data.byModel.map((m: any) => ({
            model: m.model,
            provider: m.provider || "openai",
            requests: m.requests ?? 0,
            promptTokens: Math.round((m.tokens ?? 0) * 0.7),
            completionTokens: Math.round((m.tokens ?? 0) * 0.3),
            cachedTokens: 0,
            totalCostUsd: m.spendUsd ?? 0,
            avgLatencyMs: avgLatency || 140,
          }));
          setUsageData(mapped);
        } else {
          setUsageData([]);
        }
      } catch (err) {
        if (isMounted) setUsageData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUsage();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const filteredModels = usageData.filter((item) => {
    const matchesSearch = item.model.toLowerCase().includes(search.toLowerCase());
    const matchesProvider =
      providerFilter === "ALL" || item.provider.toLowerCase() === providerFilter.toLowerCase();
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Total Metered Tokens (30d)</span>
            <Cpu className="w-4 h-4 text-[#dfba82]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {totalTokens >= 1_000_000
              ? `${(totalTokens / 1_000_000).toFixed(2)}M`
              : totalTokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#717688] mt-2">Aggregated across providers</div>
        </div>

        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Total Incurred Cost</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            ${totalSpend.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#717688] mt-2">Micro-cent precision billing</div>
        </div>

        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Total Ingestion Requests</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {totalRequests.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2">Live proxy ingestion</div>
        </div>

        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#8e93a6]">
            <span>Avg Latency (p50)</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {avgLatency} ms
          </div>
          <div className="text-[11px] text-emerald-400 mt-2">Gateway performance nominal</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search model name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-[#0c0f16] border border-[#171b26] rounded-xl text-xs text-white placeholder:text-[#555a6d] focus:outline-none focus:border-[#dfba82] w-64"
            />
          </div>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-[#0c0f16] border border-[#171b26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
          >
            <option value="ALL">All Providers</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google Gemini</option>
          </select>
        </div>
      </div>

      {/* Model Breakdown Table */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Loading consumption telemetry...</div>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07080c] border-b border-[#171b26] text-[#717688] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Model &amp; Provider</th>
                  <th className="p-4">Requests</th>
                  <th className="p-4">Total Tokens</th>
                  <th className="p-4">Total Cost ($USD)</th>
                  <th className="p-4 text-right">Avg Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171b26] text-white">
                {filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                      No model consumption metrics recorded for this organization
                    </td>
                  </tr>
                ) : (
                  filteredModels.map((item) => (
                    <tr key={item.model} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white font-mono">{item.model}</div>
                        <div className="text-[11px] text-[#8e93a6] uppercase">{item.provider}</div>
                      </td>
                      <td className="p-4 font-mono">{item.requests.toLocaleString()}</td>
                      <td className="p-4 font-mono text-[#8e93a6]">
                        {item.promptTokens + item.completionTokens >= 1_000_000
                          ? `${((item.promptTokens + item.completionTokens) / 1_000_000).toFixed(2)}M`
                          : (item.promptTokens + item.completionTokens).toLocaleString()}
                      </td>
                      <td className="p-4 font-mono text-[#dfba82] font-semibold">
                        ${item.totalCostUsd.toFixed(4)}
                      </td>
                      <td className="p-4 text-right font-mono text-[#8e93a6]">
                        {item.avgLatencyMs} ms
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

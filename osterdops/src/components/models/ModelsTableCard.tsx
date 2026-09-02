"use client";

import React, { useEffect, useState } from "react";
import { Search, ChevronDown, Plus, TrendingUp, TrendingDown, LineChart, Loader2, Cpu } from "lucide-react";
import { ModelIconBadge, ProviderIconBadge } from "@/components/ui/ModelLogos";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface ModelItem {
  id: string;
  name: string;
  code: string;
  provider: "OpenAI" | "Anthropic" | "Google" | "AWS Bedrock";
  type: "Chat" | "Embedding" | "Image" | "Audio";
  spend: string;
  spendTrend: string;
  isUp: boolean;
  tokens: string;
  avgCost: string;
  requests: string;
  status: "Active" | "Inactive";
}

interface ModelsTableCardProps {
  onOpenAddModel: () => void;
}

export function ModelsTableCard({ onOpenAddModel }: ModelsTableCardProps) {
  const { currentOrg, getIdToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("All Providers");
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchModels() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>("/api/v1/analytics/overview", {
          params: { organizationId: currentOrg.id, timeRange: "30d" },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data.byModel)) {
          const mapped: ModelItem[] = res.data.byModel.map((m: any, idx: number) => {
            const reqs = m.requests ?? 0;
            const spend = m.spendUsd ?? 0;
            const avg = reqs > 0 ? (spend / reqs).toFixed(4) : "0.00";

            let prov: "OpenAI" | "Anthropic" | "Google" | "AWS Bedrock" = "OpenAI";
            const pLower = (m.provider || "").toLowerCase();
            if (pLower.includes("anthropic") || pLower.includes("claude")) prov = "Anthropic";
            else if (pLower.includes("gemini") || pLower.includes("google")) prov = "Google";
            else if (pLower.includes("bedrock") || pLower.includes("aws")) prov = "AWS Bedrock";

            return {
              id: `mod_${idx}`,
              name: m.model,
              code: m.model,
              provider: prov,
              type: "Chat",
              spend: `$${spend.toFixed(2)}`,
              spendTrend: "—",
              isUp: false,
              tokens: m.tokens >= 1_000_000 ? `${(m.tokens / 1_000_000).toFixed(1)}M` : (m.tokens ?? 0).toLocaleString(),
              avgCost: `$${avg}`,
              requests: reqs.toLocaleString(),
              status: "Active",
            };
          });
          setModels(mapped);
        } else {
          setModels([]);
        }
      } catch (err) {
        if (isMounted) setModels([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchModels();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const filtered = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider =
      providerFilter === "All Providers" || m.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#787d91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full bg-[#0d0f18] border border-[#1d202e] focus:border-[#dfba82] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#52576b] focus:outline-none transition-all"
            />
          </div>

          {/* Provider Filter */}
          <div className="relative">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-[#0d0f18] border border-[#1d202e] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="All Providers">All Providers</option>
              <option value="OpenAI">OpenAI</option>
              <option value="Anthropic">Anthropic</option>
              <option value="Google">Google</option>
              <option value="AWS Bedrock">AWS Bedrock</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Add Model Button */}
        <button
          type="button"
          onClick={onOpenAddModel}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Custom Model</span>
        </button>
      </div>

      {/* Table Container Card */}
      <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#f4efe6]">
            Active Catalog & Consumption ({filtered.length})
          </h3>
        </div>

        {/* Table / Empty State */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Loading model consumption metrics...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#73788c] bg-[#090b12] rounded-xl border border-[#161824] space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white">No active model traffic recorded</div>
              <p className="text-[11px] text-[#73788c] max-w-sm mx-auto">
                Route requests through your project API key to track real-time model throughput, costs, and token latency.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-medium">Model Name</th>
                  <th className="pb-3 font-medium">Provider</th>
                  <th className="pb-3 font-medium text-right">Spend</th>
                  <th className="pb-3 font-medium text-right">Tokens</th>
                  <th className="pb-3 font-medium text-right">Avg Cost/Req</th>
                  <th className="pb-3 font-medium text-right">Requests</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151826]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-white font-mono">{item.name}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <ProviderIconBadge provider={item.provider} />
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-bold text-[#dfba82]">
                      {item.spend}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-[#c5c9d6]">
                      {item.tokens}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-[#c5c9d6]">
                      {item.avgCost}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-white">
                      {item.requests}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#4ade80] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

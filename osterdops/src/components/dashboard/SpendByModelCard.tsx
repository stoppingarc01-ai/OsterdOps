"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { apiRequest } from "@/lib/api/client";
import { ModelIconBadge } from "@/components/ui/ModelLogos";
import { Cpu, Loader2 } from "lucide-react";

interface ModelUsage {
  model: string;
  provider: string;
  spendUsd: number;
  requests: number;
  tokens: number;
}

const BENCHMARK_MODELS: ModelUsage[] = [
  { model: "claude-3-5-sonnet", provider: "anthropic", spendUsd: 946.85, requests: 31400, tokens: 12050000 },
  { model: "gpt-4o", provider: "openai", spendUsd: 879.20, requests: 28500, tokens: 10600000 },
  { model: "gemini-2.0-flash", provider: "gemini", spendUsd: 642.50, requests: 34200, tokens: 10590000 },
  { model: "gpt-4o-mini", provider: "openai", spendUsd: 541.05, requests: 25700, tokens: 8190000 },
  { model: "deepseek-chat", provider: "deepseek", spendUsd: 270.50, requests: 14200, tokens: 3370000 },
  { model: "claude-3-5-haiku", provider: "anthropic", spendUsd: 101.50, requests: 8850, tokens: 3370000 },
];

export function SpendByModelCard() {
  const { currentOrg, getIdToken } = useAuth();
  const { formatCurrency } = useCurrency();
  const [models, setModels] = useState<ModelUsage[]>(BENCHMARK_MODELS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchModelSpend() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>("/api/v1/analytics/overview", {
          params: { organizationId: currentOrg.id, timeRange: "30d" },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data.byModel) && res.data.byModel.length > 0) {
          setModels(res.data.byModel);
        } else {
          setModels(BENCHMARK_MODELS);
        }
      } catch (err) {
        if (isMounted) setModels(BENCHMARK_MODELS);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchModelSpend();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const activeModels = models.length > 0 ? models : BENCHMARK_MODELS;
  const maxSpend = Math.max(...activeModels.map((m) => m.spendUsd), 1);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Spend by Model</h3>
        <span className="text-[10px] font-mono text-neutral-400">Distribution</span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#8e93a6] space-y-2">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
          <div>Aggregating model metrics...</div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {activeModels.map((m) => {
            const pct = (m.spendUsd / maxSpend) * 100;
            return (
              <div key={m.model} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ModelIconBadge modelName={m.model} size="sm" />
                    <span className="font-mono text-[#c5c9d6]">{m.model}</span>
                  </div>
                  <span className="font-bold text-white font-mono">{formatCurrency(m.spendUsd)}</span>
                </div>

                <div className="w-full h-1.5 bg-[#141724] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#dfba82] to-[#b8860b] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

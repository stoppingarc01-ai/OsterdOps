"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
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

export function SpendByModelCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [models, setModels] = useState<ModelUsage[]>([]);
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
          setModels([]);
        }
      } catch (err) {
        if (isMounted) setModels([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchModelSpend();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const maxSpend = models.length > 0 ? Math.max(...models.map((m) => m.spendUsd), 1) : 1;

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Spend by Model</h3>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#8e93a6] space-y-2">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
          <div>Aggregating model metrics...</div>
        </div>
      ) : models.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#090b12] border border-[#171a27] text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">No model usage recorded</div>
          <p className="text-[11px] text-[#73788c]">
            Per-model usage will populate once models are queried through the proxy.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {models.map((m) => {
            const pct = (m.spendUsd / maxSpend) * 100;
            return (
              <div key={m.model} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ModelIconBadge modelName={m.model} size="sm" />
                    <span className="font-mono text-[#c5c9d6]">{m.model}</span>
                  </div>
                  <span className="font-bold text-white font-mono">${m.spendUsd.toFixed(2)}</span>
                </div>

                <div className="w-full h-1.5 bg-[#141724] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#dfba82] rounded-full transition-all duration-500"
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

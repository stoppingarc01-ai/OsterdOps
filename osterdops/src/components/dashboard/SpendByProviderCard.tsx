"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import { Layers, Loader2 } from "lucide-react";

interface ProviderUsage {
  provider: string;
  spendUsd: number;
  percentageOfSpend: number;
  requests: number;
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#dfba82",
  anthropic: "#b8860b",
  gemini: "#9da1b2",
  other: "#3b82f6",
};

export function SpendByProviderCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [providers, setProviders] = useState<ProviderUsage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchProviderSpend() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>("/api/v1/analytics/overview", {
          params: { organizationId: currentOrg.id, timeRange: "30d" },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data.byProvider) && res.data.byProvider.length > 0) {
          setProviders(res.data.byProvider);
        } else {
          setProviders([]);
        }
      } catch (err) {
        if (isMounted) setProviders([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProviderSpend();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Spend by Provider</h3>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#8e93a6] space-y-2">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
          <div>Aggregating provider metrics...</div>
        </div>
      ) : providers.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#090b12] border border-[#171a27] text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">No provider usage recorded</div>
          <p className="text-[11px] text-[#73788c]">
            Provider spend breakdown will appear once gateway proxy requests are made.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => {
            const color = PROVIDER_COLORS[p.provider.toLowerCase()] || "#38bdf8";
            return (
              <div key={p.provider} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-medium text-[#c5c9d6] capitalize">{p.provider}</span>
                  </div>
                  <span className="font-mono font-bold text-white">${p.spendUsd.toFixed(2)}</span>
                </div>
                <div className="w-full h-1.5 bg-[#141724] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, p.percentageOfSpend)}%`,
                      backgroundColor: color,
                    }}
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

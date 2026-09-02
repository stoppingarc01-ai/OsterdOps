"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import { Sparkles, Loader2 } from "lucide-react";

export function SavingsImpactCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [savings, setSavings] = useState<number>(0);
  const [cacheHitRate, setCacheHitRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchSavings() {
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
          setSavings(res.data.kpis.totalCacheSavingsUsd ?? 0);
          setCacheHitRate(res.data.kpis.cacheHitRatePercent ?? 0);
        }
      } catch (err) {
        if (isMounted) {
          setSavings(0);
          setCacheHitRate(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSavings();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#f4efe6]">
            Savings Impact <span className="text-xs text-[#8e93a6] font-normal">(Last 30 Days)</span>
          </h3>
          {loading && <Loader2 className="w-3.5 h-3.5 text-[#dfba82] animate-spin" />}
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold text-white font-mono">${savings.toFixed(2)}</span>
          <span className="text-[11px] text-[#73788c]">Total Deflected Spend</span>
        </div>
      </div>

      {savings === 0 ? (
        <div className="p-4 rounded-xl bg-[#090b12] border border-[#171a27] text-center space-y-1.5">
          <div className="w-7 h-7 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-medium text-white">No cache savings recorded yet</div>
          <p className="text-[11px] text-[#73788c]">
            Semantic caching deflects identical prompts at the edge to reduce provider token costs.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#090b12] border border-[#171a27] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8e93a6]">Cache Deflection Rate</span>
            <span className="font-mono text-[#dfba82] font-bold">{cacheHitRate.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#141724] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#dfba82] rounded-full"
              style={{ width: `${Math.min(100, Math.max(5, cacheHitRate))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

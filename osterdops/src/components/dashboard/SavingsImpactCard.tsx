"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { apiRequest } from "@/lib/api/client";
import { Sparkles, Loader2 } from "lucide-react";

export function SavingsImpactCard() {
  const { currentOrg, getIdToken } = useAuth();
  const { formatCurrency } = useCurrency();
  const isDemo = typeof window !== "undefined" && (
    new URLSearchParams(window.location.search).get("demo") === "true" ||
    sessionStorage.getItem("osterdops_demo_mode") === "true" ||
    document.cookie.includes("osterdops_demo_mode=true")
  );

  const [savings, setSavings] = useState<number>(() => isDemo ? 612.40 : 0);
  const [cacheHitRate, setCacheHitRate] = useState<number>(() => isDemo ? 18.4 : 0);
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

        if (res.data && res.data.kpis && (res.data.kpis.totalCacheSavingsUsd > 0 || res.data.kpis.cacheHitRatePercent > 0)) {
          setSavings(res.data.kpis.totalCacheSavingsUsd ?? 0);
          setCacheHitRate(res.data.kpis.cacheHitRatePercent ?? 0);
        } else if (isMounted) {
          setSavings(isDemo ? 612.40 : 0);
          setCacheHitRate(isDemo ? 18.4 : 0);
        }
      } catch (err) {
        if (isMounted) {
          setSavings(isDemo ? 612.40 : 0);
          setCacheHitRate(isDemo ? 18.4 : 0);
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
          <span className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(savings)}</span>
          <span className="text-[11px] text-[#73788c]">Total Deflected Spend</span>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#090b12] border border-[#171a27] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8e93a6]">Cache Deflection Rate</span>
          <span className="font-mono text-[#dfba82] font-bold">{cacheHitRate.toFixed(1)}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#141724] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-[#dfba82] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, cacheHitRate))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10.5px] font-mono text-neutral-400 pt-1 border-t border-[#141724]">
          <span>Prompt In-Memory Hits</span>
          <span className="text-white font-semibold">{isDemo ? "12,850 reqs" : "0 reqs"}</span>
        </div>
      </div>
    </div>
  );
}

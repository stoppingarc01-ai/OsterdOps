"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Globe, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

export function LiveTickerBar() {
  const { currentOrg, getIdToken } = useAuth();
  const [spend, setSpend] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchTickerData() {
      if (!currentOrg?.id) return;

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>("/api/v1/analytics/overview", {
          params: { organizationId: currentOrg.id, timeRange: "30d" },
          token,
        });

        if (!isMounted) return;

        if (res.data && res.data.kpis) {
          setSpend(res.data.kpis.totalSpendUsd ?? 0);
          setLatency(Math.round(res.data.kpis.averageLatencyMs ?? 0));
        }
      } catch (err) {
        if (isMounted) {
          setSpend(0);
          setLatency(0);
        }
      }
    }

    fetchTickerData();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="w-full bg-[#0a0c13] border-b border-[#161824] px-4 py-2 flex items-center justify-between text-[11px] text-[#787d91]">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        {/* Gateway Health */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
          <span className="text-[#c5c9d6] font-medium">Gateway Proxy:</span>
          <span className="text-[#4ade80] font-bold">100% Operational</span>
        </div>

        {/* Edge Locations */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Globe className="w-3 h-3 text-[#dfba82]" />
          <span>Multi-Region Edge</span>
        </div>

        {/* Latency */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap className="w-3 h-3 text-[#dfba82]" />
          <span>
            Avg Latency:{" "}
            <strong className="text-white font-mono">{latency > 0 ? `${latency}ms` : "—"}</strong>
          </span>
        </div>

        {/* Active SOC2 Guardrails */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3 h-3 text-[#dfba82]" />
          <span>SOC2 Type II Guardrails</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 shrink-0 text-[10.5px]">
        <span className="text-[#dfba82] font-mono">
          MONTHLY SPEND: ${spend.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

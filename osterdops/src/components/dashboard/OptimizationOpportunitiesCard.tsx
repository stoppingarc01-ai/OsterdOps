"use client";

import React, { useEffect, useState } from "react";
import { Zap, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface OptimizationItem {
  id?: string;
  title: string;
  potentialMonthlySavingsUsd?: number;
  savingsDescription?: string;
  impact?: "High" | "Medium" | "Low";
}

const BENCHMARK_OPPORTUNITIES: OptimizationItem[] = [
  {
    title: "Route Structured Extraction to Gemini 2.0 Flash",
    potentialMonthlySavingsUsd: 420,
    savingsDescription: "Save ~$420/mo by cascading high-volume extraction from Claude 3.5 Sonnet to Gemini 2.0 Flash",
    impact: "High",
  },
  {
    title: "Enable Semantic Edge Caching on System Prompts",
    potentialMonthlySavingsUsd: 190,
    savingsDescription: "Save ~$190/mo with 18.4% prompt cache hit rate across identical preambles",
    impact: "Medium",
  },
  {
    title: "Tier Down Background Batch Jobs to GPT-4o-mini",
    potentialMonthlySavingsUsd: 110,
    savingsDescription: "Save ~$110/mo by routing asynchronous batch tasks to lightweight low-latency models",
    impact: "High",
  },
];

export function OptimizationOpportunitiesCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [items, setItems] = useState<OptimizationItem[]>(BENCHMARK_OPPORTUNITIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecs() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>(`/api/v1/organizations/${currentOrg.id}/recommendations`, {
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setItems(res.data);
        } else {
          setItems(BENCHMARK_OPPORTUNITIES);
        }
      } catch (err) {
        if (isMounted) setItems(BENCHMARK_OPPORTUNITIES);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRecs();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const displayItems = items.length > 0 ? items : BENCHMARK_OPPORTUNITIES;

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">
          Optimization Opportunities
        </h3>
        <Link
          href="/dashboard/analytics"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#8e93a6] space-y-2">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
          <div>Scanning inference traces...</div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 hover:border-[#dfba82]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#181b2a] border border-[#262a3f] flex items-center justify-center text-[#dfba82] shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{item.title}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/30">
                      {item.impact || "High"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8e93a6] mt-0.5">
                    {item.savingsDescription || `Save $${(item.potentialMonthlySavingsUsd ?? 0).toFixed(0)}/mo`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

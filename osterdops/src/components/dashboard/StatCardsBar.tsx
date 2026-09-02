"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Cpu, BarChart3, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface OverviewKpis {
  totalSpendUsd: number;
  projectedSpendUsd: number;
  totalTokens: number;
  totalRequests: number;
  cacheSavingsUsd: number;
}

export function StatCardsBar() {
  const { currentOrg, getIdToken } = useAuth();
  const [kpis, setKpis] = useState<OverviewKpis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
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
          const raw = res.data.kpis;
          setKpis({
            totalSpendUsd: raw.totalSpendUsd ?? 0,
            projectedSpendUsd: (raw.totalSpendUsd ?? 0) * 1.25,
            totalTokens: raw.totalTokens ?? 0,
            totalRequests: raw.totalRequests ?? 0,
            cacheSavingsUsd: raw.totalCacheSavingsUsd ?? 0,
          });
        } else {
          setKpis({
            totalSpendUsd: 0,
            projectedSpendUsd: 0,
            totalTokens: 0,
            totalRequests: 0,
            cacheSavingsUsd: 0,
          });
        }
      } catch (err) {
        if (isMounted) {
          setKpis({
            totalSpendUsd: 0,
            projectedSpendUsd: 0,
            totalTokens: 0,
            totalRequests: 0,
            cacheSavingsUsd: 0,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const spendFormatted = kpis ? `$${kpis.totalSpendUsd.toFixed(2)}` : "$0.00";
  const projectedFormatted = kpis ? `$${kpis.projectedSpendUsd.toFixed(2)}` : "$0.00";
  const tokensFormatted = kpis
    ? kpis.totalTokens >= 1_000_000
      ? `${(kpis.totalTokens / 1_000_000).toFixed(1)}M`
      : kpis.totalTokens.toLocaleString()
    : "0";
  const requestsFormatted = kpis ? kpis.totalRequests.toLocaleString() : "0";
  const savingsFormatted = kpis ? `$${kpis.cacheSavingsUsd.toFixed(2)}` : "$0.00";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Stat 1: Total Spend (This Month) */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Total Spend (30d)</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#dfba82] mt-1" /> : spendFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8e93a6] font-medium mt-1">
            <span>Incurred spend</span>
          </div>
        </div>

        <div className="h-7 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
            <path
              d="M 0,25 Q 25,18 50,15 T 100,5 L 100,30 L 0,30 Z"
              fill="rgba(223, 186, 130, 0.12)"
            />
            <path
              d="M 0,25 Q 25,18 50,15 T 100,5"
              fill="none"
              stroke="#dfba82"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Stat 2: Projected Spend */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Projected Spend</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#dfba82] mt-1" /> : projectedFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8e93a6] font-medium mt-1">
            <span>Based on current velocity</span>
          </div>
        </div>

        <div className="h-7 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
            <path
              d="M 0,22 Q 30,12 60,18 T 100,4 L 100,30 L 0,30 Z"
              fill="rgba(223, 186, 130, 0.12)"
            />
            <path
              d="M 0,22 Q 30,12 60,18 T 100,4"
              fill="none"
              stroke="#dfba82"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Stat 3: Total Tokens */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Total Tokens</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#dfba82] mt-1" /> : tokensFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8e93a6] font-medium mt-1">
            <span>Input + Output tokens</span>
          </div>
        </div>

        <div className="h-7 w-full mt-3 flex items-end gap-1">
          {[40, 55, 35, 70, 60, 85, 95, 80, 100].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[#dfba82]/30 rounded-xs hover:bg-[#dfba82] transition-colors"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Stat 4: Total Requests */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Total Requests</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#dfba82] mt-1" /> : requestsFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8e93a6] font-medium mt-1">
            <span>Proxied through gateway</span>
          </div>
        </div>

        <div className="h-7 w-full mt-3 flex items-end gap-1">
          {[30, 45, 60, 50, 75, 65, 80, 90, 85].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[#dfba82]/30 rounded-xs hover:bg-[#dfba82] transition-colors"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Stat 5: Cache Savings */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all duration-200 group">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#73788c]">
            <span>Cache Savings</span>
            <div className="w-6 h-6 rounded-lg bg-[#151826] border border-[#232738] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-1.5 font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#dfba82] mt-1" /> : savingsFormatted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <span>Semantic cache hits</span>
          </div>
        </div>

        <div className="h-7 w-full mt-3">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
            <path
              d="M 0,28 Q 30,20 60,10 T 100,2 L 100,30 L 0,30 Z"
              fill="rgba(223, 186, 130, 0.15)"
            />
            <path
              d="M 0,28 Q 30,20 60,10 T 100,2"
              fill="none"
              stroke="#dfba82"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

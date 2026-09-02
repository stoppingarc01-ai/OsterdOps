"use client";

import React, { useEffect, useState } from "react";
import { Wallet, TrendingDown, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import type { Budget } from "@/types";

export function BillingTopMetrics() {
  const { currentOrg, getIdToken } = useAuth();
  const [spend, setSpend] = useState<number>(0);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const [analyticsRes, budgetsRes] = await Promise.all([
          apiRequest<any>("/api/v1/analytics/overview", {
            params: { organizationId: currentOrg.id, timeRange: "30d" },
            token,
          }),
          apiRequest<Budget[]>("/api/v1/budgets", {
            params: { organizationId: currentOrg.id },
            token,
          }),
        ]);

        if (!isMounted) return;

        if (analyticsRes.data?.kpis?.totalSpendUsd != null) {
          setSpend(analyticsRes.data.kpis.totalSpendUsd);
        }
        if (budgetsRes.data && Array.isArray(budgetsRes.data)) {
          setBudgets(budgetsRes.data);
        }
      } catch (err) {
        if (isMounted) {
          setSpend(0);
          setBudgets([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const totalCap = budgets.reduce((acc, b) => acc + (b.monthlyCap || b.limitAmount || 0), 0);
  const utilization = totalCap > 0 ? (spend / totalCap) * 100 : 0;
  const planName = currentOrg?.planTier ? `${currentOrg.planTier.toUpperCase()} Tier` : "Free Tier";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Current Spend */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between hover:border-[#dfba82]/40 transition-all group space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#73788c]">Monthly AI Spend</span>
          <div className="w-8 h-8 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#dfba82]" /> : `$${spend.toFixed(2)}`}
          </div>
          <div className="flex items-center justify-between text-[10.5px] text-[#73788c] mt-1 font-mono">
            <span>Limit: {totalCap > 0 ? `$${totalCap.toFixed(2)}` : "No limit set"}</span>
            <span className="text-[#dfba82] font-semibold">{totalCap > 0 ? `${utilization.toFixed(1)}% used` : "—"}</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-[#171a27] rounded-full overflow-hidden">
          <div className="h-full bg-[#dfba82] rounded-full" style={{ width: `${Math.min(100, utilization)}%` }} />
        </div>
      </div>

      {/* Card 2: Projected Month-End */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Projected Month-End</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1 font-mono">
            ${(spend * 1.25).toFixed(2)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Velocity forecast</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#4ade80]">
          <TrendingDown className="w-4 h-4" />
        </div>
      </div>

      {/* Card 3: Active Budget Caps */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Active Budget Enforcements</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1 font-mono">
            {budgets.length} Enforced Caps
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>Active guardrails</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>

      {/* Card 4: Plan Tier */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Active Subscription</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1 capitalize">
            {planName}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8e93a6] font-medium mt-1">
            <span>Workspace: {currentOrg?.name || "Default"}</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <CreditCard className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

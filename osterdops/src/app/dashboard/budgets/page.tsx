"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Wallet,
  Plus,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Coins,
  Clock,
  Layers,
  ArrowRight,
  Info,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import { RbacGuard } from "@/components/auth/RbacGuard";
import { CreateBudgetModal } from "@/components/billing/CreateBudgetModal";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";

interface BudgetDisplayItem {
  id: string;
  name: string;
  scope: "ORGANIZATION" | "PROJECT";
  period: "MONTHLY" | "WEEKLY" | "DAILY";
  limitUsd: number;
  currentSpendUsd: number;
  utilizationPercent: number;
  enforcementMode: "SOFT_ALERT" | "HARD_BLOCK";
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "EXCEEDED" | "PAUSED";
}

export default function BudgetsPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [budgets, setBudgets] = useState<BudgetDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [evaluating, setEvaluating] = useState<string | null>(null);

  // Live real-time tenant telemetry
  const { data: telemetry } = useLiveTelemetry({
    pollIntervalMs: 4000,
  });

  const fetchBudgets = useCallback(async () => {
    if (!currentOrg?.id) return;
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any[]>("/api/v1/budgets", {
        params: { organizationId: currentOrg.id },
        token,
      });

      if (res.data && Array.isArray(res.data)) {
        const mapped: BudgetDisplayItem[] = res.data.map((b: any) => {
          const limit = b.amountUsd || b.limitUsd || 500;
          // Synchronize with live telemetry if organization scope
          const isOrgScope = (b.scope || "ORGANIZATION").toUpperCase() === "ORGANIZATION";
          const current = isOrgScope
            ? Math.max(Number(b.currentSpendUsd || b.spendUsd || 0), telemetry.totalSpendUsd)
            : Number(b.currentSpendUsd || b.spendUsd || 0);

          const util = limit > 0 ? (current / limit) * 100 : 0;
          let status: BudgetDisplayItem["status"] = "HEALTHY";
          if (b.status === "PAUSED" || b.status === "paused") status = "PAUSED";
          else if (util >= 100) status = "EXCEEDED";
          else if (util >= 90) status = "CRITICAL";
          else if (util >= 75) status = "WARNING";

          return {
            id: b.id,
            name: b.name || "Budget Cap",
            scope: b.scope || "ORGANIZATION",
            period: b.period || "MONTHLY",
            limitUsd: limit,
            currentSpendUsd: current,
            utilizationPercent: util,
            enforcementMode: b.enforcementMode || "HARD_BLOCK",
            status,
          };
        });
        setBudgets(mapped);
      } else {
        setBudgets([]);
      }
    } catch (e) {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrg, getIdToken, telemetry.totalSpendUsd]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleBudgetCreated = () => {
    fetchBudgets();
  };

  const togglePause = async (id: string) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newStatus = b.status === "PAUSED" ? "HEALTHY" : "PAUSED";
          return { ...b, status: newStatus };
        }
        return b;
      })
    );

    try {
      const token = await getIdToken();
      await apiRequest(`/api/v1/budgets/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "PAUSED" }),
      });
    } catch (e) {
      // handled
    }
  };

  const handleEvaluate = async (id: string) => {
    setEvaluating(id);
    try {
      const token = await getIdToken();
      await apiRequest(`/api/v1/budgets/${id}/evaluate`, {
        method: "POST",
        token,
      });
      await fetchBudgets();
    } catch (e) {
      // handled
    } finally {
      setEvaluating(null);
    }
  };

  const totalCap = budgets.reduce((acc, b) => acc + b.limitUsd, 0);
  const totalSpend = budgets.length > 0
    ? budgets.reduce((acc, b) => acc + b.currentSpendUsd, 0)
    : telemetry.totalSpendUsd;
  const overallUtil = totalCap > 0 ? (totalSpend / totalCap) * 100 : 0;
  const activeGuardrails = budgets.filter((b) => b.status !== "PAUSED").length;

  const getStatusBadge = (status: BudgetDisplayItem["status"]) => {
    switch (status) {
      case "HEALTHY":
        return "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30";
      case "WARNING":
        return "bg-[#DFB277]/10 text-[#DFB277] border-[#DFB277]/30";
      case "CRITICAL":
      case "EXCEEDED":
        return "bg-red-950/40 text-red-400 border-red-800/30";
      case "PAUSED":
        return "bg-neutral-900 text-neutral-400 border-neutral-700/40";
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-200 flex flex-col lg:flex-row selection:bg-[#DFB277] selection:text-[#0E0E0E] font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#DFB277] tracking-wider uppercase mb-1 font-mono">
                  <Zap className="w-3 h-3 text-[#DFB277]" />
                  <span>GOVERNANCE</span>
                  <span className="text-neutral-600">/</span>
                  <span className="text-neutral-400">BUDGETS & GUARDRAILS</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Spending Limits & Guardrails
                  </h1>
                  <div className="w-6 h-6 rounded-md border border-[#DFB277]/40 bg-[#DFB277]/10 flex items-center justify-center text-[#DFB277]">
                    <Wallet className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Enforce automated threshold alerts, quota caps, and circuit-breaking rate limits across your workspace.
                </p>
              </div>

              {/* Header Action Button */}
              <RbacGuard permission="budgets:manage">
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] text-xs font-bold font-mono rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Budget Cap</span>
                </button>
              </RbacGuard>
            </div>

            {/* 4 Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Total Cap */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#DFB277]/10 border border-[#DFB277]/20 flex items-center justify-center text-[#DFB277]">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-neutral-400 font-mono uppercase">Total Allocated Cap</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">${totalCap.toFixed(2)}</div>
                  <div className="text-[10.5px] text-neutral-500 font-mono">Across {budgets.length} configured limits</div>
                </div>
              </div>

              {/* Card 2: Current Incurred Spend */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-neutral-400 font-mono uppercase">Live Incurred Spend</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">${totalSpend.toFixed(2)}</div>
                  <div className="text-[10.5px] text-[#10B981] font-mono">
                    ${Math.max(0, totalCap - totalSpend).toFixed(2)} headroom remaining
                  </div>
                </div>
              </div>

              {/* Card 3: Overall Utilization */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#DFB277]/10 border border-[#DFB277]/20 flex items-center justify-center text-[#DFB277]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-neutral-400 font-mono uppercase">Quota Utilization</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">{overallUtil.toFixed(1)}%</div>
                  <div className="text-[10.5px] text-neutral-500 font-mono">
                    {overallUtil >= 90 ? "Threshold Alert" : "Normal operating range"}
                  </div>
                </div>
              </div>

              {/* Card 4: Active Circuit Breakers */}
              <div className="p-3.5 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#DFB277]/10 border border-[#DFB277]/20 flex items-center justify-center text-[#DFB277]">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-neutral-400 font-mono uppercase">Guardrails</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5 font-mono">{activeGuardrails} Active</div>
                  <div className="text-[10.5px] text-[#10B981] font-mono">Real-time enforcement</div>
                </div>
              </div>
            </div>

            {/* Main Budgets List Card */}
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0E0E0E] p-4.5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#161616]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#DFB277]" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono">Configured Budget Limits</h3>
                </div>
                <span className="text-xs font-mono text-neutral-400">{budgets.length} limits active</span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-neutral-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#DFB277] mb-2" />
                  <span>Loading budget policies...</span>
                </div>
              ) : budgets.length === 0 ? (
                <div className="p-12 text-center space-y-3 bg-[#0A0A0A] rounded-xl border border-[#161616]">
                  <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-center mx-auto text-[#DFB277]">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold text-white">No budget limits configured</div>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Configure budget caps with soft email alerts and hard circuit breaker blocks to guard against unexpected LLM spikes.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DFB277] text-[#0E0E0E] text-xs font-semibold hover:bg-[#E5C38E] transition-all cursor-pointer font-mono"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Your First Budget</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {budgets.map((b) => {
                    const remaining = Math.max(0, b.limitUsd - b.currentSpendUsd);
                    return (
                      <div
                        key={b.id}
                        className="p-4 rounded-xl bg-[#0A0A0A] border border-[#161616] hover:border-[#222222] transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm font-mono">{b.name}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getStatusBadge(b.status)}`}>
                                {b.status}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-500 font-mono mt-0.5">
                              {b.scope} · {b.period} · {b.enforcementMode === "HARD_BLOCK" ? "Hard Circuit Breaker" : "Soft Alert"}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-right font-mono">
                            <div>
                              <div className="text-sm font-bold text-white">
                                ${b.currentSpendUsd.toFixed(2)}{" "}
                                <span className="text-xs text-neutral-500">/ ${b.limitUsd.toFixed(2)}</span>
                              </div>
                              <div className="text-xs text-[#10B981]">${remaining.toFixed(2)} remaining</div>
                            </div>

                            <button
                              type="button"
                              onClick={() => togglePause(b.id)}
                              className="p-1.5 rounded-lg bg-[#141414] border border-[#222222] hover:border-[#DFB277]/40 text-neutral-400 hover:text-white transition-all cursor-pointer"
                              title={b.status === "PAUSED" ? "Resume Guardrail" : "Pause Guardrail"}
                            >
                              {b.status === "PAUSED" ? <Play className="w-3.5 h-3.5 text-[#10B981]" /> : <Pause className="w-3.5 h-3.5 text-neutral-400" />}
                            </button>
                          </div>
                        </div>

                        {/* Utilization Bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-[#161616] h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                b.utilizationPercent >= 90
                                  ? "bg-red-500"
                                  : b.utilizationPercent >= 75
                                  ? "bg-[#DFB277]"
                                  : "bg-[#10B981]"
                              }`}
                              style={{ width: `${Math.min(100, b.utilizationPercent)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10.5px] font-mono text-neutral-500">
                            <span>{b.utilizationPercent.toFixed(1)}% consumed</span>
                            <span>Cap: ${b.limitUsd.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ContentTransition>
      </main>

      {/* Create Budget Modal */}
      <CreateBudgetModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onBudgetCreated={handleBudgetCreated}
      />
    </div>
  );
}

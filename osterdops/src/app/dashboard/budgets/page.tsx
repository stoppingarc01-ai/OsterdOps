"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Wallet,
  Plus,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Coins,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import { RbacGuard } from "@/components/auth/RbacGuard";
import { CreateBudgetModal } from "@/components/billing/CreateBudgetModal";

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
          const current = b.currentSpendUsd || b.spendUsd || 0;
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
  }, [currentOrg, getIdToken]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleBudgetCreated = (newBudget: any) => {
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
  const totalSpend = budgets.reduce((acc, b) => acc + b.currentSpendUsd, 0);
  const overallUtil = totalCap > 0 ? (totalSpend / totalCap) * 100 : 0;
  const activeGuardrails = budgets.filter((b) => b.status !== "PAUSED").length;

  const getStatusBadge = (status: BudgetDisplayItem["status"]) => {
    switch (status) {
      case "HEALTHY":
        return "bg-emerald-950/60 text-emerald-400 border-emerald-800/40";
      case "WARNING":
        return "bg-amber-950/60 text-amber-400 border-amber-800/40";
      case "CRITICAL":
        return "bg-rose-950/60 text-rose-400 border-rose-800/40";
      case "EXCEEDED":
        return "bg-red-950/60 text-red-400 border-red-800/40";
      case "PAUSED":
        return "bg-zinc-900 text-zinc-400 border-zinc-700/40";
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3 h-3 text-[#dfba82]" />
                  <span>GOVERNANCE</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">BUDGETS</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Spending Limits & Guardrails
                  </h1>
                  <div className="w-5 h-5 rounded-md border border-[#dfba82]/40 bg-[#dfba82]/10 flex items-center justify-center text-[#dfba82]">
                    <Wallet className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Enforce automated threshold alerts, quota caps, and circuit-breaking rate limits across your workspace.
                </p>
              </div>

              {/* Header Action Button */}
              <RbacGuard permission="budgets:manage">
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd4aa] text-black text-xs font-bold rounded-xl shadow-[0_2px_12px_rgba(223,186,130,0.25)] transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Budget Cap</span>
                </button>
              </RbacGuard>
            </div>

            {/* 5 Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Total Cap */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium flex items-center gap-1">
                      Total Allocated Cap
                      <Info className="w-3 h-3 text-[#555a6d]" />
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">${totalCap.toFixed(2)}</div>
                  <div className="text-[10.5px] text-[#8e93a6]">Across {budgets.length} configured limits</div>
                </div>
                {/* Gold Sparkline */}
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 45 28, 65 32 C 80 34, 88 12, 100 6"
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 2: Current Incurred Spend */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Incurred Spend</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">${totalSpend.toFixed(2)}</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">
                    ${Math.max(0, totalCap - totalSpend).toFixed(2)} headroom
                  </div>
                </div>
                {/* Green Sparkline */}
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 36 C 25 35, 50 38, 70 20 C 85 10, 92 16, 100 8"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 3: Overall Utilization */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Cap Utilization</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{overallUtil.toFixed(1)}%</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">
                    {overallUtil >= 90 ? "Critical Threshold" : "Healthy Pace"}
                  </div>
                </div>
                {/* Cyan Sparkline */}
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 34 C 20 30, 40 18, 60 26 C 75 30, 85 12, 100 6"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 4: Active Guardrails */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Active Guardrails</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{activeGuardrails}</div>
                  <div className="text-[10.5px] text-purple-400 font-medium">Automated enforcement</div>
                </div>
                {/* Purple Sparkline */}
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 40 32, 60 22 C 75 14, 85 18, 100 8"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 5: Enforcement Policy */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-orange-950/40 border border-orange-800/30 flex items-center justify-center text-orange-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Enforcement</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">Strict</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Zero unauthorized overruns</div>
                </div>
                {/* Orange Sparkline */}
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 32 C 25 30, 45 22, 65 24 C 80 26, 88 12, 100 6"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Budgets Table */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] overflow-hidden shadow-xl">
              <div className="p-4 border-b border-[#161824] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Active Budget Policies</h2>
                  <span className="text-[11px] text-[#6b7082]">({budgets.length} configured)</span>
                </div>
                <button
                  type="button"
                  onClick={fetchBudgets}
                  className="p-1.5 rounded-lg bg-[#141624] border border-[#23273a] text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                  title="Refresh budgets"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-[#6b7082] space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
                  <div>Loading budget policies...</div>
                </div>
              ) : budgets.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white">No Budgets Configured</div>
                  <p className="text-xs text-[#8e93a6] max-w-sm mx-auto">
                    Protect your organization from accidental spend spikes by creating your first automated budget cap.
                  </p>
                  <RbacGuard permission="budgets:manage">
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl text-xs hover:bg-[#ebd4aa] transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Create First Budget Cap</span>
                    </button>
                  </RbacGuard>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#161824] text-[10.5px] uppercase tracking-wider text-[#555a6d] font-semibold">
                        <th className="py-3 px-4">Budget Name</th>
                        <th className="py-3 px-4">Scope & Period</th>
                        <th className="py-3 px-4">Spend / Limit</th>
                        <th className="py-3 px-4">Utilization</th>
                        <th className="py-3 px-4">Enforcement</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141724]">
                      {budgets.map((b) => (
                        <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">{b.name}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-[#c5c9d6] block font-mono text-[11px]">{b.scope}</span>
                            <span className="text-[10px] text-[#73788c] font-medium">{b.period}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className="text-[#dfba82] font-bold">${b.currentSpendUsd.toFixed(2)}</span>
                            <span className="text-[#73788c]"> / ${b.limitUsd.toFixed(2)}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="w-28 space-y-1">
                              <div className="flex justify-between text-[10px] text-[#8e93a6]">
                                <span>{b.utilizationPercent.toFixed(1)}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[#161928] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    b.utilizationPercent >= 90
                                      ? "bg-rose-500"
                                      : b.utilizationPercent >= 70
                                      ? "bg-amber-400"
                                      : "bg-emerald-400"
                                  }`}
                                  style={{ width: `${Math.min(b.utilizationPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-[#161928] text-[10px] font-mono text-[#c5c9d6]">
                              {b.enforcementMode}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(b.status)}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <RbacGuard permission="budgets:manage">
                              <button
                                onClick={() => handleEvaluate(b.id)}
                                disabled={evaluating === b.id}
                                title="Evaluate spend"
                                className="p-1 text-[#8e93a6] hover:text-[#dfba82] transition-colors cursor-pointer"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${evaluating === b.id ? "animate-spin" : ""}`} />
                              </button>
                              <button
                                onClick={() => togglePause(b.id)}
                                title={b.status === "PAUSED" ? "Resume budget" : "Pause budget"}
                                className="p-1 text-[#8e93a6] hover:text-[#dfba82] transition-colors cursor-pointer"
                              >
                                {b.status === "PAUSED" ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                              </button>
                            </RbacGuard>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Governance Banner */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Automated Budget Guardrail Active</div>
                  <div className="text-[11.5px] text-[#8e93a6]">
                    Budgets with Hard Block enforcement automatically reject unbudgeted requests at 100% capacity with HTTP 429.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfba82] hover:text-[#ebd4aa] transition-colors shrink-0 cursor-pointer"
              >
                <span>Add Budget Limit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </ContentTransition>
      </main>

      <CreateBudgetModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onBudgetCreated={handleBudgetCreated}
      />
    </div>
  );
}

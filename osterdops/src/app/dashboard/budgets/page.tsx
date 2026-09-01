"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Wallet, Plus, Play, Pause, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
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

const INITIAL_BUDGETS: BudgetDisplayItem[] = [
  {
    id: "bud_01",
    name: "Organization Master Cap",
    scope: "ORGANIZATION",
    period: "MONTHLY",
    limitUsd: 500.0,
    currentSpendUsd: 142.85,
    utilizationPercent: 28.57,
    enforcementMode: "HARD_BLOCK",
    status: "HEALTHY",
  },
  {
    id: "bud_02",
    name: "Customer Support Agent Cap",
    scope: "PROJECT",
    period: "MONTHLY",
    limitUsd: 100.0,
    currentSpendUsd: 74.2,
    utilizationPercent: 74.2,
    enforcementMode: "SOFT_ALERT",
    status: "WARNING",
  },
  {
    id: "bud_03",
    name: "Staging Auto-Eval Quota",
    scope: "PROJECT",
    period: "WEEKLY",
    limitUsd: 25.0,
    currentSpendUsd: 24.8,
    utilizationPercent: 99.2,
    enforcementMode: "HARD_BLOCK",
    status: "CRITICAL",
  },
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetDisplayItem[]>(INITIAL_BUDGETS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [evaluating, setEvaluating] = useState<string | null>(null);

  const togglePause = (id: string) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newStatus = b.status === "PAUSED" ? "HEALTHY" : "PAUSED";
          return { ...b, status: newStatus };
        }
        return b;
      })
    );
  };

  const handleEvaluate = (id: string) => {
    setEvaluating(id);
    setTimeout(() => {
      setEvaluating(null);
    }, 600);
  };

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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Wallet className="w-3.5 h-3.5" />
                  Budget Enforcement
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Spending Limits & Guardrails
                </h1>
              </div>

              <RbacGuard permission="budgets:manage">
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.2)]"
                >
                  <Plus className="w-4 h-4" />
                  Create Budget Cap
                </button>
              </RbacGuard>
            </div>

            {/* Budgets Table */}
            <div className="rounded-xl border border-[#1b1e2c] bg-[#0c0e17] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111422] text-[#8e93a6] border-b border-[#1b1e2c]">
                    <tr>
                      <th className="p-3.5 font-semibold">Budget Name</th>
                      <th className="p-3.5 font-semibold">Scope & Period</th>
                      <th className="p-3.5 font-semibold">Spend / Limit</th>
                      <th className="p-3.5 font-semibold">Utilization</th>
                      <th className="p-3.5 font-semibold">Enforcement</th>
                      <th className="p-3.5 font-semibold">Status</th>
                      <th className="p-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161928]">
                    {budgets.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-semibold text-white">{b.name}</td>
                        <td className="p-3.5">
                          <span className="text-[#c5c9d6] block">{b.scope}</span>
                          <span className="text-[10px] text-[#73788c] font-medium">{b.period}</span>
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="text-[#dfba82] font-bold">${b.currentSpendUsd.toFixed(2)}</span>
                          <span className="text-[#73788c]"> / ${b.limitUsd.toFixed(2)}</span>
                        </td>
                        <td className="p-3.5">
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
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#161928] text-[10px] font-mono text-[#c5c9d6]">
                            {b.enforcementMode}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(b.status)}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
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
            </div>
          </div>
        </ContentTransition>
      </main>

      <CreateBudgetModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}

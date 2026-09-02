"use client";

import React, { useEffect, useState } from "react";
import {
  Coins,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Edit2,
  Trash2,
  Pause,
  Play,
  X,
  Zap,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import type { Budget } from "@/types";

interface AdminBudget {
  id: string;
  name: string;
  scopeType: "ORGANIZATION" | "PROJECT";
  targetName: string;
  budgetAmountUsd: number;
  currentSpendUsd: number;
  enforceHardLimit: boolean;
  thresholds: number[];
  status: "ACTIVE" | "PAUSED" | "EXCEEDED";
  billingPeriod: string;
}

export function AdminBudgetsView() {
  const { currentOrg, getIdToken } = useAuth();
  const [budgets, setBudgets] = useState<AdminBudget[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetScope, setNewBudgetScope] = useState<"ORGANIZATION" | "PROJECT">("PROJECT");
  const [newBudgetTarget, setNewBudgetTarget] = useState("Production Gateway");
  const [newBudgetAmount, setNewBudgetAmount] = useState(500);
  const [newBudgetHardLimit, setNewBudgetHardLimit] = useState(true);
  const [editingBudget, setEditingBudget] = useState<AdminBudget | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBudgets() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<Budget[]>("/api/v1/budgets", {
          params: { organizationId: currentOrg.id },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data)) {
          const mapped: AdminBudget[] = res.data.map((b: any) => ({
            id: b.id,
            name: b.name || "Spending Limit",
            scopeType: b.scope === "project" ? "PROJECT" : "ORGANIZATION",
            targetName: b.resourceName || currentOrg.name || "Workspace",
            budgetAmountUsd: b.monthlyCap || b.limitAmount || 500,
            currentSpendUsd: b.currentSpend ?? 0,
            enforceHardLimit: b.policyAction === "hard_stop",
            thresholds: b.alertThresholds || [80, 100],
            status: b.status === "paused" ? "PAUSED" : "ACTIVE",
            billingPeriod: "Monthly",
          }));
          setBudgets(mapped);
        } else {
          setBudgets([]);
        }
      } catch (err) {
        if (isMounted) setBudgets([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBudgets();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const filteredBudgets = budgets.filter((b) => {
    return (
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.targetName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName) return;

    const newBg: AdminBudget = {
      id: `bg_${Date.now()}`,
      name: newBudgetName,
      scopeType: newBudgetScope,
      targetName: newBudgetTarget,
      budgetAmountUsd: newBudgetAmount,
      currentSpendUsd: 0,
      enforceHardLimit: newBudgetHardLimit,
      thresholds: [80, 100],
      status: "ACTIVE",
      billingPeriod: "Monthly",
    };

    setBudgets([newBg, ...budgets]);
    setNewBudgetName("");
    setIsCreateModalOpen(false);
  };

  const handleTogglePause = (budget: AdminBudget) => {
    setBudgets(
      budgets.map((b) =>
        b.id === budget.id
          ? { ...b, status: b.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }
          : b
      )
    );
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(budgets.filter((b) => b.id !== budgetId));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;

    setBudgets(
      budgets.map((b) => (b.id === editingBudget.id ? editingBudget : b))
    );
    setEditingBudget(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search budgets or targets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0c0f16] border border-[#171b26] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
          />
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Cap</span>
        </button>
      </div>

      {/* Budgets Grid / Empty State */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
          <div>Loading budget caps...</div>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#73788c] bg-[#0c0f16] rounded-2xl border border-[#171b26] space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
            <Coins className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold text-white">No budget limits configured</div>
          <p className="text-[11px] text-[#73788c] max-w-sm mx-auto">
            Set up organizational spending limits to trigger alerts or automatically halt inference when capacity is exceeded.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBudgets.map((budget) => {
            const utilPct = Math.min(
              100,
              Math.round((budget.currentSpendUsd / (budget.budgetAmountUsd || 1)) * 100)
            );

            return (
              <div
                key={budget.id}
                className="bg-[#0c0f16] border border-[#171b26] hover:border-[#dfba82]/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white font-serif">{budget.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            budget.status === "ACTIVE"
                              ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                              : "bg-amber-950/60 text-amber-400 border-amber-800/40"
                          }`}
                        >
                          {budget.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#717688] font-mono mt-0.5">
                        {budget.scopeType}: {budget.targetName}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePause(budget)}
                        className="p-1.5 hover:bg-[#1b202e] rounded-lg text-[#8e93a6] hover:text-[#dfba82] transition-colors cursor-pointer"
                        title={budget.status === "ACTIVE" ? "Pause Enforcement" : "Resume Enforcement"}
                      >
                        {budget.status === "ACTIVE" ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingBudget(budget)}
                        className="p-1.5 hover:bg-[#1b202e] rounded-lg text-[#8e93a6] hover:text-[#dfba82] transition-colors cursor-pointer"
                        title="Edit Budget"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-1.5 hover:bg-rose-950/40 rounded-lg text-[#8e93a6] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Utilization Gauge */}
                  <div className="mt-4 p-4 rounded-xl bg-[#07080c] border border-[#171b26] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8e93a6]">Current Spend</span>
                      <span className="font-mono text-white font-semibold">
                        ${budget.currentSpendUsd.toFixed(2)}{" "}
                        <span className="text-[#717688]">/ ${budget.budgetAmountUsd.toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="w-full bg-[#1b202e] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          utilPct > 90 ? "bg-rose-500" : utilPct > 70 ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                        style={{ width: `${utilPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#8e93a6]">
                      <span>{utilPct}% consumed</span>
                      <span>
                        ${Math.max(0, budget.budgetAmountUsd - budget.currentSpendUsd).toFixed(2)} headroom
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#171b26] flex items-center justify-between text-[11px] text-[#8e93a6]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        budget.enforceHardLimit ? "bg-rose-400" : "bg-amber-400"
                      }`}
                    />
                    <span>{budget.enforceHardLimit ? "Hard Cap (Throttled)" : "Soft Alert (Warn Only)"}</span>
                  </div>
                  <span>{budget.billingPeriod}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Create Budget */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#171b26]">
              <h3 className="text-base font-bold text-white">Create Budget Guardrail</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#717688] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Budget Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Main Cap"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Scope Type
                </label>
                <select
                  value={newBudgetScope}
                  onChange={(e) =>
                    setNewBudgetScope(e.target.value as "ORGANIZATION" | "PROJECT")
                  }
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="ORGANIZATION">Organization Wide</option>
                  <option value="PROJECT">Specific Project</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Monthly Cap (USD)
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(Number(e.target.value))}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82] font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hardLimitCheck"
                  checked={newBudgetHardLimit}
                  onChange={(e) => setNewBudgetHardLimit(e.target.checked)}
                  className="rounded border-[#1b202e] bg-[#111422] text-[#dfba82]"
                />
                <label htmlFor="hardLimitCheck" className="text-xs text-[#c5c9d6]">
                  Enforce circuit-breaker hard limit (reject requests when reached)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#171b26]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8e93a6] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] text-black font-semibold text-xs rounded-xl hover:bg-[#ebd2a9]"
                >
                  Save Budget Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Budget */}
      {editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#171b26]">
              <h3 className="text-base font-bold text-white">Edit Budget Cap</h3>
              <button onClick={() => setEditingBudget(null)} className="text-[#717688] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Budget Name
                </label>
                <input
                  type="text"
                  required
                  value={editingBudget.name}
                  onChange={(e) =>
                    setEditingBudget({ ...editingBudget, name: e.target.value })
                  }
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Monthly Cap (USD)
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={editingBudget.budgetAmountUsd}
                  onChange={(e) =>
                    setEditingBudget({
                      ...editingBudget,
                      budgetAmountUsd: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#171b26]">
                <button
                  type="button"
                  onClick={() => setEditingBudget(null)}
                  className="px-4 py-2 text-xs text-[#8e93a6] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] text-black font-semibold text-xs rounded-xl hover:bg-[#ebd2a9]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Coins,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  X,
  Search,
} from "lucide-react";

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

const INITIAL_BUDGETS: AdminBudget[] = [
  {
    id: "bg_org_main",
    name: "Organization Master Budget",
    scopeType: "ORGANIZATION",
    targetName: "Acme Enterprises",
    budgetAmountUsd: 2500,
    currentSpendUsd: 1842.2,
    enforceHardLimit: true,
    thresholds: [50, 80, 100],
    status: "ACTIVE",
    billingPeriod: "Monthly (May 2025)",
  },
  {
    id: "bg_proj_prod",
    name: "Production Gateway Limit",
    scopeType: "PROJECT",
    targetName: "Production Gateway",
    budgetAmountUsd: 1500,
    currentSpendUsd: 1140.5,
    enforceHardLimit: true,
    thresholds: [80, 100],
    status: "ACTIVE",
    billingPeriod: "Monthly (May 2025)",
  },
  {
    id: "bg_proj_stg",
    name: "Staging Pipeline Cap",
    scopeType: "PROJECT",
    targetName: "Staging LLM Pipeline",
    budgetAmountUsd: 600,
    currentSpendUsd: 412.2,
    enforceHardLimit: false,
    thresholds: [50, 90],
    status: "ACTIVE",
    billingPeriod: "Monthly (May 2025)",
  },
  {
    id: "bg_proj_rag",
    name: "RAG Indexer Budget",
    scopeType: "PROJECT",
    targetName: "RAG Knowledge Indexer",
    budgetAmountUsd: 400,
    currentSpendUsd: 289.5,
    enforceHardLimit: true,
    thresholds: [75, 100],
    status: "ACTIVE",
    billingPeriod: "Monthly (May 2025)",
  },
];

export function AdminBudgetsView() {
  const [budgets, setBudgets] = useState<AdminBudget[]>(INITIAL_BUDGETS);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetScope, setNewBudgetScope] = useState<"ORGANIZATION" | "PROJECT">("PROJECT");
  const [newBudgetTarget, setNewBudgetTarget] = useState("Production Gateway");
  const [newBudgetAmount, setNewBudgetAmount] = useState(500);
  const [newBudgetHardLimit, setNewBudgetHardLimit] = useState(true);
  const [editingBudget, setEditingBudget] = useState<AdminBudget | null>(null);

  const filteredBudgets = budgets.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.targetName.toLowerCase().includes(search.toLowerCase())
  );

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
    if (confirm("Delete this budget constraint?")) {
      setBudgets(budgets.filter((b) => b.id !== budgetId));
    }
  };

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
      billingPeriod: "Monthly (May 2025)",
    };

    setBudgets([newBg, ...budgets]);
    setNewBudgetName("");
    setIsCreateModalOpen(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;
    setBudgets(
      budgets.map((b) => (b.id === editingBudget.id ? editingBudget : b))
    );
    setEditingBudget(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search budgets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3.5 py-2 bg-[#0c0f16] border border-[#171b26] rounded-xl text-xs text-white placeholder:text-[#555a6d] focus:outline-none focus:border-[#dfba82] w-64"
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

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBudgets.map((budget) => {
          const utilPct = Math.min(
            100,
            Math.round((budget.currentSpendUsd / budget.budgetAmountUsd) * 100)
          );

          return (
            <div
              key={budget.id}
              className={`bg-[#0c0f16] border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                budget.status === "ACTIVE"
                  ? "border-[#171b26] hover:border-[#dfba82]/40"
                  : "border-[#171b26]/60 opacity-60"
              }`}
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
                      <span className="text-[#717688]">/ ${budget.budgetAmountUsd.toFixed(2)}</span>
                    </span>
                  </div>

                  <div className="w-full bg-[#1b202e] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        utilPct >= 100
                          ? "bg-rose-500"
                          : utilPct >= 80
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                      style={{ width: `${utilPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#717688]">
                    <span>Utilization: <strong className="text-white">{utilPct}%</strong></span>
                    <span>Mode: <strong className={budget.enforceHardLimit ? "text-amber-400" : "text-[#8e93a6]"}>{budget.enforceHardLimit ? "Hard Block (429)" : "Soft Alert"}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#171b26] flex items-center justify-between text-[11px] text-[#8e93a6]">
                <span>Thresholds: {budget.thresholds.map((t) => `${t}%`).join(", ")}</span>
                <span>{budget.billingPeriod}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Budget Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#171b26] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#dfba82]" />
                Create Budget Guardrail
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#717688] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Budget Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Production Cap"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Scope</label>
                <select
                  value={newBudgetScope}
                  onChange={(e) =>
                    setNewBudgetScope(e.target.value as "ORGANIZATION" | "PROJECT")
                  }
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                >
                  <option value="PROJECT">Project Specific</option>
                  <option value="ORGANIZATION">Entire Organization</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Monthly Ceiling ($USD)</label>
                <input
                  type="number"
                  min="50"
                  max="50000"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(Number(e.target.value))}
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hardLimit"
                  checked={newBudgetHardLimit}
                  onChange={(e) => setNewBudgetHardLimit(e.target.checked)}
                  className="rounded border-[#1b202e] bg-[#07080c] text-[#dfba82] focus:ring-0"
                />
                <label htmlFor="hardLimit" className="text-[#8e93a6] cursor-pointer">
                  Enforce Hard Limit (Reject requests with HTTP 429 when cap reached)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold cursor-pointer shadow-md"
                >
                  Create Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#171b26] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#dfba82]" />
                Edit Budget
              </h3>
              <button
                onClick={() => setEditingBudget(null)}
                className="text-[#717688] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Budget Name</label>
                <input
                  type="text"
                  required
                  value={editingBudget.name}
                  onChange={(e) =>
                    setEditingBudget({ ...editingBudget, name: e.target.value })
                  }
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Budget Limit ($USD)</label>
                <input
                  type="number"
                  value={editingBudget.budgetAmountUsd}
                  onChange={(e) =>
                    setEditingBudget({
                      ...editingBudget,
                      budgetAmountUsd: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editHardLimit"
                  checked={editingBudget.enforceHardLimit}
                  onChange={(e) =>
                    setEditingBudget({
                      ...editingBudget,
                      enforceHardLimit: e.target.checked,
                    })
                  }
                  className="rounded border-[#1b202e] bg-[#07080c] text-[#dfba82] focus:ring-0"
                />
                <label htmlFor="editHardLimit" className="text-[#8e93a6] cursor-pointer">
                  Enforce Hard Limit (HTTP 429 on breach)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBudget(null)}
                  className="px-4 py-2 rounded-xl text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold cursor-pointer shadow-md"
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

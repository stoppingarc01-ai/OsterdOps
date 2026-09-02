"use client";

import React, { useEffect, useState } from "react";
import { Search, ChevronDown, Plus, ShieldAlert, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import type { Budget } from "@/types";

interface BudgetCapsTableCardProps {
  onOpenCreateBudget: () => void;
}

export function BudgetCapsTableCard({ onOpenCreateBudget }: BudgetCapsTableCardProps) {
  const { currentOrg, getIdToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchBudgets() {
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
          setBudgets(res.data);
        } else {
          setBudgets([]);
        }
      } catch (err) {
        if (isMounted) setBudgets([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBudgets();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const filtered = budgets.filter((item) => {
    const name = item.name || item.scope || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#787d91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search budget caps..."
              className="w-full bg-[#0d0f18] border border-[#1d202e] focus:border-[#dfba82] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#52576b] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Add Budget Button */}
        <button
          type="button"
          onClick={onOpenCreateBudget}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Budget Cap</span>
        </button>
      </div>

      {/* Table Container Card */}
      <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#f4efe6]">
            Active Spending Limits & Budget Caps ({filtered.length})
          </h3>
        </div>

        {/* Table / Empty State */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Loading budget caps...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#73788c] bg-[#090b12] rounded-xl border border-[#161824] space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white">No budget caps configured</div>
              <p className="text-[11px] text-[#73788c] max-w-sm mx-auto">
                Create proactive spending guardrails to automatically warn or throttle LLM requests before budget overruns occur.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-medium">Budget Name</th>
                  <th className="pb-3 font-medium">Scope</th>
                  <th className="pb-3 font-medium text-right">Monthly Cap</th>
                  <th className="pb-3 font-medium text-right">Current Spend</th>
                  <th className="pb-3 font-medium w-36">Utilization</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151826]">
                {filtered.map((item) => {
                  const cap = item.monthlyCap || item.limitAmount || 1;
                  const spend = item.currentSpend ?? 0;
                  const util = Math.min(100, (spend / cap) * 100);

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-white">
                        {item.name}
                      </td>
                      <td className="py-3.5 pr-4 text-[#8e93a6] uppercase font-mono text-[11px]">
                        {item.scope || "GLOBAL"}
                      </td>
                      <td className="py-3.5 pr-4 text-right font-mono font-bold text-white">
                        ${cap.toFixed(2)}
                      </td>
                      <td className="py-3.5 pr-4 text-right font-mono text-[#dfba82]">
                        ${spend.toFixed(2)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="space-y-1">
                          <div className="text-[10px] text-[#8e93a6] text-right font-mono">{util.toFixed(1)}%</div>
                          <div className="w-full h-1.5 bg-[#141724] rounded-full overflow-hidden">
                            <div className="h-full bg-[#dfba82] rounded-full" style={{ width: `${util}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                          {item.status || "ACTIVE"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

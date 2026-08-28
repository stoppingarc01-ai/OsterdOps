"use client";

import React, { useState } from "react";
import { Search, ChevronDown, Plus, MoreVertical, ShieldAlert, Zap, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

interface BudgetCapItem {
  id: string;
  scope: string;
  type: "Team Budget" | "Project" | "Model Limit";
  thresholdType: string;
  monthlyCap: string;
  currentSpend: string;
  utilizationPct: number;
  policyAction: string;
  status: "Healthy" | "Warning" | "Breached";
}

const BUDGET_DATA: BudgetCapItem[] = [
  {
    id: "1",
    scope: "AI Core Engineering",
    type: "Team Budget",
    thresholdType: "Soft Cap (80%) + Throttle",
    monthlyCap: "$20,000.00",
    currentSpend: "$16,085.12",
    utilizationPct: 80.4,
    policyAction: "Warn Lead + Route mini",
    status: "Healthy",
  },
  {
    id: "2",
    scope: "Customer Support Assistant",
    type: "Project",
    thresholdType: "Hard Stop (100%)",
    monthlyCap: "$12,000.00",
    currentSpend: "$10,850.40",
    utilizationPct: 90.4,
    policyAction: "Fallback to gpt-4o-mini",
    status: "Warning",
  },
  {
    id: "3",
    scope: "ML Ops Fine-Tuning",
    type: "Team Budget",
    thresholdType: "Soft Cap (85%)",
    monthlyCap: "$12,000.00",
    currentSpend: "$10,158.87",
    utilizationPct: 84.6,
    policyAction: "Slack #ai-alerts page",
    status: "Healthy",
  },
  {
    id: "4",
    scope: "Product AI Search",
    type: "Project",
    thresholdType: "Auto-Compression",
    monthlyCap: "$8,000.00",
    currentSpend: "$5,420.00",
    utilizationPct: 67.7,
    policyAction: "Compress Prompt Context",
    status: "Healthy",
  },
  {
    id: "5",
    scope: "Data Platform ETL",
    type: "Team Budget",
    thresholdType: "Soft Cap (85%)",
    monthlyCap: "$6,000.00",
    currentSpend: "$5,079.44",
    utilizationPct: 84.6,
    policyAction: "Email Finance Admins",
    status: "Healthy",
  },
  {
    id: "6",
    scope: "Growth Marketing Lab",
    type: "Team Budget",
    thresholdType: "Hard Stop (100%)",
    monthlyCap: "$4,000.00",
    currentSpend: "$3,386.06",
    utilizationPct: 84.6,
    policyAction: "Reject Excess Prompts",
    status: "Healthy",
  },
  {
    id: "7",
    scope: "Research Experimental Lab",
    type: "Project",
    thresholdType: "Soft Cap (90%)",
    monthlyCap: "$3,000.00",
    currentSpend: "$1,240.00",
    utilizationPct: 41.3,
    policyAction: "Log Telemetry Span",
    status: "Healthy",
  },
];

interface BudgetCapsTableCardProps {
  onOpenCreateBudget: () => void;
}

export function BudgetCapsTableCard({ onOpenCreateBudget }: BudgetCapsTableCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("All Scopes");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filtered = BUDGET_DATA.filter((item) => {
    const matchesSearch =
      item.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.policyAction.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = scopeFilter === "All Scopes" || item.type === scopeFilter;
    const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
    return matchesSearch && matchesScope && matchesStatus;
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

          {/* Scope Filter */}
          <div className="relative">
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="bg-[#0d0f18] border border-[#1d202e] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="All Scopes">All Scopes</option>
              <option value="Team Budget">Team Budgets</option>
              <option value="Project">Projects</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0d0f18] border border-[#1d202e] rounded-xl px-3 py-2 text-xs text-[#c5c9d6] focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="All Status">All Status</option>
              <option value="Healthy">Healthy (&lt;85%)</option>
              <option value="Warning">Warning (&gt;85%)</option>
              <option value="Breached">Breached (100%)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#787d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-medium">Budget Scope / Target</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium text-right">Monthly Cap</th>
                <th className="pb-3 font-medium text-right">Current Spend</th>
                <th className="pb-3 font-medium w-36">Utilization %</th>
                <th className="pb-3 font-medium">Auto-Policy Action</th>
                <th className="pb-3 font-medium text-center">Status</th>
                <th className="pb-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151826]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Scope */}
                  <td className="py-3.5 pr-4">
                    <div className="font-semibold text-white tracking-tight">{item.scope}</div>
                    <div className="text-[10.5px] text-[#73788c] font-mono">{item.thresholdType}</div>
                  </td>

                  {/* Type Badge */}
                  <td className="py-3.5 pr-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#141724] border border-[#1f2335] text-[#c5c9d6] font-medium text-[11px]">
                      {item.type}
                    </span>
                  </td>

                  {/* Monthly Cap */}
                  <td className="py-3.5 pr-4 text-right font-mono font-bold text-white">
                    {item.monthlyCap}
                  </td>

                  {/* Current Spend */}
                  <td className="py-3.5 pr-4 text-right font-mono font-bold text-[#dfba82]">
                    {item.currentSpend}
                  </td>

                  {/* Utilization Progress Bar */}
                  <td className="py-3.5 pr-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8e93a6]">
                        <span>{item.utilizationPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#171a27] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.utilizationPct > 85 ? "bg-[#f59e0b]" : "bg-[#dfba82]"
                          }`}
                          style={{ width: `${item.utilizationPct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Policy Action */}
                  <td className="py-3.5 pr-4">
                    <span className="text-[11.5px] text-[#c5c9d6] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#dfba82]" />
                      <span>{item.policyAction}</span>
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        item.status === "Healthy" ? "text-[#4ade80]" : "text-[#f59e0b]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === "Healthy" ? "bg-[#4ade80]" : "bg-[#f59e0b]"
                        }`}
                      />
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-center">
                    <button
                      type="button"
                      className="p-1 text-[#787d91] hover:text-white transition-colors cursor-pointer"
                      title="Edit Limit"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#171a27] text-xs text-[#73788c]">
          <div>Showing 1 to 7 of 8 active budget limits</div>

          <div className="flex items-center gap-2">
            <button type="button" className="p-1.5 rounded-lg border border-[#232738] hover:text-white transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="w-7 h-7 rounded-lg bg-[#dfba82] text-[#090a0f] font-bold text-xs">
              1
            </button>
            <button type="button" className="p-1.5 rounded-lg border border-[#232738] hover:text-white transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

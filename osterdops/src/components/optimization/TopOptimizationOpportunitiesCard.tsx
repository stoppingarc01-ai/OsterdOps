"use client";

import React, { useState } from "react";
import { ArrowRight, MoreVertical, Zap, Minimize2, Database, Clock, Trash2, Check } from "lucide-react";

interface OpportunityItem {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  impactLevel: "High" | "Medium" | "Low";
  impactWidth: string;
  savings: string;
  savingsPct: string;
  effort: "Low" | "Medium" | "High";
  priority: "High" | "Medium" | "Low";
}

export function TopOptimizationOpportunitiesCard() {
  const [appliedItems, setAppliedItems] = useState<string[]>([]);

  const opportunities: OpportunityItem[] = [
    {
      id: "1",
      icon: Zap,
      title: "Route 40% of GPT-4o calls to GPT-4o-mini",
      desc: "Similar quality for classification tasks",
      impactLevel: "High",
      impactWidth: "w-16 bg-[#dfba82]",
      savings: "$742 /mo",
      savingsPct: "↑ 40%",
      effort: "Low",
      priority: "High",
    },
    {
      id: "2",
      icon: Minimize2,
      title: "Compress prompts for Claude-3.5-sonnet",
      desc: "Average 28% token reduction",
      impactLevel: "High",
      impactWidth: "w-16 bg-[#dfba82]",
      savings: "$312 /mo",
      savingsPct: "↑ 17%",
      effort: "Low",
      priority: "High",
    },
    {
      id: "3",
      icon: Database,
      title: "Implement response caching",
      desc: "Cache similar responses for 7d",
      impactLevel: "Medium",
      impactWidth: "w-10 bg-[#dfba82]",
      savings: "$198 /mo",
      savingsPct: "↑ 17%",
      effort: "Medium",
      priority: "Medium",
    },
    {
      id: "4",
      icon: Clock,
      title: "Batch non-urgent requests",
      desc: "Process in batches during off-peak hours",
      impactLevel: "Medium",
      impactWidth: "w-10 bg-[#dfba82]",
      savings: "$142 /mo",
      savingsPct: "↑ 8%",
      effort: "Medium",
      priority: "Medium",
    },
    {
      id: "5",
      icon: Trash2,
      title: "Remove unused context in 12 flows",
      desc: "Reduce average tokens by 18%",
      impactLevel: "Low",
      impactWidth: "w-6 bg-[#4ade80]",
      savings: "$89 /mo",
      savingsPct: "↑ 5%",
      effort: "Low",
      priority: "Low",
    },
  ];

  const handleApply = (id: string) => {
    if (!appliedItems.includes(id)) {
      setAppliedItems([...appliedItems, id]);
    }
  };

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#f4efe6]">
            Top Optimization Opportunities
          </h3>
          <p className="text-xs text-[#8e93a6] mt-0.5">
            Personalized recommendations to reduce costs and improve efficiency.
          </p>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors flex items-center gap-1"
        >
          <span>View All Opportunities</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-medium">Opportunity</th>
              <th className="pb-3 font-medium">Impact</th>
              <th className="pb-3 font-medium">Potential Savings</th>
              <th className="pb-3 font-medium">Effort</th>
              <th className="pb-3 font-medium">Priority</th>
              <th className="pb-3 font-medium text-center">Action</th>
              <th className="pb-3 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151826]">
            {opportunities.map((item) => {
              const Icon = item.icon;
              const isApplied = appliedItems.includes(item.id);

              return (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Opportunity Title & Icon */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82] shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white tracking-tight">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#73788c] mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Impact */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 bg-[#171a27] rounded-full overflow-hidden w-16">
                        <div className={`h-full rounded-full ${item.impactWidth}`} />
                      </div>
                      <span className="text-[11px] text-[#c5c9d6]">{item.impactLevel}</span>
                    </div>
                  </td>

                  {/* Potential Savings */}
                  <td className="py-3 pr-4 font-mono">
                    <div className="font-bold text-white">{item.savings}</div>
                    <div className="text-[10px] text-[#4ade80]">{item.savingsPct}</div>
                  </td>

                  {/* Effort Badge */}
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10.5px] font-semibold ${
                        item.effort === "Low"
                          ? "bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]"
                          : "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]"
                      }`}
                    >
                      {item.effort}
                    </span>
                  </td>

                  {/* Priority Badge */}
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10.5px] font-semibold ${
                        item.priority === "High"
                          ? "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"
                          : item.priority === "Medium"
                          ? "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]"
                          : "bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="py-3 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleApply(item.id)}
                      disabled={isApplied}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isApplied
                          ? "bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40"
                          : "bg-[#161826] hover:bg-[#dfba82] text-[#c5c9d6] hover:text-[#090a0f] border border-[#232738]"
                      }`}
                    >
                      {isApplied ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Applied
                        </span>
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </td>

                  {/* Options Menu */}
                  <td className="py-3 text-right">
                    <button type="button" className="text-[#6e7387] hover:text-white p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

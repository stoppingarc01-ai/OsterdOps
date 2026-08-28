"use client";

import React, { useState } from "react";

const TABS = [
  { id: "overview", label: "Optimization Overview" },
  { id: "recommendations", label: "Recommendations", badge: "✦ New" },
  { id: "routing", label: "Model Routing" },
  { id: "cost", label: "Cost Analysis" },
  { id: "waste", label: "Waste Detection" },
  { id: "automation", label: "Automation" },
];

export function OptimizationTabs() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="border-b border-[#181a26] pb-1 flex items-center gap-6 overflow-x-auto no-scrollbar">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative py-2.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              isActive ? "text-[#dfba82]" : "text-[#787d91] hover:text-[#c5c9d6]"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/30 text-[9.5px] font-bold">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#dfba82] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import React, { useState } from "react";

export function ReportsTabs() {
  const [activeTab, setActiveTab] = useState("Cost Reports");

  const tabs = [
    "Cost Reports",
    "Usage Reports",
    "Efficiency Reports",
    "Optimization Reports",
    "Custom Reports",
  ];

  return (
    <div className="flex items-center gap-6 border-b border-[#161824] pb-1 text-xs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold transition-all relative cursor-pointer ${
              isActive
                ? "text-[#dfba82]"
                : "text-[#787d91] hover:text-[#c5c9d6]"
            }`}
          >
            <span>{tab}</span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#dfba82] rounded-full shadow-[0_0_8px_rgba(223,186,130,0.8)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import React, { useState } from "react";

interface IntegrationsTabsProps {
  onTabChange?: (tab: string) => void;
}

export function IntegrationsTabs({ onTabChange }: IntegrationsTabsProps) {
  const [activeTab, setActiveTab] = useState("All Integrations");

  const tabs = [
    "All Integrations",
    "Model Providers",
    "Observability & APM",
    "Cloud Billing",
    "Webhooks & CI/CD",
  ];

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <div className="flex items-center gap-6 border-b border-[#161824] pb-1 text-xs overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => handleSelect(tab)}
            className={`pb-3 font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
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

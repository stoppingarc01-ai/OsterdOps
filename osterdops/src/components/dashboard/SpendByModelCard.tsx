"use client";

import React from "react";

import { ModelIconBadge } from "@/components/ui/ModelLogos";

export function SpendByModelCard() {
  const models = [
    { name: "gpt-4o", spend: "$1,920.45", percentage: 80 },
    { name: "claude-3.5-sonnet", spend: "$1,210.43", percentage: 52 },
    { name: "gpt-4o-mini", spend: "$690.12", percentage: 30 },
    { name: "gemini-1.5-pro", spend: "$412.32", percentage: 18 },
    { name: "other models", spend: "$95.32", percentage: 6 },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Spend by Model</h3>

      <div className="space-y-3.5">
        {models.map((m) => (
          <div key={m.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ModelIconBadge modelName={m.name} size="sm" />
                <span className="font-mono text-[#c5c9d6]">{m.name}</span>
              </div>
              <span className="font-bold text-white font-mono">{m.spend}</span>
            </div>

            {/* Horizontal Bar */}
            <div className="w-full h-1.5 bg-[#141724] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#dfba82] rounded-full transition-all duration-500"
                style={{ width: `${m.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

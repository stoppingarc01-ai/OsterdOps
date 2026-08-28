"use client";

import React from "react";
import { MessageSquare, Database, Image, Volume2, Settings, ArrowRight } from "lucide-react";

export function ModelDistributionCard() {
  const categories = [
    { icon: MessageSquare, name: "Chat", count: 13, pct: "(46.4%)" },
    { icon: Database, name: "Embedding", count: 4, pct: "(14.3%)" },
    { icon: Image, name: "Image", count: 2, pct: "(7.1%)" },
    { icon: Volume2, name: "Audio", count: 2, pct: "(7.1%)" },
    { icon: Settings, name: "Other", count: 7, pct: "(25.0%)" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Model Distribution</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.name}
              className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl space-y-1 hover:border-[#dfba82]/30 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-[#dfba82]">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold text-[#c5c9d6]">{cat.name}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-white">{cat.count}</span>
                <span className="text-[10px] text-[#73788c] font-mono">{cat.pct}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-[#171a27] text-right">
        <button
          type="button"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors inline-flex items-center gap-1"
        >
          <span>View All Models</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

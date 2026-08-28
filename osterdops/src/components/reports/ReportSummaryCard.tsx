"use client";

import React from "react";
import { Calendar, Folder, Server, Clock } from "lucide-react";

export function ReportSummaryCard() {
  const items = [
    { icon: Calendar, label: "Time Period", value: "May 10 – May 16, 2025" },
    { icon: Folder, label: "Projects", value: "All Projects" },
    { icon: Server, label: "Providers", value: "5 Providers" },
    { icon: Clock, label: "Data Refresh", value: "2 minutes ago" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[#f4efe6]">Report Summary</h3>
        <p className="text-xs text-[#8e93a6] mt-0.5">Overview of your AI cost performance</p>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-2.5 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 text-[#8e93a6]">
                <Icon className="w-3.5 h-3.5 text-[#dfba82]" />
                <span className="font-medium text-[#c5c9d6]">{item.label}</span>
              </div>
              <span className="font-semibold text-white font-mono text-[11.5px]">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

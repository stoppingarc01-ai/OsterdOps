"use client";

import React from "react";
import { Download, Calendar, Sliders, ChevronRight } from "lucide-react";

export function ReportActionsCard() {
  const actions = [
    {
      icon: Download,
      title: "Export Report",
      sub: "Download detailed report (CSV, PDF)",
    },
    {
      icon: Calendar,
      title: "Schedule Report",
      sub: "Automate report delivery",
    },
    {
      icon: Sliders,
      title: "Create Custom Report",
      sub: "Build a report with specific metrics",
    },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Report Actions</h3>

      <div className="space-y-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              type="button"
              className="w-full p-3 bg-[#111320] border border-[#1b1e2e] hover:border-[#dfba82]/40 rounded-xl flex items-center justify-between gap-3 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#161929] border border-[#25293d] flex items-center justify-center text-[#dfba82] shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-[#dfba82] transition-colors">
                    {act.title}
                  </div>
                  <div className="text-[10.5px] text-[#73788c] mt-0.5">{act.sub}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#52576b] group-hover:text-white transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

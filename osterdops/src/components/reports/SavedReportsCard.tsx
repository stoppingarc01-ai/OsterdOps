"use client";

import React from "react";
import { FileText, MoreVertical } from "lucide-react";

export function SavedReportsCard() {
  const reports = [
    { title: "Weekly Executive Summary", lastRun: "Last run: May 16, 2025" },
    { title: "Cost Optimization Report", lastRun: "Last run: May 15, 2025" },
    { title: "Model Efficiency Analysis", lastRun: "Last run: May 14, 2025" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Saved Reports</h3>
        <button type="button" className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82]">
          View All
        </button>
      </div>

      <div className="space-y-2.5">
        {reports.map((rep) => (
          <div
            key={rep.title}
            className="p-3 bg-[#111320] border border-[#1b1e2e] hover:border-[#dfba82]/30 rounded-xl flex items-center justify-between gap-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#161929] border border-[#25293d] flex items-center justify-center text-[#dfba82] shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white tracking-tight">{rep.title}</div>
                <div className="text-[10.5px] text-[#73788c] mt-0.5 font-mono">{rep.lastRun}</div>
              </div>
            </div>

            <button type="button" className="p-1 text-[#787d91] hover:text-white transition-colors" title="Options">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Calendar, ChevronDown, RotateCw, Bell, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function ModelsHeader() {
  const { currentOrg } = useAuth();
  const selectedWorkspace = `${currentOrg?.name || "Workspace"} / All Projects`;
  const selectedDate = "Last 30 Days";

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
      {/* Title & Subtitle */}
      <div>
        <h1
          className="text-2xl sm:text-[28px] font-medium tracking-tight text-[#f4efe6]"
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          Models
        </h1>
        <p className="text-[13px] text-[#8e93a6] mt-0.5">
          Manage, analyze, and optimize all AI models across your organization.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[12px] font-medium text-[#e8eaf0] transition-all cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-[#dfba82]" />
            <span>{selectedWorkspace}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#73788c]" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[12px] font-medium text-[#e8eaf0] transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#dfba82]" />
            <span>{selectedDate}</span>
          </button>
        </div>

        {/* Refresh Icon */}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="p-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
          title="Refresh Data"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

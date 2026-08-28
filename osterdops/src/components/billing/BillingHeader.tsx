"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown, RotateCw, Bell, Building2, Plus, Wallet } from "lucide-react";

interface BillingHeaderProps {
  onOpenCreateBudget: () => void;
}

export function BillingHeader({ onOpenCreateBudget }: BillingHeaderProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState("Acme Corp / All Projects");
  const [selectedDate, setSelectedDate] = useState("May 2025 Billing Cycle");

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
      {/* Title & Subtitle */}
      <div>
        <h1
          className="text-2xl sm:text-[28px] font-medium tracking-tight text-[#f4efe6]"
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          Budgets & Billing Governance
        </h1>
        <p className="text-[13px] text-[#8e93a6] mt-0.5">
          Manage enterprise subscription, spending limits, automated cost alerts, and invoice history.
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

        {/* Billing Cycle Selector */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[12px] font-medium text-[#e8eaf0] transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#dfba82]" />
            <span>{selectedDate}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#73788c]" />
          </button>
        </div>

        {/* Refresh Icon */}
        <button
          type="button"
          className="p-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
          title="Refresh Invoices"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Create Budget Limit Primary Gold Button */}
        <button
          type="button"
          onClick={onOpenCreateBudget}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Create Budget Limit</span>
        </button>

        {/* Bell Icon */}
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[#8e93a6] hover:text-white transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#b8860b] text-[#07080c] font-bold text-[9.5px] flex items-center justify-center border border-[#07080c]">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

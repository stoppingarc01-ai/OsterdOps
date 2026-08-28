"use client";

import React from "react";
import { Users, FolderKanban, Wallet, Key, TrendingUp, ShieldCheck } from "lucide-react";

export function TeamsTopMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Total Members */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Total Developers & Members</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">42</div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>4 new this month</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* Card 2: Active Engineering Teams */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Active Engineering Teams</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">6 Teams</div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <span>AI Core, ML Ops, Product +3</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <FolderKanban className="w-4 h-4" />
        </div>
      </div>

      {/* Card 3: Monthly AI Budget */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Monthly Team AI Budget</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">$65,000.00</div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <span>65.1% used ($42,328.64 spent)</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#4ade80]">
          <Wallet className="w-4 h-4" />
        </div>
      </div>

      {/* Card 4: Active API Keys */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Active API Keys</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">128 Keys</div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <ShieldCheck className="w-3 h-3 text-[#4ade80]" />
            <span>98% governance compliant</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <Key className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

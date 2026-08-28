"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronDown, Sun, Moon, Bell, Search, Command, X, Zap, ShieldCheck } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string;
  onOpenCommandPalette: () => void;
  onOpenSimulator: () => void;
}

export function DashboardHeader({
  userName = "Shaan",
  onOpenCommandPalette,
  onOpenSimulator,
}: DashboardHeaderProps) {
  const [selectedDateRange, setSelectedDateRange] = useState("May 10 – May 16, 2025");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Budget Warning",
      desc: "Production budget is at 82% utilization",
      time: "10m ago",
      urgent: true,
    },
    {
      id: 2,
      title: "Anthropic Spike",
      desc: "Usage spiked by 240% in last 6h",
      time: "1h ago",
      urgent: true,
    },
    {
      id: 3,
      title: "New Team Member",
      desc: "Ava Rodriguez joined your workspace",
      time: "3h ago",
      urgent: false,
    },
  ];

  return (
    <header className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#161824]">
      {/* Left: Greeting */}
      <div>
        <h1
          className="text-2xl sm:text-[26px] font-medium tracking-tight text-[#f4efe6] flex items-center gap-2"
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          <span>Good morning, {userName}!</span>
          <span className="text-xl">👋</span>
        </h1>
        <p className="text-[13px] text-[#8e93a6] mt-0.5">
          Here&apos;s your AI infrastructure overview.
        </p>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Command Palette Trigger Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/50 text-[12.5px] font-medium text-[#8e93a6] hover:text-white transition-all cursor-pointer shadow-xs group"
        >
          <Search className="w-3.5 h-3.5 text-[#dfba82]" />
          <span>Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#161826] border border-[#232738] rounded text-[10px] font-mono text-[#8e93a6]">
            ⌘K
          </kbd>
        </button>

        {/* Cost Simulator Trigger */}
        <button
          type="button"
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/40 hover:bg-[#dfba82]/20 text-[12.5px] font-bold text-[#dfba82] transition-all cursor-pointer shadow-xs"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Cost Simulator</span>
        </button>

        {/* Admin Console Direct Link */}
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141824] border border-[#232c40] hover:border-[#dfba82]/50 text-[12.5px] font-semibold text-[#dfba82] transition-all cursor-pointer shadow-xs"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Console</span>
        </Link>

        {/* Date Range Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowDateDropdown(!showDateDropdown);
              setShowProjectDropdown(false);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[12.5px] font-medium text-[#e8eaf0] transition-all cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#dfba82]" />
            <span>{selectedDateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#73788c]" />
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 p-1.5 bg-[#0c0e17] border border-[#232738] rounded-xl shadow-2xl z-50 text-xs space-y-1">
              {["Today", "Last 7 Days (May 10 – May 16, 2025)", "Last 30 Days", "This Month", "Custom Range..."].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedDateRange(opt.includes("May 10") ? "May 10 – May 16, 2025" : opt);
                    setShowDateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-[#c5c9d6] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProjectDropdown(!showProjectDropdown);
              setShowDateDropdown(false);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[12.5px] font-medium text-[#e8eaf0] transition-all cursor-pointer shadow-xs"
          >
            <span>{selectedProject}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#73788c]" />
          </button>

          {showProjectDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 p-1.5 bg-[#0c0e17] border border-[#232738] rounded-xl shadow-2xl z-50 text-xs space-y-1">
              {["All Projects", "Support Agent", "Research Agent", "Coding Agent", "Internal Tools"].map((proj) => (
                <button
                  key={proj}
                  type="button"
                  onClick={() => {
                    setSelectedProject(proj);
                    setShowProjectDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-[#c5c9d6] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  {proj}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[#8e93a6] hover:text-[#dfba82] transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <div className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5" />
              <Moon className="w-3.5 h-3.5 text-[#dfba82]" />
            </div>
          ) : (
            <Sun className="w-4 h-4 text-[#dfba82]" />
          )}
        </button>

        {/* Notification Bell Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 text-[#8e93a6] hover:text-white transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#b8860b] text-[#07080c] font-bold text-[9.5px] flex items-center justify-center border border-[#07080c]">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 p-3 bg-[#0c0e17] border border-[#232738] rounded-2xl shadow-2xl z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b1e2c]">
                <span className="text-xs font-bold text-white">Notifications (3)</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-[#787d91] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 bg-[#121422] rounded-xl border border-[#1f2233] space-y-0.5 hover:border-[#dfba82]/30 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11.5px] font-semibold text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-[#73788c] font-normal">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#8e93a6]">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

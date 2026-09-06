"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronDown, Bell, Search, X, Zap, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGatewayTelemetry } from "@/hooks/useGatewayTelemetry";
import { useCurrency, ALL_CURRENCIES, type CurrencyCode } from "@/context/CurrencyContext";
import { TrialBadge } from "@/components/billing/TrialBadge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { QuickstartModal } from "./QuickstartModal";

interface DashboardHeaderProps {
  userName?: string;
  onOpenCommandPalette: () => void;
  onOpenSimulator: () => void;
  onOpenQuickstart?: () => void;
}

export function DashboardHeader({
  userName,
  onOpenCommandPalette,
  onOpenSimulator,
  onOpenQuickstart,
}: DashboardHeaderProps) {
  const { user, userProfile } = useAuth();
  const { data: gatewayTelemetry, isLive } = useGatewayTelemetry(3000);
  const activeUserName = userName || userProfile?.name?.split(" ")[0] || user?.displayName?.split(" ")[0] || (user?.email ? user.email.split("@")[0] : "Commander");

  const { currency, setCurrency, currencyConfig } = useCurrency();
  const [selectedDateRange, setSelectedDateRange] = useState("May 10 – May 16, 2025");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showQuickstart, setShowQuickstart] = useState(false);

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
    <header className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#161824]">
      {/* Left: Greeting & Engine Overhead Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div>
          <h1
            className="text-2xl sm:text-[26px] font-medium tracking-tight text-slate-900 dark:text-[#f4efe6] flex items-center gap-2"
            style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
          >
            <span>Good morning, {activeUserName}!</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-[#8e93a6] mt-0.5">
            Here&apos;s your AI infrastructure overview.
          </p>
        </div>

        {/* Live C++ Engine Pre-Flight Guard Overhead Pill */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-mono font-medium border transition-all cursor-default self-start sm:self-auto ${
            isLive
              ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
              : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          }`}
          title={
            isLive
              ? `C++ LLM Gateway Active (${gatewayTelemetry.service} v${gatewayTelemetry.version}) — Measured Guard Latency: ${gatewayTelemetry.preflightLatencyUs}µs`
              : "Gateway Offline — Automatically serving baseline cached spend ledger without disruption"
          }
        >
          {isLive ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
              </span>
              <span className="font-semibold">● Pre-flight: {gatewayTelemetry.preflightLatencyUs}µs</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span>○ Gateway Offline (Serving Cached Ledger)</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Trial Days Remaining Badge */}
        <TrialBadge />

        {/* Drop-in Proxy Quickstart Trigger Button */}
        <button
          type="button"
          onClick={() => {
            if (onOpenQuickstart) onOpenQuickstart();
            else setShowQuickstart(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[12.5px] font-bold text-[#080808] transition-all duration-200 cursor-pointer shadow-[0_2px_12px_rgba(223,178,119,0.25)] hover:shadow-[0_4px_18px_rgba(223,178,119,0.4)] hover:-translate-y-0.5"
          title="Open 1-Minute Drop-in Proxy Quickstart Modal"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>+ Connect Gateway</span>
        </button>

        {/* Command Palette Trigger Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] hover:border-[#dfba82]/50 text-[12.5px] font-medium text-slate-500 dark:text-[#8e93a6] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs group"
        >
          <Search className="w-3.5 h-3.5 text-[#dfba82]" />
          <span>Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 dark:bg-[#161826] border border-slate-200 dark:border-[#232738] rounded text-[10px] font-mono text-slate-500 dark:text-[#8e93a6]">
            ⌘K
          </kbd>
        </button>

        {/* Cost Simulator Trigger */}
        <button
          type="button"
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/40 hover:bg-[#dfba82]/20 text-[12.5px] font-bold text-[#966d2a] dark:text-[#dfba82] transition-all cursor-pointer shadow-xs"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Cost Simulator</span>
        </button>

        {/* Admin Console Direct Link */}
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#141824] border border-slate-200 dark:border-[#232c40] hover:border-[#dfba82]/50 text-[12.5px] font-semibold text-[#966d2a] dark:text-[#dfba82] transition-all cursor-pointer shadow-xs"
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] hover:border-[#dfba82]/40 text-[12.5px] font-medium text-slate-700 dark:text-[#e8eaf0] transition-all cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#dfba82]" />
            <span>{selectedDateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#73788c]" />
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 p-1.5 bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-[#232738] rounded-xl shadow-2xl z-50 text-xs space-y-1">
              {["Today", "Last 7 Days (May 10 – May 16, 2025)", "Last 30 Days", "This Month", "Custom Range..."].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedDateRange(opt.includes("May 10") ? "May 10 – May 16, 2025" : opt);
                    setShowDateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-slate-600 dark:text-[#c5c9d6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] hover:border-[#dfba82]/40 text-[12.5px] font-medium text-slate-700 dark:text-[#e8eaf0] transition-all cursor-pointer shadow-xs"
          >
            <span>{selectedProject}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#73788c]" />
          </button>

          {showProjectDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 p-1.5 bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-[#232738] rounded-xl shadow-2xl z-50 text-xs space-y-1">
              {["All Projects", "Support Agent", "Research Agent", "Coding Agent", "Internal Tools"].map((proj) => (
                <button
                  key={proj}
                  type="button"
                  onClick={() => {
                    setSelectedProject(proj);
                    setShowProjectDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-slate-600 dark:text-[#c5c9d6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
                >
                  {proj}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Currency Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowCurrencyDropdown(!showCurrencyDropdown);
              setShowProjectDropdown(false);
              setShowDateDropdown(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] hover:border-[#dfba82]/50 text-[12.5px] font-semibold text-slate-800 dark:text-white transition-all cursor-pointer shadow-xs"
            title="Switch Global Display Currency"
          >
            <span className="text-sm">{currencyConfig.flag}</span>
            <span className="font-mono text-[#966d2a] dark:text-[#dfba82]">{currencyConfig.code}</span>
            <span className="text-slate-500 dark:text-[#8e93a6] text-[11px]">({currencyConfig.symbol})</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#73788c]" />
          </button>

          {showCurrencyDropdown && (
            <div className="absolute right-0 top-full mt-2 w-52 p-1.5 bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-[#232738] rounded-xl shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-[#656a7d] uppercase tracking-wider">
                Select Display Currency
              </div>
              {ALL_CURRENCIES.map((c) => {
                const isActive = currency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCurrency(c.code as CurrencyCode);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#dfba82]/15 text-[#966d2a] dark:text-[#dfba82] font-semibold border border-[#dfba82]/30"
                        : "text-slate-600 dark:text-[#c5c9d6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{c.flag}</span>
                      <span className="font-semibold">{c.code}</span>
                      <span className="text-slate-400 dark:text-[#787d91] font-mono">({c.symbol})</span>
                    </div>
                    {c.rate !== 1 && (
                      <span className="text-[10px] text-slate-400 dark:text-[#787d91] font-mono">
                        {c.rate}x
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-[#1b1e2c] hover:border-[#dfba82]/40 text-slate-600 dark:text-[#8e93a6] hover:text-slate-900 dark:hover:text-white transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#b8860b] text-white dark:text-[#07080c] font-bold text-[9.5px] flex items-center justify-center border border-white dark:border-[#07080c]">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 p-3 bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-[#232738] rounded-2xl shadow-2xl z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1b1e2c]">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications (3)</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 dark:text-[#787d91] hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 bg-slate-50 dark:bg-[#121422] rounded-xl border border-slate-200 dark:border-[#1f2233] space-y-0.5 hover:border-[#dfba82]/30 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11.5px] font-semibold text-slate-900 dark:text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#73788c] font-normal">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-[#8e93a6]">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quickstart Modal Mount */}
      <QuickstartModal
        isOpen={showQuickstart}
        onClose={() => setShowQuickstart(false)}
      />
    </header>
  );
}

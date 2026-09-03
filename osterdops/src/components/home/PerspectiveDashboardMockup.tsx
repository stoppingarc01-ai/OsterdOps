"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  BarChart3,
  Boxes,
  Layers,
  Coins,
  Scale,
  Bell,
  Zap,
  FolderKanban,
  KeyRound,
  Users,
  Settings,
  Calendar,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  Activity,
  Gauge,
  Check,
  Search,
  ShieldCheck,
} from "lucide-react";

export function PerspectiveDashboardMockup() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [dateRange, setDateRange] = useState("May 17 – May 24, 2025");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [spendTimeframe, setSpendTimeframe] = useState("Daily");
  const [requestsTimeframe, setRequestsTimeframe] = useState("Daily");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [hoveredReqPoint, setHoveredReqPoint] = useState<number | null>(null);
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  // 11 distinct sidebar items
  const navItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Analytics", icon: BarChart3 },
    { name: "Models", icon: Boxes },
    { name: "Requests", icon: Layers },
    { name: "FinOps", icon: Coins },
    { name: "Budgets", icon: Scale },
    { name: "Alerts", icon: Bell },
    { name: "Routers", icon: Zap },
    { name: "Projects", icon: FolderKanban },
    { name: "API Keys", icon: KeyRound },
    { name: "Team", icon: Users },
  ];

  // 4 Top Metric Cards (matching blueprint)
  const topMetrics = [
    {
      title: "Total Spend",
      value: "$12,430.58",
      change: "↓ 14.2% vs 7d",
      color: "#DFB277",
      polyline: "0,14 10,13 20,12 30,10 40,11 50,7 60,8 70,3 80,1",
      area: "0,18 0,14 10,13 20,12 30,10 40,11 50,7 60,8 70,3 80,1 80,18",
    },
    {
      title: "Requests",
      value: "2.45M",
      change: "↑ 23.4% vs 7d",
      color: "#DFB277",
      polyline: "0,15 10,13 20,12 30,13 40,9 50,10 60,5 70,6 80,2",
      area: "0,18 0,15 10,13 20,12 30,13 40,9 50,10 60,5 70,6 80,2 80,18",
    },
    {
      title: "Tokens",
      value: "94.2B",
      change: "↑ 19.7% vs 7d",
      color: "#DFB277",
      polyline: "0,14 10,12 20,13 30,10 40,8 50,9 60,5 70,6 80,2",
      area: "0,18 0,14 10,12 20,13 30,10 40,8 50,9 60,5 70,6 80,2 80,18",
    },
    {
      title: "Avg Latency",
      value: "8.21ms",
      change: "↓ 11.3% vs 7d",
      color: "#DFB277",
      polyline: "0,4 10,6 20,5 30,9 40,7 50,11 60,10 70,14 80,15",
      area: "0,18 0,4 10,6 20,5 30,9 40,7 50,11 60,10 70,14 80,15 80,18",
    },
  ];

  // Spend chart points
  const spendPoints = [
    { day: "May 17", val: "$480", x: 0, y: 55 },
    { day: "May 18", val: "$560", x: 42, y: 50 },
    { day: "May 19", val: "$620", x: 85, y: 46 },
    { day: "May 20", val: "$840", x: 128, y: 36 },
    { day: "May 21", val: "$810", x: 171, y: 39 },
    { day: "May 22", val: "$1,050", x: 214, y: 24 },
    { day: "May 23", val: "$1,120", x: 257, y: 18 },
    { day: "May 24", val: "$1,240", x: 300, y: 10 },
  ];

  // Requests chart points
  const reqPoints = [
    { day: "May 17", val: "142k", x: 0, y: 52 },
    { day: "May 18", val: "185k", x: 42, y: 47 },
    { day: "May 19", val: "210k", x: 85, y: 42 },
    { day: "May 20", val: "295k", x: 128, y: 33 },
    { day: "May 21", val: "310k", x: 171, y: 30 },
    { day: "May 22", val: "390k", x: 214, y: 20 },
    { day: "May 23", val: "420k", x: 257, y: 16 },
    { day: "May 24", val: "498k", x: 300, y: 8 },
  ];

  // Donut chart segment helper
  const renderDonutSegments = (
    slices: { pct: number; color: string; label: string }[],
    hoveredItem: string | null,
    cx = 28,
    cy = 28,
    r = 20,
    strokeWidth = 7.5
  ) => {
    const circumference = 2 * Math.PI * r;
    let accumulatedOffset = 0;

    return slices.map((slice, i) => {
      const strokeDasharray = `${(slice.pct / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += (slice.pct / 100) * circumference;
      const isHovered = hoveredItem === slice.label;

      return (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="transparent"
          stroke={slice.color}
          strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
          className="transition-all duration-200 cursor-pointer"
          opacity={hoveredItem && !isHovered ? 0.45 : 1}
        />
      );
    });
  };

  // Provider Data (exactly matches blueprint: Anthropic 41%, OpenAI 31%, DeepSeek 18%, Google 6%)
  const providerData = [
    { label: "Anthropic", pct: 41, amount: "$5,096.54", color: "#DFB277" },
    { label: "OpenAI", pct: 31, amount: "$3,853.48", color: "#38BDF8" },
    { label: "DeepSeek", pct: 18, amount: "$2,237.50", color: "#2563EB" },
    { label: "Google", pct: 6, amount: "$745.83", color: "#10B981" },
    { label: "Others", pct: 4, amount: "$497.23", color: "#64748B" },
  ];

  // Model Data
  const modelData = [
    { label: "claude-3.5", pct: 38.2, amount: "$4,748.48", color: "#DFB277" },
    { label: "gpt-4o", pct: 28.5, amount: "$3,542.72", color: "#38BDF8" },
    { label: "deepseek-r1", pct: 18.0, amount: "$2,237.50", color: "#2563EB" },
    { label: "gemini-1.5", pct: 8.5, amount: "$1,056.60", color: "#10B981" },
    { label: "Others", pct: 6.8, amount: "$845.28", color: "#64748B" },
  ];

  return (
    <div className="w-full rounded-2xl bg-[#090A0E] border border-[#181920] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden select-none min-w-0 transition-transform duration-500 [transform:perspective(1200px)_rotateY(-4deg)_rotateX(2deg)] sm:[transform:none] lg:[transform:perspective(1200px)_rotateY(-4deg)_rotateX(2deg)] hover:[transform:perspective(1200px)_rotateY(-1deg)_rotateX(1deg)]">
      <div className="flex flex-col sm:flex-row min-h-[500px]">
        {/* Left Sidebar inside Dashboard */}
        <aside className="w-full sm:w-36 lg:w-32 xl:w-36 border-b sm:border-b-0 sm:border-r border-[#16171F] bg-[#07080B] p-2.5 flex flex-col justify-between shrink-0">
          <div className="space-y-3">
            {/* Sidebar Logo */}
            <div className="flex items-center gap-2 px-1 pt-0.5">
              <div className="relative w-5 h-5 flex items-center justify-center shrink-0 drop-shadow-[0_0_8px_rgba(223,178,119,0.4)]">
                <Image
                  src="/osterdops-logo.png"
                  alt="OsterdOps"
                  width={20}
                  height={20}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="font-bold text-xs sm:text-sm text-white tracking-tight font-sans truncate">
                Osterd<span className="text-[#DFB277]">Ops</span>
              </span>
            </div>

            {/* Navigation List */}
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveNav(item.name)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors text-left cursor-pointer ${
                      isActive
                        ? "bg-[#DFB277]/10 text-[#DFB277] border border-[#DFB277]/25 font-semibold"
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Org Switcher at bottom of sidebar */}
          <div className="pt-2 border-t border-[#16171F] hidden sm:block">
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-[#0F1017] border border-[#1C1E29] text-xs cursor-pointer hover:border-[#282B3B] transition-colors">
              <div className="flex items-center gap-1.5 truncate">
                <div className="w-4 h-4 rounded bg-[#DFB277]/15 border border-[#DFB277]/35 flex items-center justify-center font-mono font-bold text-[9px] text-[#DFB277] shrink-0">
                  $
                </div>
                <div className="truncate">
                  <div className="text-white font-medium truncate text-[10px] leading-tight">
                    Studio1 Corp
                  </div>
                  <div className="text-neutral-500 text-[8px] leading-none mt-0.5">Owner</div>
                </div>
              </div>
              <ChevronDown className="w-2.5 h-2.5 text-neutral-500 shrink-0 ml-0.5" />
            </div>
          </div>
        </aside>

        {/* Main Dashboard Workspace */}
        <div className="flex-1 p-2.5 sm:p-3.5 space-y-2.5 bg-[#090A0E] overflow-hidden min-w-0">
          {/* Top Header: Search bar + Overhead Pill + Date Range Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pb-0.5 border-b border-[#161720]">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Command Search Bar */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F1017] border border-[#1C1E2A] text-neutral-400 text-xs font-mono flex-1 max-w-xs">
                <Search className="w-3 h-3 text-neutral-500" />
                <span className="text-[10px] text-neutral-500 truncate">Quick search models, keys, traces...</span>
                <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-[#161822] text-[9px] text-neutral-400 border border-[#232635]">⌘K</kbd>
              </div>

              {/* Pulsing Overhead Pill (<15µs wire overhead) */}
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-[10px] font-mono shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                <span className="font-bold">Overhead: 11.4µs</span>
              </div>
            </div>

            {/* Interactive Date Range Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#10121A] border border-[#1D202D] text-[10px] sm:text-[11px] font-mono text-neutral-300 shadow-sm cursor-pointer hover:border-[#2C3042] transition-colors"
              >
                <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
                <span className="truncate">{dateRange}</span>
                <ChevronDown className={`w-3 h-3 text-neutral-500 ml-0.5 transition-transform ${showDatePicker ? "rotate-180" : ""}`} />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-[#0F1017] border border-[#1F2230] shadow-2xl p-1 z-30 text-xs font-mono">
                  {["Today (Real-time)", "May 17 – May 24, 2025", "Last 30 Days", "Quarter to Date"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setDateRange(opt);
                        setShowDatePicker(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-[10px] flex items-center justify-between ${
                        dateRange === opt ? "text-[#DFB277] bg-[#DFB277]/10" : "text-neutral-300 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span>{opt}</span>
                      {dateRange === opt && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 1. Top 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {topMetrics.map((m, idx) => (
              <div
                key={idx}
                className="p-2 sm:p-2.5 rounded-lg bg-[#0F1017] border border-[#1A1C27] hover:border-[#252838] transition-all flex items-center justify-between min-w-0"
              >
                <div className="min-w-0 flex-1 pr-1">
                  <div className="text-[9.5px] font-mono text-neutral-400 font-medium truncate">
                    {m.title}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-white mt-0.5 tracking-tight truncate">
                    {m.value}
                  </div>
                  <div className="text-[8.5px] font-mono text-[#10B981] font-medium mt-0.5 truncate">
                    {m.change}
                  </div>
                </div>

                {/* Mini SVG Sparkline on right */}
                <div className="w-12 sm:w-14 h-6 shrink-0 flex items-center justify-end">
                  <svg viewBox="0 0 80 18" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id={`mGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#DFB277" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#DFB277" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon points={m.area} fill={`url(#mGrad-${idx})`} />
                    <polyline
                      fill="none"
                      stroke={m.color}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={m.polyline}
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Middle Row: Spend Over Time & Requests Over Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Spend Over Time Chart */}
            <div className="p-2.5 rounded-lg bg-[#0F1017] border border-[#1A1C27] space-y-1.5 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-white font-sans">
                    Spend Over Time
                  </span>
                  {hoveredPoint !== null && (
                    <span className="text-[9px] font-mono text-[#DFB277] bg-[#DFB277]/10 px-1 rounded border border-[#DFB277]/20">
                      {spendPoints[hoveredPoint].day}: {spendPoints[hoveredPoint].val}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSpendTimeframe(spendTimeframe === "Daily" ? "Hourly" : "Daily")}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#161822] border border-[#232635] text-[9px] font-mono text-neutral-400 hover:text-white cursor-pointer transition-colors"
                >
                  <span>{spendTimeframe}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Chart SVG with True Left Y-Axis */}
              <div className="flex items-stretch gap-1.5 h-20 sm:h-22">
                <div className="flex flex-col justify-between text-[8px] font-mono text-neutral-400 shrink-0 text-right pr-0.5">
                  <span>$1.2K</span>
                  <span>$900</span>
                  <span>$600</span>
                  <span>$300</span>
                  <span>$0</span>
                </div>

                <div className="flex-1 relative min-w-0">
                  <svg viewBox="0 0 300 70" preserveAspectRatio="none" className="w-full h-full">
                    <line x1="0" y1="10" x2="300" y2="10" stroke="#1F2230" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1="25" x2="300" y2="25" stroke="#1F2230" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1="40" x2="300" y2="40" stroke="#1F2230" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1="55" x2="300" y2="55" stroke="#1F2230" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1="68" x2="300" y2="68" stroke="#252838" strokeWidth="1" />

                    <defs>
                      <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#DFB277" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#DFB277" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <polygon points="0,55 42,50 85,46 128,36 171,39 214,24 257,18 300,10 300,70 0,70" fill="url(#spendGrad)" />
                    <polyline fill="none" stroke="#DFB277" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="0,55 42,50 85,46 128,36 171,39 214,24 257,18 300,10" />

                    {spendPoints.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPoint === i ? 4 : 2.5}
                        fill={hoveredPoint === i ? "#FFFFFF" : "#DFB277"}
                        stroke="#090A0E"
                        strokeWidth="1.5"
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredPoint(i)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </svg>
                </div>
              </div>

              <div className="flex justify-between text-[8px] font-mono text-neutral-400 pl-6 pr-1">
                {spendPoints.map((p, i) => (
                  <span key={i}>{p.day.split(" ")[1]}</span>
                ))}
              </div>
            </div>

            {/* Requests Over Time Chart */}
            <div className="p-2.5 rounded-lg bg-[#0F1017] border border-[#1A1C27] space-y-1.5 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-white font-sans">
                    Requests Over Time
                  </span>
                  {hoveredReqPoint !== null && (
                    <span className="text-[9px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-1 rounded border border-[#38BDF8]/20">
                      {reqPoints[hoveredReqPoint].day}: {reqPoints[hoveredReqPoint].val}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setRequestsTimeframe(requestsTimeframe === "Daily" ? "Hourly" : "Daily")}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#161822] border border-[#232635] text-[9px] font-mono text-neutral-400 hover:text-white cursor-pointer transition-colors"
                >
                  <span>{requestsTimeframe}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Chart SVG with True Left Y-Axis */}
              <div className="flex items-stretch gap-1.5 h-20 sm:h-22">
                <div className="flex flex-col justify-between text-[8px] font-mono text-neutral-400 shrink-0 text-right pr-0.5">
                  <span>500k</span>
                  <span>375k</span>
                  <span>250k</span>
                  <span>125k</span>
                  <span>0</span>
                </div>

                <div className="flex-1 relative min-w-0">
                  <svg viewBox="0 0 300 70" preserveAspectRatio="none" className="w-full h-full">
                    <line x1="0" y1="8" x2="300" y2="8" stroke="#1F2230" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1="23" x2="300" y2="23" stroke="#1F2230" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1="38" x2="300" y2="38" stroke="#1F2230" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1="53" x2="300" y2="53" stroke="#1F2230" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1="68" x2="300" y2="68" stroke="#252838" strokeWidth="1" />

                    <defs>
                      <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <polygon points="0,52 42,47 85,42 128,33 171,30 214,20 257,16 300,8 300,70 0,70" fill="url(#reqGrad)" />
                    <polyline fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="0,52 42,47 85,42 128,33 171,30 214,20 257,16 300,8" />

                    {reqPoints.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredReqPoint === i ? 4 : 2.5}
                        fill={hoveredReqPoint === i ? "#FFFFFF" : "#38BDF8"}
                        stroke="#090A0E"
                        strokeWidth="1.5"
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredReqPoint(i)}
                        onMouseLeave={() => setHoveredReqPoint(null)}
                      />
                    ))}
                  </svg>
                </div>
              </div>

              <div className="flex justify-between text-[8px] font-mono text-neutral-400 pl-6 pr-1">
                {reqPoints.map((p, i) => (
                  <span key={i}>{p.day.split(" ")[1]}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Bottom Row: 3 Rigidly Aligned Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Card 1: Spend by Provider */}
            <div className="p-2.5 rounded-lg bg-[#0F1017] border border-[#1A1C27] space-y-1.5 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between pb-0.5 border-b border-[#1A1C27]">
                <span className="text-[11px] font-semibold text-white font-sans">
                  Spend by Provider
                </span>
                <span className="text-[9px] font-mono text-[#DFB277] font-semibold">
                  $12,430.58
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                    {renderDonutSegments(providerData, hoveredProvider)}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] font-mono font-bold text-white leading-none">41%</span>
                    <span className="text-[6.5px] font-mono text-neutral-400 leading-none mt-0.5">Anthropic</span>
                  </div>
                </div>

                <div className="flex-1 space-y-0.5 text-[8.5px] font-mono min-w-0">
                  {providerData.map((p) => (
                    <div
                      key={p.label}
                      onMouseEnter={() => setHoveredProvider(p.label)}
                      onMouseLeave={() => setHoveredProvider(null)}
                      className={`grid grid-cols-12 items-center px-1 py-0.2 rounded transition-colors cursor-pointer ${
                        hoveredProvider === p.label ? "bg-white/[0.08]" : ""
                      }`}
                    >
                      <div className="col-span-5 flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-neutral-300 truncate">{p.label}</span>
                      </div>
                      <span className="col-span-3 text-neutral-400 text-right">{p.pct}%</span>
                      <span className="col-span-4 text-white text-right font-medium truncate">{p.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2: Spend by Model */}
            <div className="p-2.5 rounded-lg bg-[#0F1017] border border-[#1A1C27] space-y-1.5 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between pb-0.5 border-b border-[#1A1C27]">
                <span className="text-[11px] font-semibold text-white font-sans">
                  Spend by Model
                </span>
                <span className="text-[9px] font-mono text-[#38BDF8] font-semibold">
                  Top 5
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                    {renderDonutSegments(modelData, hoveredModel)}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] font-mono font-bold text-white leading-none">38%</span>
                    <span className="text-[6.5px] font-mono text-neutral-400 leading-none mt-0.5">Claude</span>
                  </div>
                </div>

                <div className="flex-1 space-y-0.5 text-[8.5px] font-mono min-w-0">
                  {modelData.map((m) => (
                    <div
                      key={m.label}
                      onMouseEnter={() => setHoveredModel(m.label)}
                      onMouseLeave={() => setHoveredModel(null)}
                      className={`grid grid-cols-12 items-center px-1 py-0.2 rounded transition-colors cursor-pointer ${
                        hoveredModel === m.label ? "bg-white/[0.08]" : ""
                      }`}
                    >
                      <div className="col-span-5 flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                        <span className="text-neutral-300 truncate">{m.label}</span>
                      </div>
                      <span className="col-span-3 text-neutral-400 text-right">{m.pct}%</span>
                      <span className="col-span-4 text-white text-right font-medium truncate">{m.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3: Active Alerts */}
            <div className="p-2.5 rounded-lg bg-[#0F1017] border border-[#1A1C27] space-y-1 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between pb-0.5 border-b border-[#1A1C27]">
                <span className="text-[11px] font-semibold text-white font-sans">
                  Active Alerts
                </span>
                <span className="text-[9px] font-mono text-neutral-400 hover:text-white cursor-pointer transition-colors">
                  View all
                </span>
              </div>

              <div className="space-y-1 text-[8.5px] font-mono">
                {/* Alert 1: Budget warning */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="w-4 h-4 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                    </div>
                    <div className="truncate">
                      <div className="text-neutral-200 font-medium leading-none truncate">Budget Warning (82%)</div>
                      <div className="text-neutral-500 text-[7.5px] mt-0.5 truncate">Project: Studio1 AI</div>
                    </div>
                  </div>
                  <span className="text-neutral-500 text-[8px] shrink-0">2m ago</span>
                </div>

                {/* Alert 2: Loop throttle */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="w-4 h-4 rounded bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-2.5 h-2.5 text-red-400" />
                    </div>
                    <div className="truncate">
                      <div className="text-neutral-200 font-medium leading-none truncate">Loop Throttle Tripped</div>
                      <div className="text-neutral-500 text-[7.5px] mt-0.5 truncate">Recursive agent key frozen</div>
                    </div>
                  </div>
                  <span className="text-neutral-500 text-[8px] shrink-0">14m ago</span>
                </div>

                {/* Alert 3 */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="w-4 h-4 rounded bg-[#DFB277]/15 border border-[#DFB277]/30 flex items-center justify-center shrink-0">
                      <Activity className="w-2.5 h-2.5 text-[#DFB277]" />
                    </div>
                    <div className="truncate">
                      <div className="text-neutral-200 font-medium leading-none truncate">Model Anomaly</div>
                      <div className="text-neutral-500 text-[7.5px] mt-0.5 truncate">claude-3-5-sonnet</div>
                    </div>
                  </div>
                  <span className="text-neutral-500 text-[8px] shrink-0">1h ago</span>
                </div>

                {/* Alert 4 */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="w-4 h-4 rounded bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Gauge className="w-2.5 h-2.5 text-blue-400" />
                    </div>
                    <div className="truncate">
                      <div className="text-neutral-200 font-medium leading-none truncate">Rate Limit Approaching</div>
                      <div className="text-neutral-500 text-[7.5px] mt-0.5 truncate">OpenAI - 90% limit</div>
                    </div>
                  </div>
                  <span className="text-neutral-500 text-[8px] shrink-0">2h ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Gateway Health & Zero-Persistence Indicator Bar */}
          <div className="pt-2 border-t border-[#161720] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
            <div className="flex items-center gap-2 text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-bold">Gateway Health: 100% Operational</span>
              <span className="text-neutral-500">|</span>
              <span className="text-neutral-400">All 32 Anycast PoPs Healthy</span>
            </div>

            <div className="flex items-center gap-1.5 text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DFB277]" />
              <span>Zero Disk Persistence: <strong className="text-white">In-Memory Wire Proxy</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Activity,
  Sparkles,
  Wallet,
  Bell,
  Plug,
  Users,
  FileBarChart,
  CreditCard,
  ShieldCheck,
  Settings,
  Search,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { OsterdOpsLogo } from "../layout/OsterdOpsLogo";

const sidebarGroups = [
  {
    label: "OVERVIEW",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
      { icon: FolderKanban, label: "Projects", id: "projects" },
      { icon: Activity, label: "Usage", id: "usage" },
      { icon: Sparkles, label: "Optimization", id: "optimization" },
    ],
  },
  {
    label: "GOVERNANCE",
    items: [
      { icon: Wallet, label: "Budgets", id: "budgets" },
      { icon: Bell, label: "Alerts", id: "alerts" },
      { icon: Plug, label: "Integrations", id: "integrations" },
    ],
  },
  {
    label: "ORGANIZATION",
    items: [
      { icon: Users, label: "Teams & Developers", id: "teams" },
      { icon: FileBarChart, label: "Reports", id: "reports" },
      { icon: CreditCard, label: "Billing", id: "billing" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { icon: Settings, label: "Settings", id: "settings" },
      { icon: ShieldCheck, label: "Security & Audit", id: "security" },
    ],
  },
];

const metricCards = [
  {
    label: "Total Spend",
    value: "$14,283.45",
    change: "12.4%",
    positive: true,
    note: "vs last month",
  },
  {
    label: "Projected Spend",
    value: "$18,720.11",
    change: "8.7%",
    positive: true,
    note: "vs last month",
  },
  {
    label: "Total Tokens",
    value: "2.76B",
    change: "15.2%",
    positive: true,
    note: "vs last month",
  },
  {
    label: "Requests",
    value: "1.45M",
    change: "9.1%",
    positive: true,
    note: "vs last month",
  },
  {
    label: "Avg. Cost / Request",
    value: "$0.0098",
    change: "6.3%",
    positive: false,
    note: "vs last month",
  },
];

const chartPoints = [
  { label: "Jul 1", x: 25, y: 110, val: "$5,240" },
  { label: "Jul 4", x: 65, y: 98, val: "$6,810" },
  { label: "Jul 8", x: 115, y: 88, val: "$8,950" },
  { label: "Jul 11", x: 155, y: 92, val: "$8,400" },
  { label: "Jul 15", x: 205, y: 72, val: "$11,320" },
  { label: "Jul 18", x: 245, y: 64, val: "$12,850" },
  { label: "Jul 22", x: 295, y: 58, val: "$13,910" },
  { label: "Jul 26", x: 335, y: 48, val: "$15,200" },
  { label: "Jul 29", x: 380, y: 38, val: "$14,283" },
];

const providerData = [
  { name: "OpenAI", pct: "43%", color: "#dfba82" },
  { name: "Anthropic", pct: "28%", color: "#5478a8" },
  { name: "Google", pct: "18%", color: "#37475f" },
  { name: "Others", pct: "11%", color: "#252b3b" },
];

const modelRows = [
  { model: "gpt-4o", cost: "$2.48", efficiency: "High" },
  { model: "claude-3-5-sonnet", cost: "$2.19", efficiency: "High" },
  { model: "gemini-1.5-pro", cost: "$1.32", efficiency: "Medium" },
  { model: "gpt-4o-mini", cost: "$0.21", efficiency: "High" },
];

const optimizationItems = [
  { title: "Right-size model usage", savings: "$2,430 potential savings" },
  { title: "Reduce unnecessary tokens", savings: "$1,870 potential savings" },
  { title: "Optimize routing rules", savings: "$1,220 potential savings" },
];

export function DashboardMockup() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Generate smooth cubic bezier SVG path
  const pathD = chartPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpx2 = prev.x + (pt.x - prev.x) / 2;
    return `${acc} C ${cpx1} ${prev.y}, ${cpx2} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");
  const areaD = `${pathD} L 380 135 L 25 135 Z`;

  return (
    <div className="relative w-full rounded-2xl bg-[#090a0f] border border-[#1e2230] shadow-[0_30px_100px_rgba(0,0,0,0.95)] overflow-hidden text-[#c5c8d6] select-none text-[11px] font-sans">
      {/* Outer ambient subtle gold glow top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#dfba82]/40 to-transparent" />

      <div className="flex flex-row min-h-[520px]">
        {/* Left Sidebar inside Mockup */}
        <div className="w-[145px] shrink-0 bg-[#07080c] border-r border-[#161822] p-3 flex flex-col justify-between hidden md:flex">
          <div className="space-y-3.5">
            {/* Sidebar Logo */}
            <div className="px-1 py-0.5 mb-2">
              <OsterdOpsLogo size="sm" />
            </div>

            {sidebarGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[8px] font-semibold tracking-[0.12em] text-[#52576b] mb-1 px-1.5 uppercase">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-[9px] transition-all text-left ${
                          isActive
                            ? "bg-[#171924] text-[#f2e7d3] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] border border-white/[0.05]"
                            : "text-[#717688] hover:text-[#c5c8d4] hover:bg-white/[0.02]"
                        }`}
                      >
                        <Icon
                          className={`h-3 w-3 shrink-0 ${
                            isActive ? "text-[#dfba82]" : "text-[#717688]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Live Proxy Status Bottom Pill */}
          <div className="pt-2 border-t border-[#161822]">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0d1017] border border-[#191d2c] text-[8.5px] text-[#9ca3af]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]" />
              </span>
              <span className="text-[#10b981] font-medium">Live Proxy Active</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#090a0f]">
          {/* Top Bar inside Mockup */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#161822] bg-[#08090d]">
            <div className="flex items-center gap-2">
              <span className="text-[#f4efe6] font-semibold text-[11.5px] tracking-tight">
                Dashboard
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#11131c] border border-[#1d202e] rounded-md text-[8.5px] text-[#8e93a6] cursor-pointer hover:border-[#2e3349] transition-colors">
                <span>This Month</span>
                <ChevronDown className="h-2.5 w-2.5 opacity-60" />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Search dashboard"
                className="text-[#64697e] hover:text-[#f4efe6] p-1 transition-colors"
              >
                <Search className="h-3 w-3" />
              </button>
              <button
                type="button"
                aria-label="Filter settings"
                className="text-[#64697e] hover:text-[#f4efe6] p-1 transition-colors"
              >
                <SlidersHorizontal className="h-3 w-3" />
              </button>
              <button
                type="button"
                aria-label="View notifications"
                className="text-[#64697e] hover:text-[#f4efe6] p-1 relative transition-colors"
              >
                <Bell className="h-3 w-3" />
                <span className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-[#dfba82]" />
              </button>

              <div className="flex items-center gap-1.5 pl-2 border-l border-[#191b28]">
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#dfba82]/40 to-[#222736] border border-[#dfba82]/40 flex items-center justify-center text-[7.5px] font-bold text-[#f4efe6]">
                  A
                </div>
                <div className="text-[8.5px] hidden sm:block leading-tight">
                  <div className="text-[#f4efe6] font-medium">Acme Corp</div>
                  <div className="text-[#64697e] text-[7px]">Owner</div>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 px-3.5 pt-3 pb-2">
            {metricCards.map((m) => (
              <div
                key={m.label}
                className="bg-[#0e1017] border border-[#181b27] hover:border-[#262b3d] rounded-lg p-2.5 transition-colors"
              >
                <p className="text-[8px] font-medium text-[#71768a] mb-0.5 truncate">
                  {m.label}
                </p>
                <p className="text-[13px] font-bold text-[#f4efe6] leading-tight font-mono tracking-tight">
                  {m.value}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {m.positive ? (
                    <span className="flex items-center text-[7.5px] font-semibold text-[#10b981]">
                      <ArrowUpRight className="h-2.5 w-2.5 inline" /> {m.change}
                    </span>
                  ) : (
                    <span className="flex items-center text-[7.5px] font-semibold text-[#f59e0b]">
                      <ArrowDownRight className="h-2.5 w-2.5 inline" /> {m.change}
                    </span>
                  )}
                  <span className="text-[7px] text-[#555a6d] truncate">
                    {m.note}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Row: Spend Over Time + Top Providers */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 px-3.5 py-1.5">
            {/* Left: Spend Over Time Spline Chart (7 cols) */}
            <div className="md:col-span-7 bg-[#0e1017] border border-[#181b27] rounded-lg p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] font-semibold text-[#f4efe6]">
                  Spend Over Time
                </span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#12141e] border border-[#1e2232] rounded text-[7.5px] text-[#8e93a6] cursor-pointer hover:border-[#2e3349]">
                  <span>Daily</span>
                  <ChevronDown className="h-2 w-2 opacity-60" />
                </div>
              </div>

              <div className="relative pt-1">
                {/* Y-Axis scale */}
                <div className="absolute left-0 top-1 bottom-4 flex flex-col justify-between text-[6.5px] text-[#4b5065] font-mono select-none">
                  <span>$20K</span>
                  <span>$15K</span>
                  <span>$10K</span>
                  <span>$5K</span>
                  <span>$0</span>
                </div>

                {/* SVG Line Chart */}
                <div className="ml-5">
                  <svg viewBox="0 0 400 140" className="w-full h-[95px] overflow-visible">
                    <defs>
                      <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dfba82" stopOpacity="0.25" />
                        <stop offset="60%" stopColor="#dfba82" stopOpacity="0.06" />
                        <stop offset="100%" stopColor="#dfba82" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Grid lines */}
                    {[25, 55, 85, 115].map((y) => (
                      <line
                        key={y}
                        x1="20"
                        y1={y}
                        x2="385"
                        y2={y}
                        stroke="#161824"
                        strokeWidth="0.75"
                        strokeDasharray="2 2"
                      />
                    ))}

                    {/* Gradient Area under curve */}
                    <path d={areaD} fill="url(#goldAreaGrad)" />

                    {/* Glowing Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    {chartPoints.map((pt, idx) => (
                      <g key={idx}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredPoint === idx ? 4.5 : 2.5}
                          fill="#f8f4ec"
                          stroke="#dfba82"
                          strokeWidth="1.25"
                          className="cursor-pointer transition-all duration-150"
                          onMouseEnter={() => setHoveredPoint(idx)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        {hoveredPoint === idx && (
                          <g>
                            <rect
                              x={pt.x - 22}
                              y={pt.y - 20}
                              width="44"
                              height="14"
                              rx="3"
                              fill="#161925"
                              stroke="#dfba82"
                              strokeWidth="0.75"
                            />
                            <text
                              x={pt.x}
                              y={pt.y - 10}
                              fill="#f4efe6"
                              fontSize="7.5"
                              fontWeight="600"
                              textAnchor="middle"
                              fontFamily="monospace"
                            >
                              {pt.val}
                            </text>
                          </g>
                        )}
                      </g>
                    ))}
                  </svg>

                  {/* X-Axis labels */}
                  <div className="flex justify-between text-[7px] text-[#555a6d] font-mono mt-1 pr-1">
                    <span>Jul 1</span>
                    <span>Jul 8</span>
                    <span>Jul 15</span>
                    <span>Jul 22</span>
                    <span>Jul 29</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Top Providers Donut (5 cols) */}
            <div className="md:col-span-5 bg-[#0e1017] border border-[#181b27] rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[9.5px] font-semibold text-[#f4efe6]">
                Top Providers
              </span>

              <div className="flex items-center justify-between gap-3 my-auto pt-1">
                {/* SVG Donut */}
                <div className="relative w-[86px] h-[86px] shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* OpenAI 43% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="11"
                      strokeDasharray={`${43 * 2.26} ${100 * 2.26}`}
                      strokeDashoffset="0"
                    />
                    {/* Anthropic 28% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="#5478a8"
                      strokeWidth="11"
                      strokeDasharray={`${28 * 2.26} ${100 * 2.26}`}
                      strokeDashoffset={`${-43 * 2.26}`}
                    />
                    {/* Google 18% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="#37475f"
                      strokeWidth="11"
                      strokeDasharray={`${18 * 2.26} ${100 * 2.26}`}
                      strokeDashoffset={`${-(43 + 28) * 2.26}`}
                    />
                    {/* Others 11% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="#222736"
                      strokeWidth="11"
                      strokeDasharray={`${11 * 2.26} ${100 * 2.26}`}
                      strokeDashoffset={`${-(43 + 28 + 18) * 2.26}`}
                    />
                  </svg>
                  {/* Donut Center */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11.5px] font-bold text-[#f4efe6] leading-none font-mono">
                      $14,283
                    </span>
                    <span className="text-[7px] text-[#6b7185] mt-0.5 font-medium">
                      Total
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-1.5 w-full pr-1">
                  {providerData.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between text-[8px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-[#c5c8d6] font-medium">{p.name}</span>
                      </div>
                      <span className="text-[#8e93a6] font-mono font-medium">
                        {p.pct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 Cards: Model Efficiency, Budget Health, Optimization Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 px-3.5 py-2">
            {/* Card 1: Model Efficiency */}
            <div className="bg-[#0e1017] border border-[#181b27] rounded-lg p-2.5 flex flex-col justify-between">
              <span className="text-[9px] font-semibold text-[#f4efe6]">
                Model Efficiency
              </span>
              <table className="w-full mt-1.5">
                <thead>
                  <tr className="text-[6.5px] text-[#555a6e] uppercase tracking-wider">
                    <th className="text-left font-normal pb-1">Model</th>
                    <th className="text-left font-normal pb-1">Cost / 1M Tokens</th>
                    <th className="text-right font-normal pb-1">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {modelRows.map((r) => (
                    <tr
                      key={r.model}
                      className="text-[7.5px] border-t border-[#151722]"
                    >
                      <td className="py-1 text-[#c5c8d6] font-mono truncate max-w-[70px]">
                        {r.model}
                      </td>
                      <td className="py-1 text-[#8e93a6] font-mono">{r.cost}</td>
                      <td className="py-1 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[6.5px] font-semibold ${
                            r.efficiency === "High"
                              ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20"
                              : "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20"
                          }`}
                        >
                          {r.efficiency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card 2: Budget Health */}
            <div className="bg-[#0e1017] border border-[#181b27] rounded-lg p-2.5 flex flex-col justify-between">
              <span className="text-[9px] font-semibold text-[#f4efe6]">
                Budget Health
              </span>
              <div className="space-y-2 mt-1.5">
                {/* Spend vs Budget */}
                <div>
                  <div className="flex items-baseline justify-between text-[7.5px] mb-1">
                    <span className="text-[#8e93a6]">Spend vs Budget</span>
                    <span className="text-[#f4efe6] font-mono font-medium">
                      $14,283 / $20,000
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#151724] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#dfba82]/80 to-[#dfba82] rounded-full"
                      style={{ width: "71%" }}
                    />
                  </div>
                  <div className="text-right text-[6.5px] text-[#555a6e] mt-0.5 font-mono">
                    71%
                  </div>
                </div>

                {/* Active Budgets */}
                <div>
                  <div className="flex items-baseline justify-between text-[7.5px] mb-1">
                    <span className="text-[#8e93a6]">Active Budgets</span>
                    <span className="text-[#f4efe6] font-mono font-medium">
                      8 / 12
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#151724] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#10b981]/80 to-[#10b981] rounded-full"
                      style={{ width: "67%" }}
                    />
                  </div>
                  <div className="text-right text-[6.5px] text-[#555a6e] mt-0.5 font-mono">
                    67%
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Optimization Opportunities */}
            <div className="bg-[#0e1017] border border-[#181b27] rounded-lg p-2.5 flex flex-col justify-between">
              <span className="text-[9px] font-semibold text-[#f4efe6]">
                Optimization Opportunities
              </span>
              <div className="space-y-1.5 mt-1.5">
                {optimizationItems.map((item) => (
                  <div
                    key={item.title}
                    className="flex flex-col text-[7.5px] leading-tight"
                  >
                    <span className="text-[#c5c8d6] font-medium truncate">
                      {item.title}
                    </span>
                    <span className="text-[#dfba82] font-mono text-[7px]">
                      {item.savings}
                    </span>
                  </div>
                ))}
              </div>
              <a
                href="#optimization"
                className="inline-flex items-center gap-1 text-[7.5px] font-semibold text-[#dfba82] hover:text-[#faeedb] mt-1 transition-colors"
              >
                <span>View all opportunities</span>
                <ArrowRight className="h-2 w-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

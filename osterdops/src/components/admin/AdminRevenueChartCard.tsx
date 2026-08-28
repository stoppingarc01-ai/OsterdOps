"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface DataPoint {
  month: string;
  mrr: number; // in thousands (e.g. 24 = $24K)
  subs: number; // e.g. 210
}

const CHART_DATA: DataPoint[] = [
  { month: "Jun '24", mrr: 24.2, subs: 210 },
  { month: "Jul '24", mrr: 28.5, subs: 245 },
  { month: "Aug '24", mrr: 33.1, subs: 290 },
  { month: "Sep '24", mrr: 39.4, subs: 340 },
  { month: "Oct '24", mrr: 45.8, subs: 410 },
  { month: "Nov '24", mrr: 53.2, subs: 480 },
  { month: "Dec '24", mrr: 52.0, subs: 510 },
  { month: "Jan '25", mrr: 59.8, subs: 560 },
  { month: "Feb '25", mrr: 69.4, subs: 620 },
  { month: "Mar '25", mrr: 78.2, subs: 690 },
  { month: "Apr '25", mrr: 79.5, subs: 740 },
  { month: "May '25", mrr: 84.92, subs: 847 },
];

export function AdminRevenueChartCard() {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState("Last 12 months");
  const [interval, setInterval] = useState("Monthly");

  // Chart dimensions & scaling
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 25;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  // Coordinate mapper for MRR (0 to 100K)
  const getMrrY = (val: number) => {
    const fraction = Math.min(1, Math.max(0, val / 100));
    return paddingY + innerHeight * (1 - fraction);
  };

  // Coordinate mapper for Subs (0 to 1000)
  const getSubsY = (val: number) => {
    const fraction = Math.min(1, Math.max(0, val / 1000));
    return paddingY + innerHeight * (1 - fraction);
  };

  const getX = (index: number) => {
    return paddingX + (index / (CHART_DATA.length - 1)) * innerWidth;
  };

  // Generate SVG path for MRR
  const mrrPoints = CHART_DATA.map((d, i) => `${getX(i)},${getMrrY(d.mrr)}`);
  const mrrPathD = `M ${mrrPoints.join(" L ")}`;
  const mrrAreaD = `${mrrPathD} L ${getX(CHART_DATA.length - 1)},${paddingY + innerHeight} L ${getX(0)},${paddingY + innerHeight} Z`;

  // Generate SVG path for Subscriptions
  const subsPoints = CHART_DATA.map((d, i) => `${getX(i)},${getSubsY(d.subs)}`);
  const subsPathD = `M ${subsPoints.join(" L ")}`;

  return (
    <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 font-sans shadow-sm">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[13px] font-bold tracking-[0.12em] text-[#e8e4dc] uppercase">
            Revenue &amp; Subscriptions
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Dropdown */}
          <div className="relative inline-flex items-center bg-[#131722] border border-[#22283a] rounded-lg px-3 py-1.5 text-[12px] text-[#c5c8d4] hover:border-[#353e56] transition-colors cursor-pointer group">
            <span>{timeRange}</span>
            <ChevronDown className="h-3.5 w-3.5 ml-2 text-[#717688] group-hover:text-white" />
          </div>

          {/* Interval Dropdown */}
          <div className="relative inline-flex items-center bg-[#131722] border border-[#22283a] rounded-lg px-3 py-1.5 text-[12px] text-[#c5c8d4] hover:border-[#353e56] transition-colors cursor-pointer group">
            <span>{interval}</span>
            <ChevronDown className="h-3.5 w-3.5 ml-2 text-[#717688] group-hover:text-white" />
          </div>
        </div>
      </div>

      {/* Legend Indicators */}
      <div className="flex items-center justify-between text-[11.5px] text-[#717688] mb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 rounded-full bg-[#dfba82]" />
            <span className="text-[#c5c8d4] font-medium">Monthly Recurring Revenue (MRR)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 border-b-2 border-dotted border-[#dfba82]/80" />
            <span className="text-[#8e94a8]">Active Subscriptions</span>
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-wider text-[#555a6d] font-semibold">
          Subscriptions (Right Axis)
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <div className="grid grid-cols-12 gap-0">
          {/* Y-Axis Labels Left (MRR) */}
          <div className="col-span-1 flex flex-col justify-between text-[10.5px] text-[#555a6d] font-mono h-[210px] text-right pr-2">
            <span>$100K</span>
            <span>$80K</span>
            <span>$60K</span>
            <span>$40K</span>
            <span>$20K</span>
            <span>$0</span>
          </div>

          {/* Center Chart */}
          <div className="col-span-10 relative h-[210px]">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full border-b border-[#161a26]" />
              ))}
            </div>

            {/* SVG Area & Lines */}
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="absolute inset-0 w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="mrrGlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dfba82" stopOpacity="0.32" />
                  <stop offset="60%" stopColor="#dfba82" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#dfba82" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* MRR Area Fill */}
              <path d={mrrAreaD} fill="url(#mrrGlowGradient)" />

              {/* Subscriptions Dotted Line */}
              <path
                d={subsPathD}
                fill="none"
                stroke="#dfba82"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
              />

              {/* MRR Solid Line */}
              <path
                d={mrrPathD}
                fill="none"
                stroke="#dfba82"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots on hover */}
              {CHART_DATA.map((d, i) => {
                const cx = getX(i);
                const cy = getMrrY(d.mrr);
                const isHovered = hoveredIndex === i;

                return (
                  <g key={d.month}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5 : 3}
                      fill="#dfba82"
                      stroke="#0c0f16"
                      strokeWidth="2"
                      className="transition-all duration-150 cursor-pointer"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive hover overlay columns */}
            <div className="absolute inset-0 flex">
              {CHART_DATA.map((d, i) => (
                <div
                  key={d.month}
                  onMouseEnter={() => {
                    setHoveredPoint(d);
                    setHoveredIndex(i);
                  }}
                  onMouseLeave={() => {
                    setHoveredPoint(null);
                    setHoveredIndex(null);
                  }}
                  className="flex-1 h-full cursor-pointer relative hover:bg-white/[0.02] transition-colors"
                />
              ))}
            </div>

            {/* Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#141824] border border-[#2b334a] shadow-[0_4px_20px_rgba(0,0,0,0.6)] rounded-xl p-3 text-[11.5px] pointer-events-none z-20 space-y-1"
              >
                <div className="font-bold text-[#f4efe6]">{hoveredPoint.month}</div>
                <div className="flex items-center gap-3">
                  <span className="text-[#717688]">MRR:</span>
                  <span className="text-[#dfba82] font-mono font-bold">${hoveredPoint.mrr.toFixed(2)}K</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#717688]">Active Subs:</span>
                  <span className="text-white font-mono font-bold">{hoveredPoint.subs}</span>
                </div>
              </div>
            )}
          </div>

          {/* Y-Axis Labels Right (Subscriptions) */}
          <div className="col-span-1 flex flex-col justify-between text-[10.5px] text-[#555a6d] font-mono h-[210px] pl-2">
            <span>1,000</span>
            <span>800</span>
            <span>600</span>
            <span>400</span>
            <span>200</span>
            <span>0</span>
          </div>
        </div>

        {/* X-Axis Month Labels */}
        <div className="grid grid-cols-12 pl-[8.33%] pr-[8.33%] pt-3 text-[10px] text-[#717688] font-mono text-center">
          {CHART_DATA.map((d) => (
            <div key={d.month} className="truncate">
              {d.month}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

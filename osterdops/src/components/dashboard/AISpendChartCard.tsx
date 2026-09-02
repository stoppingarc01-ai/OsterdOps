"use client";

import React, { useState } from "react";
import { LineChart, Loader2 } from "lucide-react";
import { useLiveTelemetry, type LiveTelemetryData } from "@/hooks/useLiveTelemetry";

interface AISpendChartCardProps {
  telemetry?: LiveTelemetryData;
  isLoading?: boolean;
}

export function AISpendChartCard({ telemetry: externalTelemetry, isLoading: externalLoading }: AISpendChartCardProps) {
  const internalHook = useLiveTelemetry();
  const data = externalTelemetry || internalHook.data;
  const loading = externalLoading !== undefined ? externalLoading : internalHook.isLoading;

  const [activeTab, setActiveTab] = useState<"Spend" | "Tokens" | "Requests">("Spend");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points = data.timeSeries || [];

  const getValue = (pt: (typeof points)[0]) => {
    if (activeTab === "Spend") return pt.spendUsd;
    if (activeTab === "Tokens") return pt.tokens;
    return pt.requests;
  };

  const formatValue = (val: number) => {
    if (activeTab === "Spend") return `$${val.toFixed(2)}`;
    if (activeTab === "Tokens") return val >= 1_000_000 ? `${(val / 1_000_000).toFixed(2)}M` : val.toLocaleString();
    return val.toLocaleString();
  };

  const values = points.map(getValue);
  const maxVal = values.length > 0 ? Math.max(...values, 1) : 1;
  const hasData = points.length > 0 && values.some((v) => v > 0);

  return (
    <div className="p-5 bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl flex flex-col justify-between space-y-4 transition-all">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold text-white tracking-tight">
            AI Spend Over Time
          </h3>

          {/* Toggle Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#0A0A0A] rounded-xl border border-[#161616]">
            {(["Spend", "Tokens", "Requests"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#DFB277] text-[#0E0E0E] font-bold shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Granularity Label */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A0A0A] border border-[#161616] text-xs font-mono text-neutral-400">
            <span>Last 30 Days</span>
          </div>
        </div>
      </div>

      {/* Main Area Chart or Zero State */}
      <div className="h-64 w-full relative pt-2">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-neutral-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#DFB277]" />
            <span className="font-mono">Syncing real-time telemetry...</span>
          </div>
        ) : !hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 border border-[#161616] rounded-xl bg-[#0A0A0A]">
            <div className="w-9 h-9 rounded-xl bg-[#DFB277]/10 border border-[#DFB277]/20 flex items-center justify-center text-[#DFB277]">
              <LineChart className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-white">No spend data recorded for this period</div>
            <p className="text-[11px] text-neutral-400 max-w-xs">
              Usage and model spend will appear dynamically once requests are routed through the proxy gateway.
            </p>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 220">
              <defs>
                <linearGradient id="mainSpendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DFB277" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#DFB277" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[20, 65, 110, 155, 200].map((yVal, i) => (
                <line
                  key={i}
                  x1="30"
                  y1={yVal}
                  x2="790"
                  y2={yVal}
                  stroke="#161616"
                  strokeWidth="1"
                />
              ))}

              {/* Dynamic Path Generator */}
              {(() => {
                const count = points.length;
                const coords = points.map((pt, i) => {
                  const x = 30 + (i / Math.max(1, count - 1)) * 750;
                  const val = getValue(pt);
                  const y = 200 - (val / maxVal) * 175;
                  return { x, y, pt, val };
                });

                const linePath = coords.reduce(
                  (acc, c, i) => (i === 0 ? `M ${c.x},${c.y}` : `${acc} L ${c.x},${c.y}`),
                  ""
                );
                const areaPath = `${linePath} L ${coords[coords.length - 1].x},200 L ${coords[0].x},200 Z`;

                return (
                  <>
                    <path d={areaPath} fill="url(#mainSpendGradient)" />
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#DFB277"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {coords.map((c, i) => (
                      <g
                        key={i}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={hoveredIndex === i ? 6 : 3.5}
                          fill="#0E0E0E"
                          stroke="#DFB277"
                          strokeWidth="2"
                          className="transition-all"
                        />
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* Hover Tooltip */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <div
                className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#DFB277]/40 text-xs font-mono text-white shadow-xl pointer-events-none"
              >
                <div className="text-[10px] text-neutral-400">{points[hoveredIndex].date}</div>
                <div className="font-bold text-[#E5C38E] mt-0.5">
                  {formatValue(getValue(points[hoveredIndex]))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, MoreVertical, LineChart, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface TimeSeriesPoint {
  date: string;
  spendUsd: number;
  requests: number;
  tokens: number;
}

export function AISpendChartCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"Spend" | "Tokens" | "Requests">("Spend");
  const [points, setPoints] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchTimeSeries() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any>("/api/v1/analytics/overview", {
          params: { organizationId: currentOrg.id, timeRange: "30d" },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data.timeSeries)) {
          const mapped: TimeSeriesPoint[] = res.data.timeSeries.map((pt: any) => ({
            date: pt.date ? new Date(pt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
            spendUsd: pt.spendUsd ?? 0,
            requests: pt.requests ?? 0,
            tokens: pt.tokens ?? 0,
          }));
          setPoints(mapped);
        } else {
          setPoints([]);
        }
      } catch (err) {
        if (isMounted) setPoints([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTimeSeries();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const getValue = (pt: TimeSeriesPoint) => {
    if (activeTab === "Spend") return pt.spendUsd;
    if (activeTab === "Tokens") return pt.tokens;
    return pt.requests;
  };

  const formatValue = (val: number) => {
    if (activeTab === "Spend") return `$${val.toFixed(2)}`;
    if (activeTab === "Tokens") return val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M` : val.toLocaleString();
    return val.toLocaleString();
  };

  const maxVal = points.length > 0 ? Math.max(...points.map(getValue), 1) : 1;

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex flex-col justify-between space-y-4">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h3 className="text-base font-semibold text-[#f4efe6]">
            AI Spend Over Time
          </h3>

          {/* Toggle Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#121422] rounded-xl border border-[#1f2233]">
            {(["Spend", "Tokens", "Requests"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#dfba82] text-[#090a0f] font-bold shadow-xs"
                    : "text-[#8e93a6] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Granularity & Options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121422] border border-[#1f2233] text-xs text-[#c5c9d6]">
            <span>Last 30 Days</span>
          </div>
        </div>
      </div>

      {/* Main Area Chart or Empty State */}
      <div className="h-64 w-full relative pt-2">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[#8e93a6] space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#dfba82]" />
            <span>Loading telemetry...</span>
          </div>
        ) : points.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 border border-[#171a27] rounded-xl bg-[#090b12]">
            <div className="w-9 h-9 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
              <LineChart className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-white">No spend data recorded for this period</div>
            <p className="text-[11px] text-[#73788c] max-w-xs">
              Usage and model spend will appear dynamically once requests are routed through the proxy gateway.
            </p>
          </div>
        ) : (
          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 220">
            <defs>
              <linearGradient id="mainSpendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dfba82" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#dfba82" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 50, 100, 150, 200].map((yVal, i) => (
              <line
                key={i}
                x1="40"
                y1={yVal}
                x2="780"
                y2={yVal}
                stroke="#1b1e2c"
                strokeDasharray="4 4"
              />
            ))}

            {/* Path */}
            {(() => {
              const coords = points.map((pt, idx) => {
                const x = 50 + (idx / Math.max(1, points.length - 1)) * 720;
                const val = getValue(pt);
                const y = 200 - (val / maxVal) * 170;
                return { x, y, label: formatValue(val), date: pt.date };
              });

              const pathD = coords.reduce(
                (acc, c, idx) => (idx === 0 ? `M ${c.x},${c.y}` : `${acc} L ${c.x},${c.y}`),
                ""
              );
              const areaD = `${pathD} L ${coords[coords.length - 1].x},200 L ${coords[0].x},200 Z`;

              return (
                <>
                  <path d={areaD} fill="url(#mainSpendGradient)" />
                  <path d={pathD} fill="none" stroke="#dfba82" strokeWidth="2.5" strokeLinecap="round" />

                  {coords.map((c, idx) => (
                    <g key={idx} className="cursor-pointer">
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="4"
                        fill="#dfba82"
                        stroke="#0d0f18"
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {hoveredPoint === idx && (
                        <g>
                          <rect
                            x={c.x - 35}
                            y={c.y - 30}
                            width="70"
                            height="20"
                            rx="5"
                            fill="#181b2a"
                            stroke="#dfba82"
                            strokeWidth="1"
                          />
                          <text
                            x={c.x}
                            y={c.y - 16}
                            fill="#ffffff"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {c.label}
                          </text>
                        </g>
                      )}
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        )}

        {/* X Axis Dates Row */}
        {points.length > 0 && (
          <div className="flex items-center justify-between text-[11px] text-[#6e7387] px-4 pt-1 font-mono">
            {points.map((d, i) => (
              <span key={i}>{d.date}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

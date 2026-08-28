"use client";

import React from "react";
import {
  CreditCard,
  DollarSign,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

export function AdminKpiCards() {
  const kpiData = [
    {
      id: "customers",
      title: "TOTAL CUSTOMERS",
      value: "2,481",
      trend: "+12.4%",
      trendLabel: "vs last 30 days",
      isPositive: true,
      icon: Users,
      sparklinePoints: "5,25 15,22 25,24 35,18 45,20 55,14 65,16 75,8 85,10 95,4",
    },
    {
      id: "subscriptions",
      title: "ACTIVE SUBSCRIPTIONS",
      value: "847",
      trend: "+8.7%",
      trendLabel: "vs last 30 days",
      isPositive: true,
      icon: CreditCard,
      sparklinePoints: "5,26 15,24 25,20 35,22 45,17 55,15 65,18 75,10 85,12 95,5",
    },
    {
      id: "mrr",
      title: "MONTHLY RECURRING REVENUE",
      value: "$84,920",
      trend: "+14.2%",
      trendLabel: "vs last 30 days",
      isPositive: true,
      icon: DollarSign,
      sparklinePoints: "5,28 15,26 25,23 35,19 45,21 55,14 65,16 75,9 85,11 95,3",
    },
    {
      id: "tickets",
      title: "OPEN SUPPORT TICKETS",
      value: "23",
      trend: "-8.4%",
      trendLabel: "vs last 30 days",
      isPositive: false, // improvement in ticket load
      icon: MessageSquare,
      sparklinePoints: "5,6 15,9 25,12 35,10 45,15 55,18 65,16 75,22 85,20 95,26",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {kpiData.map((kpi) => {
        const IconComponent = kpi.icon;

        return (
          <div
            key={kpi.id}
            className="bg-[#0c0f16] border border-[#1b202e] hover:border-[#2b334a] rounded-2xl p-5 transition-all duration-200 shadow-sm relative overflow-hidden group"
          >
            {/* Top row: Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/25 text-[#dfba82] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-[#717688] uppercase">
                {kpi.title}
              </div>
            </div>

            {/* Value */}
            <div className="text-[26px] font-bold text-[#f4efe6] tracking-tight mb-3">
              {kpi.value}
            </div>

            {/* Bottom Row: Trend Pill + Sparkline Curve */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#dfba82]">
                {kpi.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-[#dfba82]" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-[#dfba82]" />
                )}
                <span>
                  <strong className="font-semibold text-[#f4efe6]">{kpi.trend}</strong> {kpi.trendLabel}
                </span>
              </div>

              {/* Mini Sparkline Chart */}
              <div className="w-20 h-7">
                <svg
                  viewBox="0 0 100 30"
                  className="w-full h-full overflow-visible"
                  fill="none"
                >
                  <defs>
                    <linearGradient id={`grad-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dfba82" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#dfba82" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="#dfba82"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={kpi.sparklinePoints}
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

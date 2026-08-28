"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export function ConnectorIngestionCard() {
  const connectors = [
    { name: "OpenAI Proxy", reqs: "2,180 req/m", pct: "(45.0%)", color: "#dfba82" },
    { name: "Anthropic Claude", reqs: "1,358 req/m", pct: "(28.0%)", color: "#b8860b" },
    { name: "Google Vertex", reqs: "776 req/m", pct: "(16.0%)", color: "#3b82f6" },
    { name: "AWS Bedrock", reqs: "339 req/m", pct: "(7.0%)", color: "#f59e0b" },
    { name: "Datadog & OTel", reqs: "197 req/m", pct: "(4.0%)", color: "#10b981" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <h3 className="text-base font-semibold text-[#f4efe6]">Connector Traffic Ingestion</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* OpenAI Arc (45%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#dfba82"
              strokeWidth="14"
              strokeDasharray="107 238"
              strokeDashoffset="0"
            />
            {/* Anthropic Arc (28%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#b8860b"
              strokeWidth="14"
              strokeDasharray="66 238"
              strokeDashoffset="-109"
            />
            {/* Google Arc (16%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="14"
              strokeDasharray="38 238"
              strokeDashoffset="-177"
            />
            {/* AWS Arc (7%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="14"
              strokeDasharray="17 238"
              strokeDashoffset="-217"
            />
            {/* Datadog Arc (4%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#10b981"
              strokeWidth="14"
              strokeDasharray="10 238"
              strokeDashoffset="-236"
            />
          </svg>

          {/* Center Text overlay */}
          <div className="absolute text-center">
            <div className="text-[13px] font-bold text-white leading-none">
              4,850
            </div>
            <div className="text-[9px] text-[#73788c] mt-0.5 font-medium">req / min</div>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 space-y-2 w-full">
          {connectors.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#c5c9d6] font-medium text-[11.5px]">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <span className="text-white font-semibold text-[11.5px]">{item.reqs}</span>
                <span className="text-[10px] text-[#73788c]">{item.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-[#171a27] text-right">
        <button
          type="button"
          className="text-xs font-semibold text-[#8e93a6] hover:text-[#dfba82] transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View Telemetry Streams</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

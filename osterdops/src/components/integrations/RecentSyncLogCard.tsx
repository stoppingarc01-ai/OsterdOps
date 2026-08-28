"use client";

import React from "react";
import { CheckCircle2, Clock } from "lucide-react";

import { IntegrationLogoBadge } from "@/components/ui/IntegrationLogos";

export function RecentSyncLogCard() {
  const syncs = [
    { id: "openai", provider: "OpenAI Proxy", status: "Success", records: "12,432 tokens ingested", time: "14s ago" },
    { id: "anthropic", provider: "Anthropic Claude", status: "Success", records: "8,921 prompt spans synced", time: "42s ago" },
    { id: "datadog", provider: "Datadog APM", status: "Success", records: "1,240 OTel traces exported", time: "1m ago" },
    { id: "gcp", provider: "GCP BigQuery", status: "Success", records: "Hourly Vertex billing table synced", time: "14m ago" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Recent Sync Log</h3>
        <span className="text-[11px] text-[#73788c] font-mono">Auto-refreshing</span>
      </div>

      <div className="space-y-2.5">
        {syncs.map((log, idx) => (
          <div
            key={idx}
            className="p-2.5 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="scale-75 -ml-1">
                <IntegrationLogoBadge id={log.id} />
              </div>
              <div>
                <div className="font-semibold text-white tracking-tight">{log.provider}</div>
                <div className="text-[10.5px] text-[#73788c] font-mono">{log.records}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-[#8e93a6] font-mono shrink-0">
              <Clock className="w-3 h-3 text-[#73788c]" />
              <span>{log.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

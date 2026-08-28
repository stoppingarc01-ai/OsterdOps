"use client";

import React from "react";
import { Plug, Zap, RefreshCw, ShieldCheck } from "lucide-react";

export function IntegrationsTopMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Connected Providers */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Connected Providers</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">14 Active</div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <span>3 Available to Connect</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <Plug className="w-4 h-4" />
        </div>
      </div>

      {/* Card 2: Ingestion Rate */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Ingestion Throughput</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">4,850 req/m</div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <span>99.98% Uptime SLA</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#4ade80]">
          <Zap className="w-4 h-4" />
        </div>
      </div>

      {/* Card 3: Sync Latency */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Telemetry Sync Latency</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">18ms</div>
          <div className="flex items-center gap-1 text-[11px] text-[#dfba82] font-medium mt-1">
            <span>Real-Time Streaming WebSocket</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <RefreshCw className="w-4 h-4" />
        </div>
      </div>

      {/* Card 4: Security Gateways */}
      <div className="p-4 bg-[#0d0f18] border border-[#1d202e] rounded-2xl flex items-center justify-between hover:border-[#dfba82]/40 transition-all group">
        <div>
          <span className="text-[11px] font-medium text-[#73788c]">Security Proxies</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">6 Gateways</div>
          <div className="flex items-center gap-1 text-[11px] text-[#4ade80] font-medium mt-1">
            <span>AES-256 Key Vault Encrypted</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

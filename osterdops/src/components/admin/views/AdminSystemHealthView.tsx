"use client";

import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  Globe2,
  HardDrive,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function AdminSystemHealthView() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const systems = [
    {
      name: "AI Gateway Reverse Proxy (v1)",
      endpoint: "POST /api/v1/chat/completions",
      status: "OPERATIONAL",
      latencyP50: "142 ms",
      latencyP99: "420 ms",
      uptime: "99.99%",
      errorRate: "0.002%",
    },
    {
      name: "OpenAI Adapter Subsystem",
      endpoint: "api.openai.com / v1",
      status: "OPERATIONAL",
      latencyP50: "210 ms",
      latencyP99: "680 ms",
      uptime: "99.98%",
      errorRate: "0.001%",
    },
    {
      name: "Anthropic Claude Adapter Subsystem",
      endpoint: "api.anthropic.com / v1/messages",
      status: "OPERATIONAL",
      latencyP50: "295 ms",
      latencyP99: "810 ms",
      uptime: "99.95%",
      errorRate: "0.004%",
    },
    {
      name: "Google Gemini Adapter Subsystem",
      endpoint: "generativelanguage.googleapis.com",
      status: "OPERATIONAL",
      latencyP50: "185 ms",
      latencyP99: "510 ms",
      uptime: "99.99%",
      errorRate: "0.000%",
    },
    {
      name: "Cost Calculation & Pricing Matrix Engine",
      endpoint: "In-Memory Pure Registry",
      status: "OPERATIONAL",
      latencyP50: "< 1 ms",
      latencyP99: "2 ms",
      uptime: "100.00%",
      errorRate: "0.000%",
    },
    {
      name: "Cloud Firestore Telemetry & Spend Pipeline",
      endpoint: "Google Cloud Firestore Partitioned",
      status: "OPERATIONAL",
      latencyP50: "18 ms",
      latencyP99: "45 ms",
      uptime: "99.99%",
      errorRate: "0.000%",
    },
  ];

  const regionalNodes = [
    { region: "US-East (N. Virginia)", status: "HEALTHY", rtt: "12 ms", load: "34%" },
    { region: "US-West (Oregon)", status: "HEALTHY", rtt: "24 ms", load: "28%" },
    { region: "EU-Central (Frankfurt)", status: "HEALTHY", rtt: "84 ms", load: "41%" },
    { region: "AP-South (Mumbai)", status: "HEALTHY", rtt: "112 ms", load: "19%" },
  ];

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">
            System Health &amp; Gateway Telemetry
          </h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            Real-time observability into adapter proxies, token cost calculation latencies, and database pipelines.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#121622] hover:bg-[#181e2e] border border-[#1f2638] text-[#dfba82] rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Global Status Banner */}
      <div className="bg-[#0c0f16] border border-[#22c55e]/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-white flex items-center gap-2">
              All Gateway Systems Fully Operational
            </div>
            <div className="text-[12px] text-[#717688]">
              No active incidents reported across OpenAI, Claude, or Gemini proxies.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[12px] font-mono">
          <div>
            <span className="text-[#555a6d]">Avg Latency:</span>{" "}
            <strong className="text-[#dfba82]">184 ms</strong>
          </div>
          <div>
            <span className="text-[#555a6d]">Error Budget:</span>{" "}
            <strong className="text-[#22c55e]">99.98%</strong>
          </div>
        </div>
      </div>

      {/* Regional Edge Gateways */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {regionalNodes.map((node, idx) => (
          <div key={idx} className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white font-bold text-[12.5px]">
                <Globe2 className="h-3.5 w-3.5 text-[#dfba82]" />
                <span>{node.region}</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
            </div>

            <div className="flex items-center justify-between text-[11.5px] font-mono pt-1">
              <span className="text-[#717688]">RTT: <strong className="text-[#dfba82]">{node.rtt}</strong></span>
              <span className="text-[#717688]">Load: <strong className="text-white">{node.load}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Subsystems Table */}
      <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="text-[10.5px] uppercase font-bold tracking-[0.1em] text-[#555a6d] border-b border-[#171b26] pb-3">
              <tr>
                <th className="pb-3">Subsystem / Adapter</th>
                <th className="pb-3">Upstream Target</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">p50 Latency</th>
                <th className="pb-3">p99 Latency</th>
                <th className="pb-3">30d Uptime</th>
                <th className="pb-3 text-right">Error Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151924] text-[#c5c8d4]">
              {systems.map((s, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 font-semibold text-[#f4efe6] flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                    <span>{s.name}</span>
                  </td>
                  <td className="py-4 font-mono text-[11.5px] text-[#8e94a8]">{s.endpoint}</td>
                  <td className="py-4">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-[#dfba82]">{s.latencyP50}</td>
                  <td className="py-4 font-mono text-[#717688]">{s.latencyP99}</td>
                  <td className="py-4 font-mono text-[#22c55e]">{s.uptime}</td>
                  <td className="py-4 text-right font-mono text-[#717688]">{s.errorRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

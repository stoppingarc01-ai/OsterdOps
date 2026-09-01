"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { AlertOctagon, ShieldAlert, CheckCircle2, Lock } from "lucide-react";

interface SecurityEventItem {
  id: string;
  type: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
  ipHash: string;
  actorId: string;
  description: string;
}

const SAMPLE_SECURITY_EVENTS: SecurityEventItem[] = [
  { id: "sec_01", type: "API_KEY_AUTH_FAILED", severity: "HIGH", timestamp: "2026-08-29 10:24:12 UTC", ipHash: "iph_8f3a9e12", actorId: "unknown", description: "Invalid API key format presented to gateway endpoint." },
  { id: "sec_02", type: "SECURITY_CONFIGURATION_CHANGED", severity: "HIGH", timestamp: "2026-08-29 09:30:00 UTC", ipHash: "iph_7b210c44", actorId: "usr_shaandev", description: "Allowed CORS origins list updated by workspace administrator." },
  { id: "sec_03", type: "AUTH_SUCCESS", severity: "INFO", timestamp: "2026-08-29 08:00:15 UTC", ipHash: "iph_7b210c44", actorId: "usr_shaandev", description: "Successful administrative ID token authentication." },
];

export default function SecurityEventsPage() {
  const [filterSev, setFilterSev] = useState<string>("ALL");

  const filtered = SAMPLE_SECURITY_EVENTS.filter(
    (e) => filterSev === "ALL" || e.severity === filterSev
  );

  const getSeverityBadge = (sev: SecurityEventItem["severity"]) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-950/60 text-rose-400 border-rose-800/40";
      case "HIGH":
        return "bg-amber-950/60 text-amber-400 border-amber-800/40";
      case "MEDIUM":
        return "bg-yellow-950/60 text-yellow-400 border-yellow-800/40";
      case "LOW":
      case "INFO":
        return "bg-blue-950/60 text-blue-400 border-blue-800/40";
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Threat Detection
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Security Threat Events
                </h1>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1 bg-[#0c0e17] border border-[#1b1e2c] p-1 rounded-xl text-xs">
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "INFO"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSev(sev)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      filterSev === sev
                        ? "bg-[#dfba82] text-black font-bold shadow-[0_0_12px_rgba(223,186,130,0.3)]"
                        : "text-[#8e93a6] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </span>
                      <span className="font-bold text-xs font-mono text-white">{item.type}</span>
                    </div>
                    <p className="text-xs text-[#8e93a6]">{item.description}</p>
                    <div className="text-[10px] font-mono text-[#555a6d]">
                      Actor: {item.actorId} | Pseudonymized IP: {item.ipHash} | {item.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}

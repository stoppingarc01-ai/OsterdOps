"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { FileCheck2, ShieldCheck, Search, Filter, CheckCircle2 } from "lucide-react";

interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  result: "SUCCESS" | "DENIED";
  requestId: string;
  hashVerified: boolean;
}

const SAMPLE_AUDIT_LOGS: AuditLogItem[] = [
  { id: "aud_01", timestamp: "2026-08-29 10:28:15 UTC", actor: "Shaan (Admin)", action: "API_KEY_CREATED", resource: "apiKey:key_01", result: "SUCCESS", requestId: "req_99812", hashVerified: true },
  { id: "aud_02", timestamp: "2026-08-29 09:14:22 UTC", actor: "Shaan (Admin)", action: "BUDGET_CREATED", resource: "budget:bud_01", result: "SUCCESS", requestId: "req_99805", hashVerified: true },
  { id: "aud_03", timestamp: "2026-08-29 08:30:11 UTC", actor: "Alex (Developer)", action: "SECURITY_SETTINGS_READ", resource: "securitySettings", result: "SUCCESS", requestId: "req_99790", hashVerified: true },
  { id: "aud_04", timestamp: "2026-08-28 22:15:00 UTC", actor: "Unknown Actor", action: "GATEWAY_ACCESS_UNAUTHORIZED", resource: "gateway", result: "DENIED", requestId: "req_99712", hashVerified: true },
];

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");

  const filtered = SAMPLE_AUDIT_LOGS.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Compliance Trail
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Tamper-Evident Audit Logs
                </h1>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] w-full sm:w-64">
                <Search className="w-4 h-4 text-[#73788c]" />
                <input
                  type="text"
                  placeholder="Search actions, actors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-[#555a6d] w-full"
                />
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="rounded-xl border border-[#1b1e2c] bg-[#0c0e17] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111422] text-[#8e93a6] border-b border-[#1b1e2c]">
                    <tr>
                      <th className="p-3.5 font-semibold">Timestamp (UTC)</th>
                      <th className="p-3.5 font-semibold">Actor</th>
                      <th className="p-3.5 font-semibold">Action</th>
                      <th className="p-3.5 font-semibold">Resource</th>
                      <th className="p-3.5 font-semibold">Result</th>
                      <th className="p-3.5 font-semibold text-right">Integrity Chain</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161928]">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 text-[#8e93a6] font-mono">{item.timestamp}</td>
                        <td className="p-3.5 font-semibold text-white">{item.actor}</td>
                        <td className="p-3.5 font-mono text-[#dfba82]">{item.action}</td>
                        <td className="p-3.5 text-[#c5c9d6]">{item.resource}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              item.result === "SUCCESS"
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                            }`}
                          >
                            {item.result}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            HMAC-SHA256 Chained
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}

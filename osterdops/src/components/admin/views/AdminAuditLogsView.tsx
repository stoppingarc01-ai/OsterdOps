"use client";

import React, { useState } from "react";
import { Download, FileText, Filter, Search, ShieldCheck, X } from "lucide-react";

interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  target: string;
  ip: string;
  timestamp: string;
  status: "SUCCESS" | "WARNING" | "FAILURE";
  payload: Record<string, unknown>;
}

const INITIAL_LOGS: AuditEvent[] = [
  {
    id: "aud_901",
    action: "API_KEY_CREATED",
    actor: "Admin Prasad (admin@osterdops.com)",
    target: "Project: Production Gateway",
    ip: "192.168.1.5",
    timestamp: "2 mins ago",
    status: "SUCCESS",
    payload: {
      keyId: "key_live_94f2910a",
      name: "Production Gateway Key",
      permissions: ["chat.completions", "models.read"],
      environment: "production",
    },
  },
  {
    id: "aud_902",
    action: "BUDGET_HARD_LIMIT_BREACHED",
    actor: "System Sentinel",
    target: "Org: Acme Inc. ($2,500 monthly limit)",
    ip: "10.0.4.12",
    timestamp: "18 mins ago",
    status: "WARNING",
    payload: {
      budgetAmountUsd: 2500,
      currentSpendUsd: 2500.42,
      enforceHardLimit: true,
      actionTaken: "Blocked upstream dispatch with 429 Too Many Requests",
    },
  },
  {
    id: "aud_903",
    action: "ENCRYPTION_KEY_ROTATED",
    actor: "Security Engine",
    target: "Provider Credential Keystore",
    ip: "10.0.1.1",
    timestamp: "1 hour ago",
    status: "SUCCESS",
    payload: {
      algorithm: "AES-256-GCM",
      keysReEncrypted: 48,
      status: "Verified 0 failures",
    },
  },
  {
    id: "aud_904",
    action: "ADMIN_USER_INVITED",
    actor: "Admin Prasad (admin@osterdops.com)",
    target: "User: finance-auditor@osterdops.com",
    ip: "192.168.1.5",
    timestamp: "3 hours ago",
    status: "SUCCESS",
    payload: {
      invitedEmail: "finance-auditor@osterdops.com",
      assignedRole: "FINANCE_ADMIN",
      invitedBy: "Admin Prasad",
    },
  },
  {
    id: "aud_905",
    action: "MODEL_ROUTING_RULE_UPDATED",
    actor: "Shaan Prasad (Lead Architect)",
    target: "Rule: Fallback Claude 3.5 Sonnet -> GPT-4o",
    ip: "172.56.21.9",
    timestamp: "5 hours ago",
    status: "SUCCESS",
    payload: {
      primaryModel: "claude-3-5-sonnet-20241022",
      fallbackModel: "gpt-4o",
      timeoutThresholdMs: 4000,
    },
  },
];

export function AdminAuditLogsView() {
  const [logs] = useState<AuditEvent[]>(INITIAL_LOGS);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">Security &amp; Audit Logs</h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            SOC 2 Type II compliant immutable audit trail of all platform administration actions.
          </p>
        </div>

        <button
          onClick={() => alert("Downloading SOC2 Compliance Audit Log Archive...")}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#121622] hover:bg-[#181e2e] border border-[#1f2638] text-[#dfba82] rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Compliance Audit Package</span>
        </button>
      </div>

      <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 bg-[#131722] border border-[#22283a] focus-within:border-[#dfba82] rounded-xl px-3 py-1.5 w-72 mb-5 transition-colors">
          <Search className="h-3.5 w-3.5 text-[#6c7285]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit events by action..."
            className="bg-transparent text-[12px] text-white focus:outline-none w-full"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="text-[10.5px] uppercase font-bold tracking-[0.1em] text-[#555a6d] border-b border-[#171b26] pb-3">
              <tr>
                <th className="pb-3">Event Action</th>
                <th className="pb-3">Actor / Performed By</th>
                <th className="pb-3">Target Resource</th>
                <th className="pb-3">Origin IP</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151924] text-[#c5c8d4]">
              {filteredLogs.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => setSelectedEvent(l)}
                  className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                >
                  <td className="py-4 font-mono font-bold text-[#dfba82] group-hover:underline">
                    {l.action}
                  </td>
                  <td className="py-4 text-[#f4efe6]">{l.actor}</td>
                  <td className="py-4 text-[#8e94a8]">{l.target}</td>
                  <td className="py-4 font-mono text-[#555a6d]">{l.ip}</td>
                  <td className="py-4 text-[#717688] text-[11.5px]">{l.timestamp}</td>
                  <td className="py-4 text-right">
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        l.status === "SUCCESS"
                          ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30"
                          : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Event Detail Slideover */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0c0f16] border-l border-[#1f2638] h-full p-6 flex flex-col justify-between overflow-y-auto font-sans shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#1c2232]">
                <div>
                  <h3 className="text-[16px] font-bold text-white font-mono">{selectedEvent.action}</h3>
                  <span className="text-[11px] text-[#717688]">{selectedEvent.timestamp}</span>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-[#6c7285] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2 text-[12px]">
                <div className="p-3 bg-[#121622] rounded-xl border border-[#1d2334] space-y-1">
                  <div className="text-[#717688]">Actor:</div>
                  <div className="text-white font-medium">{selectedEvent.actor}</div>
                </div>
                <div className="p-3 bg-[#121622] rounded-xl border border-[#1d2334] space-y-1">
                  <div className="text-[#717688]">Target:</div>
                  <div className="text-[#dfba82] font-medium">{selectedEvent.target}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase font-bold text-[#717688] mb-2 tracking-wider">
                  Raw JSON Event Payload
                </div>
                <pre className="bg-[#07090e] border border-[#161c28] p-4 rounded-xl font-mono text-[11.5px] text-[#22c55e] max-h-72 overflow-y-auto leading-relaxed">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1c2232]">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2.5 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] rounded-xl text-[12.5px] font-bold transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

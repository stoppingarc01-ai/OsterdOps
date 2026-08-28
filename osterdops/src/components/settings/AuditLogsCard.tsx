"use client";

import React from "react";
import { History, ShieldCheck, User } from "lucide-react";

export function AuditLogsCard() {
  const logs = [
    { action: "API Key Generated", actor: "Shaan Prasad (Owner)", target: "Datadog APM Exporter", ip: "192.168.1.14", time: "12 mins ago" },
    { action: "Budget Cap Updated", actor: "Shaan Prasad (Owner)", target: "Customer Support ($12K)", ip: "192.168.1.14", time: "1 hour ago" },
    { action: "New Member Invited", actor: "Elena Rostova (Lead)", target: "Maya Lin (Developer)", ip: "10.0.4.12", time: "3 hours ago" },
    { action: "Policy Rule Enabled", actor: "Shaan Prasad (Owner)", target: "Lossless Prompt Compression", ip: "192.168.1.14", time: "Yesterday at 16:42" },
    { action: "Integration Configured", actor: "Elena Rostova (Lead)", target: "AWS Bedrock Cross-Account IAM", ip: "10.0.4.12", time: "May 14, 2025" },
  ];

  return (
    <div className="p-6 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#171a27]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#dfba82]" />
          <h3 className="text-base font-semibold text-[#f4efe6]">Security & Audit Trail Log</h3>
        </div>
        <span className="text-xs text-[#73788c] font-mono">Immutable Log Stream</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-medium">Event Action</th>
              <th className="pb-3 font-medium">User Actor</th>
              <th className="pb-3 font-medium">Target Entity</th>
              <th className="pb-3 font-medium">Origin IP</th>
              <th className="pb-3 font-medium text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151826]">
            {logs.map((log, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 pr-4 font-semibold text-white">
                  {log.action}
                </td>
                <td className="py-3.5 pr-4 text-[#c5c9d6]">
                  {log.actor}
                </td>
                <td className="py-3.5 pr-4 font-mono text-[#dfba82]">
                  {log.target}
                </td>
                <td className="py-3.5 pr-4 font-mono text-[#73788c]">
                  {log.ip}
                </td>
                <td className="py-3.5 text-right text-[#8e93a6] font-mono">
                  {log.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

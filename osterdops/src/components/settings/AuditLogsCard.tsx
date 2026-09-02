"use client";

import React, { useEffect, useState } from "react";
import { History, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  ip: string;
  time: string;
}

export function AuditLogsCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/audit-logs`, {
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data)) {
          const mapped: AuditEntry[] = res.data.map((l: any) => ({
            id: l.id,
            action: l.action || "AUDIT_EVENT",
            actor: l.actor || "User",
            target: l.target || l.resource || "system",
            ip: l.ip || "internal",
            time: l.timestamp ? new Date(l.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent",
          }));
          setLogs(mapped);
        } else {
          setLogs([]);
        }
      } catch (err) {
        if (isMounted) setLogs([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

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
        {loading ? (
          <div className="p-8 text-center text-xs text-[#8e93a6] space-y-2">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
            <div>Loading audit log stream...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#73788c] bg-[#090b12] rounded-xl border border-[#161824]">
            No audit records logged yet
          </div>
        ) : (
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
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
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
        )}
      </div>
    </div>
  );
}

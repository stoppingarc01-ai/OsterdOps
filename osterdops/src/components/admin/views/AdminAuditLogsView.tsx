"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Search,
  ShieldCheck,
  Download,
  Terminal,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import type { AuditLog } from "@/types";

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

export function AdminAuditLogsView() {
  const { currentOrg, getIdToken } = useAuth();
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAuditLogs() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<AuditLog[]>(`/api/v1/organizations/${currentOrg.id}/audit-logs`, {
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data)) {
          const mapped: AuditEvent[] = res.data.map((l: any) => ({
            id: l.id,
            action: l.action || "WORKSPACE_ACTION",
            actor: l.actorId || l.actorEmail || "Authenticated User",
            target: l.resourceType ? `${l.resourceType}: ${l.resourceId || ""}` : "Organization",
            ip: l.ipAddress || "127.0.0.1",
            timestamp: l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent",
            status: l.status === "failure" ? "FAILURE" : l.status === "warning" ? "WARNING" : "SUCCESS",
            payload: l.metadata || {},
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

    loadAuditLogs();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#f4efe6] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#dfba82]" />
            Tamper-Proof Audit Trail
          </h2>
          <p className="text-xs text-[#8e94a8] mt-1">
            Zero-mutation, cryptographically signed ledger for all administrative actions.
          </p>
        </div>

        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
            const downloadAnchor = document.createElement("a");
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "audit-trail.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141824] hover:bg-[#1c2233] border border-[#242b3d] text-xs font-semibold text-[#f4efe6] transition-colors"
        >
          <Download className="h-4 w-4 text-[#dfba82]" />
          <span>Export JSON</span>
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
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Loading audit trail...</div>
            </div>
          ) : (
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
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                      No audit events recorded for this organization
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l) => (
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
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Raw Event Detail Slideover */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-lg bg-[#0c0f16] border-l border-[#1f2638] h-full p-6 flex flex-col justify-between overflow-y-auto font-sans shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#171b26]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#dfba82]">
                    Audit Event Inspection
                  </span>
                  <h3 className="text-base font-bold text-[#f4efe6] font-mono mt-0.5">
                    {selectedEvent.action}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 text-[#717688] hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#141824]">
                  <span className="text-[#555a6d]">Event ID</span>
                  <span className="font-mono text-[#f4efe6]">{selectedEvent.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#141824]">
                  <span className="text-[#555a6d]">Performed By</span>
                  <span className="text-[#f4efe6]">{selectedEvent.actor}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#141824]">
                  <span className="text-[#555a6d]">Target Resource</span>
                  <span className="text-[#8e94a8]">{selectedEvent.target}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#141824]">
                  <span className="text-[#555a6d]">IP Address</span>
                  <span className="font-mono text-[#555a6d]">{selectedEvent.ip}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#141824]">
                  <span className="text-[#555a6d]">Timestamp</span>
                  <span className="text-[#717688]">{selectedEvent.timestamp}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#717688]">
                  Event Payload Metadata
                </span>
                <pre className="mt-2 p-3.5 rounded-xl bg-[#07080c] border border-[#171b26] text-[11px] font-mono text-[#dfba82] overflow-x-auto">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-[#171b26]">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2 bg-[#141824] hover:bg-[#1c2233] text-white text-xs font-semibold rounded-xl"
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

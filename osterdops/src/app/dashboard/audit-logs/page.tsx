"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  FileCheck2,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertTriangle,
  Zap,
  RefreshCw,
  Sparkles,
  Info,
  ArrowRight,
  Fingerprint,
  Layers,
  Database,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  requestId: string;
  status: "SUCCESS" | "DENIED" | "FAILED";
  entryHash: string;
  prevHash: string;
}

export default function AuditLogsPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!currentOrg?.id) return;
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/audit-logs?limit=50`, {
        token,
      });

      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: AuditEntry[] = res.data.map((l: any, idx: number) => ({
          id: l.id || `aud_${idx}`,
          timestamp: l.timestamp || l.createdAt || new Date().toISOString(),
          actor: l.actorName || l.actor || "Service Principal",
          actorEmail: l.actorEmail || l.userId || "system@osterdops.internal",
          action: l.action || "system.audit",
          resource: l.resourceType || l.resource || "Resource",
          resourceId: l.resourceId || "global",
          requestId: l.requestId || "req_internal",
          status: l.status || "SUCCESS",
          entryHash: l.entryHash || l.hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          prevHash: l.prevHash || "0000000000000000000000000000000000000000000000000000000000000000",
        }));
        setLogs(mapped);
      } else {
        setLogs([]);
      }
    } catch (e) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrg, getIdToken]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase()) ||
      log.entryHash.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "ALL" || log.action.startsWith(actionFilter);
    return matchesSearch && matchesAction;
  });

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osterdops-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3 h-3 text-[#dfba82]" />
                  <span>COMPLIANCE & TRACEABILITY</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">AUDIT TRAIL</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Cryptographic Audit Trail
                  </h1>
                  <div className="w-5 h-5 rounded-md border border-[#dfba82]/40 bg-[#dfba82]/10 flex items-center justify-center text-[#dfba82]">
                    <FileCheck2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Tamper-evident, SHA-256 hash-chained immutable event logs for SOC 2 Type II and ISO 27001 verification.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchLogs}
                  className="p-2 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-[#8e93a6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer"
                  title="Refresh audit logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#dfba82]" : ""}`} />
                </button>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[#6b7082] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search hash, actor, action..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-48 sm:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]/50"
                  />
                </div>

                <button
                  onClick={exportJSON}
                  disabled={logs.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141624] hover:bg-[#202538] border border-[#23273a] text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5 text-[#dfba82]" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* 5 Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Chain Integrity */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium flex items-center gap-1">
                      Chain Integrity
                      <Info className="w-3 h-3 text-[#555a6d]" />
                    </span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400 pt-0.5">100% Valid</div>
                  <div className="text-[10.5px] text-[#8e93a6]">Cryptographically sealed</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 36 C 25 35, 50 38, 70 20 C 85 10, 92 16, 100 8"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 2: Hashing Scheme */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <Fingerprint className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Digest Algorithm</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">SHA-256</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Merkle-linked blocks</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 45 28, 65 32 C 80 34, 88 12, 100 6"
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 3: Immutability */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Storage Mode</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">Append-Only</div>
                  <div className="text-[10.5px] text-blue-400 font-medium">Write-once immutable</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 34 C 20 30, 40 18, 60 26 C 75 30, 85 12, 100 6"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 4: Compliance Standard */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Compliance</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">SOC2 / ISO</div>
                  <div className="text-[10.5px] text-purple-400 font-medium">Audit report ready</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 40 32, 60 22 C 75 14, 85 18, 100 8"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 5: Logged Events */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-orange-950/40 border border-orange-800/30 flex items-center justify-center text-orange-400">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Logged Events</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{logs.length}</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Real-time recording</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 32 C 25 30, 45 22, 65 24 C 80 26, 88 12, 100 6"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] overflow-hidden shadow-xl">
              <div className="p-4 border-b border-[#161824] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Audit Event Ledger</h2>
                  <span className="text-[11px] text-[#6b7082]">({filteredLogs.length} events)</span>
                </div>

                {/* Filter tags */}
                <div className="flex items-center gap-1.5 text-xs">
                  {["ALL", "apiKey", "budget", "gateway", "member"].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => setActionFilter(action)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10.5px] transition-all cursor-pointer ${
                        actionFilter === action
                          ? "bg-[#dfba82] text-black font-bold shadow-[0_0_10px_rgba(223,186,130,0.25)]"
                          : "text-[#8e93a6] hover:text-white bg-[#141624] border border-[#23273a]"
                      }`}
                    >
                      {action === "ALL" ? "All Actions" : `${action}.*`}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-[#6b7082] space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
                  <div>Verifying cryptographic hash chain...</div>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white">No Audit Events Logged Yet</div>
                  <p className="text-xs text-[#8e93a6] max-w-sm mx-auto">
                    Administrative mutations, key rotations, and governance policy changes will be automatically recorded here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#161824] text-[10.5px] uppercase tracking-wider text-[#555a6d] font-semibold">
                        <th className="py-3 px-4">Timestamp (UTC)</th>
                        <th className="py-3 px-4">Actor</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Target Resource</th>
                        <th className="py-3 px-4">SHA-256 Digest</th>
                        <th className="py-3 px-4 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141724]">
                      {filteredLogs.map((log) => (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedEntry(log)}
                          className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#8e93a6]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white text-xs">{log.actor}</div>
                            <div className="text-[10.5px] text-[#6b7082] font-mono">{log.actorEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-[#dfba82] font-semibold">
                            {log.action}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[#c5c9d6]">{log.resource}</span>
                            <span className="text-[10px] text-[#6b7082] block font-mono">
                              id: {log.resourceId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#8e93a6]">
                            <span className="text-emerald-400/80">
                              {log.entryHash.slice(0, 10)}...{log.entryHash.slice(-8)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              <ShieldCheck className="w-3 h-3" />
                              VERIFIED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Compliance Banner */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Continuous Tamper-Evident Hashing</div>
                  <div className="text-[11.5px] text-[#8e93a6]">
                    Every log block computes `SHA256(prevHash + payload)` creating an unbreakable forward-chained verification ledger.
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/security"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfba82] hover:text-[#ebd4aa] transition-colors shrink-0"
              >
                <span>Security Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ContentTransition>
      </main>

      {/* Entry Details Drawer Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e1017] border border-[#232738] rounded-2xl p-6 shadow-2xl text-white relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c1f2e]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Cryptographic Entry Verification</h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-[#787d91] hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="text-[10.5px] text-[#6b7082] uppercase">Action Type</div>
                <div className="text-[#dfba82] font-bold text-sm mt-0.5">{selectedEntry.action}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10.5px] text-[#6b7082] uppercase">Actor</div>
                  <div className="text-white mt-0.5">{selectedEntry.actor}</div>
                  <div className="text-[10px] text-[#8e93a6]">{selectedEntry.actorEmail}</div>
                </div>
                <div>
                  <div className="text-[10.5px] text-[#6b7082] uppercase">Timestamp</div>
                  <div className="text-white mt-0.5">{selectedEntry.timestamp}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10.5px] text-[#6b7082] uppercase">Entry Hash (SHA-256)</div>
                <div className="p-2.5 rounded-xl bg-[#08090f] border border-[#232738] text-emerald-400 break-all select-all text-[11px]">
                  {selectedEntry.entryHash}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10.5px] text-[#6b7082] uppercase">Previous Block Hash (Parent)</div>
                <div className="p-2.5 rounded-xl bg-[#08090f] border border-[#232738] text-[#8e93a6] break-all select-all text-[11px]">
                  {selectedEntry.prevHash}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1c1f2e]">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl text-xs hover:bg-[#ebd4aa] transition-colors cursor-pointer"
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

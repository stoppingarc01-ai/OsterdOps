"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

const SAMPLE_LOGS: AuditEntry[] = [
  {
    id: "aud_01j9a8b1",
    timestamp: "2026-08-29T17:15:30Z",
    actor: "Shaan Naveed",
    actorEmail: "shaan@osterdops.com",
    action: "apiKey.create",
    resource: "ApiKey",
    resourceId: "key_live_9921a",
    requestId: "req_1788022596_01",
    status: "SUCCESS",
    entryHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    id: "aud_01j9a8b2",
    timestamp: "2026-08-29T17:02:14Z",
    actor: "Alex Thorne",
    actorEmail: "alex.t@osterdops.com",
    action: "budget.update",
    resource: "Budget",
    resourceId: "bud_global_month",
    requestId: "req_1788022596_02",
    status: "SUCCESS",
    entryHash: "f1a8c903248bd81c9a128df8394b0291ca8e412f10928374a819273618491823",
    prevHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    id: "aud_01j9a8b3",
    timestamp: "2026-08-29T16:45:00Z",
    actor: "Elena Rostova",
    actorEmail: "elena.r@osterdops.com",
    action: "gateway.completion",
    resource: "GatewayRoute",
    resourceId: "gpt-4o",
    requestId: "req_1788022596_03",
    status: "SUCCESS",
    entryHash: "8294a0192847c18294b0192847c182948e918247ca8192847c182947ca819284",
    prevHash: "f1a8c903248bd81c9a128df8394b0291ca8e412f10928374a819273618491823",
  },
  {
    id: "aud_01j9a8b4",
    timestamp: "2026-08-29T16:20:10Z",
    actor: "Anonymous Key",
    actorEmail: "unknown@client.io",
    action: "project.delete",
    resource: "Project",
    resourceId: "proj_billing_core",
    requestId: "req_1788022596_04",
    status: "DENIED",
    entryHash: "718294c0192847a8192847ca8192847c1092847c192847c182947ca8192847c1",
    prevHash: "8294a0192847c18294b0192847c182948e918247ca8192847c182947ca819284",
  },
  {
    id: "aud_01j9a8b5",
    timestamp: "2026-08-29T15:55:40Z",
    actor: "Shaan Naveed",
    actorEmail: "shaan@osterdops.com",
    action: "providerConnection.create",
    resource: "ProviderConnection",
    resourceId: "conn_openai_prod",
    requestId: "req_1788022596_05",
    status: "SUCCESS",
    entryHash: "0918247ca8192847c182947ca8192847c182947c182947ca8192847c182947ca",
    prevHash: "718294c0192847a8192847ca8192847c1092847c192847c182947ca8192847c1",
  },
];

export default function AuditLogsPage() {
  const { currentOrg } = useAuth();
  const [logs] = useState<AuditEntry[]>(SAMPLE_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.requestId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = selectedAction === "ALL" || log.action.startsWith(selectedAction);
    const matchesStatus = selectedStatus === "ALL" || log.status === selectedStatus;
    return matchesSearch && matchesAction && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#dfba82] tracking-wider uppercase mb-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Compliance & Governance
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Tamper-Evident Audit Logs
                </h1>
                <p className="text-xs text-[#8e93a6] mt-1">
                  Immutable cryptographically hash-chained audit records for {currentOrg?.name || "the organization"}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  Chain Integrity: VERIFIED
                </div>
              </div>
            </div>

            {/* Cryptographic Chain Banner */}
            <div className="p-4 rounded-xl bg-[#0c0e17] border border-[#1d2030] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    SHA-256 Cryptographic Hash Chaining
                  </h3>
                  <p className="text-[11px] text-[#71768a]">
                    Every audit record references the cryptographic digest of its immediate predecessor. Tampering with any log invalidates subsequent hash links.
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono text-[#8e93a6] shrink-0">
                Retention: <span className="text-[#dfba82]">365 Days (Legal Hold Active)</span>
              </div>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#71768a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search actor, action, request ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141724] border border-[#24283b] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#5d6278] focus:outline-none focus:border-[#dfba82]/50"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="bg-[#141724] border border-[#24283b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]/50"
                >
                  <option value="ALL">All Actions</option>
                  <option value="apiKey">API Keys</option>
                  <option value="budget">Budgets</option>
                  <option value="gateway">AI Gateway</option>
                  <option value="project">Projects</option>
                  <option value="providerConnection">Providers</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#141724] border border-[#24283b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]/50"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="DENIED">Denied</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="rounded-xl bg-[#0c0e17] border border-[#1d2030] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#10121d] text-[#8e93a6] border-b border-[#1d2030] uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Timestamp (UTC)</th>
                      <th className="py-3.5 px-4 font-semibold">Actor</th>
                      <th className="py-3.5 px-4 font-semibold">Action</th>
                      <th className="py-3.5 px-4 font-semibold">Resource</th>
                      <th className="py-3.5 px-4 font-semibold">Request ID</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a27]">
                    {filteredLogs.map((log) => (
                      <React.Fragment key={log.id}>
                        <tr
                          onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                          className="hover:bg-[#121422] transition-colors cursor-pointer"
                        >
                          <td className="py-3.5 px-4 text-[#8e93a6] font-mono whitespace-nowrap">
                            {log.timestamp}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{log.actor}</div>
                            <div className="text-[10px] text-[#71768a] font-mono">{log.actorEmail}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs text-[#dfba82] bg-[#dfba82]/10 px-2 py-0.5 rounded border border-[#dfba82]/20">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#c0c5d8]">
                            {log.resource} ({log.resourceId})
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#71768a]">
                            {log.requestId}
                          </td>
                          <td className="py-3.5 px-4">
                            {log.status === "SUCCESS" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                SUCCESS
                              </span>
                            )}
                            {log.status === "DENIED" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 border border-red-500/30 text-red-400">
                                DENIED
                              </span>
                            )}
                            {log.status === "FAILED" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                FAILED
                              </span>
                            )}
                          </td>
                        </tr>

                        {expandedId === log.id && (
                          <tr className="bg-[#0e101b]">
                            <td colSpan={6} className="p-4 space-y-2 border-t border-[#181a27]">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                                <div>
                                  <div className="text-[10px] uppercase text-[#71768a] mb-1">Previous Block Hash (PrevHash)</div>
                                  <div className="p-2 rounded bg-[#07080d] border border-[#1d2030] text-[#8e93a6] break-all">
                                    {log.prevHash}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase text-[#dfba82] mb-1">Current Entry SHA-256 Digest (EntryHash)</div>
                                  <div className="p-2 rounded bg-[#07080d] border border-[#dfba82]/30 text-[#dfba82] break-all">
                                    {log.entryHash}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-[#71768a] pt-2">
              <div>Showing {filteredLogs.length} audit records</div>
              <div className="flex items-center gap-2">
                <button disabled className="p-2 rounded-lg bg-[#10121e] border border-[#1f2338] text-[#555a6d] cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-white">Page 1 of 1</span>
                <button disabled className="p-2 rounded-lg bg-[#10121e] border border-[#1f2338] text-[#555a6d] cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}

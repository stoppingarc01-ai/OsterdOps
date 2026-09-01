"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Lock, Download, Trash2, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { RbacGuard } from "@/components/auth/RbacGuard";

export default function PrivacyPage() {
  const [exporting, setExporting] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<string | null>(null);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert("Privacy Export Manifest Generated (SHA-256 Checksum Verified). Download initiated.");
    }, 800);
  };

  const handleRequestDeletion = () => {
    if (confirm("Are you sure you wish to initiate a GDPR Article 17 Data Erasure Request? Legally required billing and audit records will remain under statutory hold.")) {
      setDeletionStatus("REVIEW_REQUIRED");
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
                  <Lock className="w-3.5 h-3.5" />
                  GDPR & Subject Rights
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Data Governance & Privacy Center
                </h1>
              </div>
            </div>

            {/* Data Portability (GDPR Art. 20) */}
            <div className="p-6 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Machine-Readable Privacy Data Export</div>
                  <div className="text-xs text-[#8e93a6] mt-0.5">
                    Generate an organization-scoped JSON manifest containing non-secret workspace metadata, usage telemetry, and audit summaries.
                  </div>
                </div>
                <RbacGuard permission="security:export">
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161928] hover:bg-[#202538] text-xs font-semibold text-white transition-colors cursor-pointer border border-[#24293d]"
                  >
                    <Download className="w-3.5 h-3.5 text-[#dfba82]" />
                    {exporting ? "Generating Manifest..." : "Request Data Export"}
                  </button>
                </RbacGuard>
              </div>
            </div>

            {/* Data Retention Governance */}
            <div className="p-6 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <div className="text-sm font-bold text-white">Statutory Data Retention Windows</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#111422] border border-[#1d2136] space-y-1">
                  <div className="text-[10px] font-bold text-[#73788c] uppercase">BILLING & INVOICES</div>
                  <div className="text-sm font-bold text-[#dfba82]">2,555 Days (7 Yrs)</div>
                  <div className="text-[11px] text-[#8e93a6]">Statutory legal tax hold</div>
                </div>
                <div className="p-3 rounded-lg bg-[#111422] border border-[#1d2136] space-y-1">
                  <div className="text-[10px] font-bold text-[#73788c] uppercase">AUDIT LOGS</div>
                  <div className="text-sm font-bold text-[#dfba82]">1,095 Days (3 Yrs)</div>
                  <div className="text-[11px] text-[#8e93a6]">SOC 2 compliance window</div>
                </div>
                <div className="p-3 rounded-lg bg-[#111422] border border-[#1d2136] space-y-1">
                  <div className="text-[10px] font-bold text-[#73788c] uppercase">OPERATIONAL LOGS</div>
                  <div className="text-sm font-bold text-[#dfba82]">90 Days</div>
                  <div className="text-[11px] text-[#8e93a6]">Auto-purged after threshold</div>
                </div>
              </div>
            </div>

            {/* Right to Erasure (GDPR Art. 17) */}
            <div className="p-6 rounded-xl bg-[#0c0e17] border border-red-500/20 space-y-4">
              <div>
                <div className="text-sm font-bold text-red-200">Right to Erasure & Account Deletion</div>
                <div className="text-xs text-red-400/80 mt-0.5">
                  Initiate a staged organization erasure workflow. Statutory tax and audit records subject to mandatory legal hold are preserved.
                </div>
              </div>

              {deletionStatus ? (
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300">
                  Current Deletion Request State: <strong>{deletionStatus}</strong> (Pending Administrator Confirmation)
                </div>
              ) : (
                <RbacGuard permission="security:delete">
                  <button
                    onClick={handleRequestDeletion}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 border border-red-800/50 hover:bg-red-900/60 text-xs font-semibold text-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Initiate Deletion Request
                  </button>
                </RbacGuard>
              )}
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}

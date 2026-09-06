"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Receipt, Download, ArrowUpRight, CheckCircle2, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GenerateInvoiceModal } from "@/components/billing/GenerateInvoiceModal";

const INVOICES = [
  { id: "inv_2026_08", period: "Aug 1 - Aug 31, 2026", baseSubscription: "$49.00", overage: "$0.00", credits: "$0.00", total: "$49.00", status: "PAID", date: "Aug 29, 2026" },
  { id: "inv_2026_07", period: "Jul 1 - Jul 31, 2026", baseSubscription: "$49.00", overage: "$12.40", credits: "-$5.00", total: "$56.40", status: "PAID", date: "Jul 31, 2026" },
  { id: "inv_2026_06", period: "Jun 1 - Jun 30, 2026", baseSubscription: "$49.00", overage: "$0.00", credits: "$0.00", total: "$49.00", status: "PAID", date: "Jun 30, 2026" },
];

export default function InvoicesPage() {
  const { currentOrg, userProfile, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Receipt className="w-3.5 h-3.5" />
                  Tax &amp; Statements
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Invoices &amp; Payment History
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold transition-all cursor-pointer shadow-[0_2px_12px_rgba(223,186,130,0.3)] hover:-translate-y-0.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Invoice</span>
                </button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="rounded-xl border border-[#1b1e2c] bg-[#0c0e17] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111422] text-[#8e93a6] border-b border-[#1b1e2c]">
                    <tr>
                      <th className="p-3.5 font-semibold">Invoice ID</th>
                      <th className="p-3.5 font-semibold">Billing Period</th>
                      <th className="p-3.5 font-semibold">Base Plan</th>
                      <th className="p-3.5 font-semibold">Overage</th>
                      <th className="p-3.5 font-semibold">Total Amount</th>
                      <th className="p-3.5 font-semibold">Status</th>
                      <th className="p-3.5 font-semibold text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161928]">
                    {INVOICES.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-mono text-[#dfba82] font-semibold">{inv.id}</td>
                        <td className="p-3.5 text-[#c5c9d6]">{inv.period}</td>
                        <td className="p-3.5 text-[#8e93a6]">{inv.baseSubscription}</td>
                        <td className="p-3.5 text-[#8e93a6]">{inv.overage}</td>
                        <td className="p-3.5 font-bold text-white">{inv.total}</td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            <CheckCircle2 className="w-3 h-3" />
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => window.open(`/api/v1/invoices/${inv.id}/download`, "_blank")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-[#1d2233] border border-[#232a3e] hover:border-[#dfba82]/50 text-xs font-semibold text-[#c5c9d6] hover:text-white transition-all cursor-pointer"
                            title={`Download PDF ${inv.id}`}
                          >
                            <Download className="w-3 h-3 text-[#dfba82]" />
                            <span>PDF</span>
                          </button>
                          <Link
                            href={`/dashboard/billing/invoices/${inv.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161928] hover:bg-[#202538] text-xs font-semibold text-white transition-colors"
                          >
                            View
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ContentTransition>

        <GenerateInvoiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultClientName={userProfile?.name || user?.displayName || user?.email || "Valued Client"}
          defaultCompanyName={currentOrg?.name || "Enterprise AI Workspace"}
          defaultAddress="100 Enterprise Way, Suite 400, San Francisco, CA"
          defaultTaxId=""
        />
      </main>
    </div>
  );
}

"use client";

import React from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Receipt, Download, ArrowUpRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const INVOICES = [
  { id: "inv_2026_08", period: "Aug 1 - Aug 31, 2026", baseSubscription: "$49.00", overage: "$0.00", credits: "$0.00", total: "$49.00", status: "PAID", date: "Aug 29, 2026" },
  { id: "inv_2026_07", period: "Jul 1 - Jul 31, 2026", baseSubscription: "$49.00", overage: "$12.40", credits: "-$5.00", total: "$56.40", status: "PAID", date: "Jul 31, 2026" },
  { id: "inv_2026_06", period: "Jun 1 - Jun 30, 2026", baseSubscription: "$49.00", overage: "$0.00", credits: "$0.00", total: "$49.00", status: "PAID", date: "Jun 30, 2026" },
];

export default function InvoicesPage() {
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
                  Tax & Statements
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Invoices & Payment History
                </h1>
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
                        <td className="p-3.5 text-right">
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
      </main>
    </div>
  );
}

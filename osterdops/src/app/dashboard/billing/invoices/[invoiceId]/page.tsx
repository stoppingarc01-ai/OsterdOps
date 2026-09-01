"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import { Receipt, CheckCircle2, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = (params?.invoiceId as string) || "inv_2026_08";

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6 max-w-4xl">
            <Link
              href="/dashboard/billing/invoices"
              className="inline-flex items-center gap-1.5 text-xs text-[#8e93a6] hover:text-[#dfba82] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Invoices
            </Link>

            {/* Invoice Header */}
            <div className="p-6 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-[#dfba82]">{invoiceId}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3" />
                    PAID
                  </span>
                </div>
                <div className="text-xs text-[#8e93a6]">Period: Aug 1 - Aug 31, 2026 | Paid on Aug 29, 2026</div>
              </div>

              <button
                onClick={() => alert("Downloading PDF tax statement...")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161928] hover:bg-[#202538] text-xs font-semibold text-white transition-colors cursor-pointer border border-[#24293d]"
              >
                <Download className="w-3.5 h-3.5 text-[#dfba82]" />
                Download PDF
              </button>
            </div>

            {/* Line Items Table */}
            <div className="p-6 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4">
              <div className="text-sm font-semibold text-[#f4efe6]">Statement Line Items</div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#73788c] border-b border-[#1b1e2c]">
                  <tr>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161928]">
                  <tr>
                    <td className="py-3 text-white font-medium">OsterdOps Pro Tier Base Subscription</td>
                    <td className="py-3 text-[#8e93a6]">1 mo</td>
                    <td className="py-3 text-right text-[#8e93a6]">$49.00</td>
                    <td className="py-3 text-right font-bold text-white">$49.00</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-white font-medium">Metered Gateway Token Allowance (10M Tokens)</td>
                    <td className="py-3 text-[#8e93a6]">2.45M</td>
                    <td className="py-3 text-right text-[#8e93a6]">Included</td>
                    <td className="py-3 text-right font-bold text-white">$0.00</td>
                  </tr>
                </tbody>
                <tfoot className="border-t border-[#1b1e2c]">
                  <tr>
                    <td colSpan={3} className="pt-4 text-right font-semibold text-[#8e93a6]">Total Paid</td>
                    <td className="pt-4 text-right font-bold text-base text-[#dfba82]">$49.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}

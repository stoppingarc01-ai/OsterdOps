"use client";

import React from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";

export function InvoiceHistoryCard() {
  const invoices = [
    { id: "INV-2025-0501", date: "May 01, 2025", period: "Apr 01 - Apr 30, 2025", amount: "$38,421.19", method: "Visa **** 4242", status: "Paid" },
    { id: "INV-2025-0401", date: "Apr 01, 2025", period: "Mar 01 - Mar 31, 2025", amount: "$34,180.50", method: "Visa **** 4242", status: "Paid" },
    { id: "INV-2025-0301", date: "Mar 01, 2025", period: "Feb 01 - Feb 28, 2025", amount: "$29,940.80", method: "Visa **** 4242", status: "Paid" },
    { id: "INV-2025-0201", date: "Feb 01, 2025", period: "Jan 01 - Jan 31, 2025", amount: "$24,510.00", method: "Visa **** 4242", status: "Paid" },
  ];

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Invoice History & Statements</h3>
        <span className="text-xs text-[#73788c] font-mono">Billed to: Acme Corp Inc.</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-medium">Invoice Number</th>
              <th className="pb-3 font-medium">Billing Period</th>
              <th className="pb-3 font-medium">Payment Date</th>
              <th className="pb-3 font-medium text-right">Total Amount</th>
              <th className="pb-3 font-medium text-center">Status</th>
              <th className="pb-3 font-medium text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151826]">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pr-4 font-mono font-medium text-white flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#dfba82]" />
                  <span>{inv.id}</span>
                </td>
                <td className="py-3 pr-4 text-[#8e93a6] font-mono">{inv.period}</td>
                <td className="py-3 pr-4 text-[#8e93a6]">{inv.date}</td>
                <td className="py-3 pr-4 text-right font-mono font-bold text-white">
                  {inv.amount}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4ade80]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{inv.status}</span>
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-[#141724] border border-[#232738] hover:border-[#dfba82]/40 text-[#c5c9d6] hover:text-white transition-all inline-flex items-center gap-1 cursor-pointer"
                    title="Download PDF Invoice"
                  >
                    <Download className="w-3 h-3 text-[#dfba82]" />
                    <span className="text-[10.5px]">PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

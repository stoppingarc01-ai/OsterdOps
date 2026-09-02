"use client";

import React, { useEffect, useState } from "react";
import { Download, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface InvoiceItem {
  id: string;
  date: string;
  period: string;
  amount: string;
  status: string;
  pdfUrl?: string;
}

export function InvoiceHistoryCard() {
  const { currentOrg, getIdToken } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchInvoices() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<InvoiceItem[]>("/api/v1/billing/invoices", {
          params: { organizationId: currentOrg.id },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data)) {
          setInvoices(res.data);
        } else {
          setInvoices([]);
        }
      } catch (err) {
        if (isMounted) setInvoices([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInvoices();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Invoice History & Statements</h3>
        <span className="text-xs text-[#73788c] font-mono">
          Billed to: {currentOrg?.name || "Organization"}
        </span>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#8e93a6] space-y-2">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#dfba82]" />
            <div>Loading invoice statements...</div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#73788c] bg-[#090b12] rounded-xl border border-[#161824] space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-white">No invoice statements yet</div>
            <p className="text-[11px] text-[#73788c]">
              Invoices will automatically generate and appear here at the close of each billing cycle.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

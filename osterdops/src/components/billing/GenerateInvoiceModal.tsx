"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Building2,
  MapPin,
  FileCheck2,
  Loader2,
  X,
  Sparkles,
  ShieldCheck,
  Download,
  AlertCircle,
} from "lucide-react";

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientName?: string;
  defaultCompanyName?: string;
  defaultAddress?: string;
  defaultTaxId?: string;
  onSuccess?: (invoiceId: string) => void;
}

export function GenerateInvoiceModal({
  isOpen,
  onClose,
  defaultClientName = "",
  defaultCompanyName = "",
  defaultAddress = "100 Enterprise Way, Suite 400, San Francisco, CA",
  defaultTaxId = "",
  onSuccess,
}: GenerateInvoiceModalProps) {
  const [clientName, setClientName] = useState(defaultClientName);
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [address, setAddress] = useState(defaultAddress);
  const [taxId, setTaxId] = useState(defaultTaxId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync defaults when modal opens or defaults change
  useEffect(() => {
    if (isOpen) {
      if (defaultClientName && !clientName) setClientName(defaultClientName);
      if (defaultCompanyName && !companyName) setCompanyName(defaultCompanyName);
      if (defaultAddress && !address) setAddress(defaultAddress);
      if (defaultTaxId && !taxId) setTaxId(defaultTaxId);
      setErrorMsg(null);
    }
  }, [isOpen, defaultClientName, defaultCompanyName, defaultAddress, defaultTaxId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return; // Strict single-submission idempotency lock

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const payload = {
        clientName: clientName.trim(),
        companyName: companyName.trim(),
        address: address.trim(),
        taxId: taxId.trim() || undefined,
      };

      const res = await fetch("/api/v1/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errDesc = "Failed to generate invoice.";
        try {
          const errData = await res.json();
          errDesc = errData.message || errDesc;
        } catch {
          // ignore json parse error
        }
        throw new Error(errDesc);
      }

      // Stream PDF directly to client download
      const blob = await res.blob();
      const invoiceId = res.headers.get("X-Invoice-Id") || `inv_${Date.now()}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (onSuccess) {
        onSuccess(invoiceId);
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0c0e17] border border-[#1b1e2c] rounded-2xl shadow-2xl overflow-hidden text-white relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#161824] bg-[#0f111d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/30 text-[#dfba82]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Generate Official Tax Invoice
              </h3>
              <p className="text-[11px] text-[#8e93a6]">
                Swiss-minimalist vector PDF with custom corporate billing details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-[#73788c] hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Client Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#c5c9d6] flex items-center gap-1.5">
              <span>Attention / Client Name</span>
            </label>
            <input
              type="text"
              required
              disabled={isGenerating}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. John Doe (Finance Operations)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-[#232a3e] focus:border-[#dfba82] focus:outline-none text-white text-xs font-medium placeholder-[#555b70] transition-colors disabled:opacity-50"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#c5c9d6] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#dfba82]" />
              <span>Company / Organization Name</span>
            </label>
            <input
              type="text"
              required
              disabled={isGenerating}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp AI Inc."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-[#232a3e] focus:border-[#dfba82] focus:outline-none text-white text-xs font-medium placeholder-[#555b70] transition-colors disabled:opacity-50"
            />
          </div>

          {/* Billing Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#c5c9d6] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#dfba82]" />
              <span>Registered Billing Address</span>
            </label>
            <textarea
              required
              rows={3}
              disabled={isGenerating}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 100 Enterprise Way, Suite 400&#10;San Francisco, CA 94105, United States"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-[#232a3e] focus:border-[#dfba82] focus:outline-none text-white text-xs font-medium placeholder-[#555b70] transition-colors resize-none disabled:opacity-50 leading-relaxed"
            />
          </div>

          {/* Tax ID / GSTIN */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#c5c9d6] flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-[#dfba82]" />
                <span>Tax ID / VAT / GSTIN</span>
              </label>
              <span className="text-[10.5px] text-[#73788c] font-mono">Optional</span>
            </div>
            <input
              type="text"
              disabled={isGenerating}
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="e.g. US-EIN-987654321 or GSTIN27AAAAA0000A1Z5"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-[#232a3e] focus:border-[#dfba82] focus:outline-none text-white text-xs font-mono placeholder-[#555b70] transition-colors disabled:opacity-50"
            />
          </div>

          {/* Net-30 & Idempotency Badge */}
          <div className="p-3 rounded-xl bg-[#121624] border border-[#1b2034] text-[11px] text-[#8e93a6] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-white">Automated Net-30 Single-Invoice Guarantee</span>
              <p className="leading-tight text-[#8e93a6]">
                Issue date will lock to today, due date to Net-30. Duplicate records for this cycle are automatically prevented.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1d2233] border border-[#232a3e] text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-[0_2px_12px_rgba(223,186,130,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Generate &amp; Download</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  CreditCard,
  Save,
  CheckCircle2,
  Receipt,
  Zap,
  Shield,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { RbacGuard } from "@/components/auth/RbacGuard";

export default function BillingSettingsPage() {
  const [invoiceEmail, setInvoiceEmail] = useState("billing@company.com");
  const [autoRenew, setAutoRenew] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1.5 text-xs text-[#8e93a6] hover:text-[#dfba82] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Settings
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#dfba82] tracking-wider uppercase mb-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  Billing & Invoicing Preferences
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Billing Configuration & Tax Details
                </h1>
                <p className="text-xs text-[#8e93a6] mt-1">
                  Manage invoice notification recipients, tax identifiers, and automated subscription renewal.
                </p>
              </div>

              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141724] border border-[#24283b] text-xs font-medium text-white hover:border-[#dfba82]/40 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-[#dfba82]" />
                View Subscription Plan
              </Link>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
              {/* Receipt Delivery */}
              <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1e2234] space-y-4">
                <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#dfba82]" />
                  Invoice & Receipt Dispatch
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#8e93a6] mb-1">Billing Email for Receipts</label>
                  <input
                    type="email"
                    required
                    value={invoiceEmail}
                    onChange={(e) => setInvoiceEmail(e.target.value)}
                    className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#5d6278] focus:outline-none focus:border-[#dfba82]/50"
                  />
                  <p className="text-[11px] text-[#71768a] mt-1">PDF receipts will be automatically dispatched to this inbox upon successful monthly settlement.</p>
                </div>
              </div>

              {/* Automated Settlement */}
              <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1e2234] space-y-4">
                <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#dfba82]" />
                  Renewal & Payment Terms
                </h3>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141724] border border-[#202438]">
                  <div>
                    <div className="text-xs font-semibold text-white">Automated Subscription Renewal</div>
                    <div className="text-[11px] text-[#71768a]">Automatically renew period quotas and process payment method.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="w-4 h-4 accent-[#dfba82] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {isSaved && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Billing preferences updated
                    </span>
                  )}
                </div>

                <RbacGuard permission="billing:manage">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba82] to-[#c79d60] text-black font-semibold text-xs shadow-[0_0_20px_rgba(223,186,130,0.2)] hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Preferences
                  </button>
                </RbacGuard>
              </div>
            </form>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}

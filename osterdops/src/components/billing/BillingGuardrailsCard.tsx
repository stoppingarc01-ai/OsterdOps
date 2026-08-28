"use client";

import React, { useState } from "react";
import { ShieldCheck, Mail, RefreshCw } from "lucide-react";

export function BillingGuardrailsCard() {
  const [autoEmailInvoice, setAutoEmailInvoice] = useState(true);
  const [rolloverCredits, setRolloverCredits] = useState(true);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#dfba82]" />
        <h3 className="text-base font-semibold text-[#f4efe6]">Accounting & Automation</h3>
      </div>

      <div className="space-y-3">
        {/* Toggle 1: Auto email invoices */}
        <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-[#3b82f6]" />
              <span>Auto-Email PDF to Accounts</span>
            </div>
            <p className="text-[10.5px] text-[#73788c]">
              Send monthly receipt to billing@acmecorp.com.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoEmailInvoice(!autoEmailInvoice)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
              autoEmailInvoice ? "bg-[#dfba82]" : "bg-[#232738]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                autoEmailInvoice ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Credit Rollover */}
        <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-[#10b981]" />
              <span>Rollover Unused Token Credits</span>
            </div>
            <p className="text-[10.5px] text-[#73788c]">
              Roll unused proxy token quotas into next billing cycle.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRolloverCredits(!rolloverCredits)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
              rolloverCredits ? "bg-[#dfba82]" : "bg-[#232738]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                rolloverCredits ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

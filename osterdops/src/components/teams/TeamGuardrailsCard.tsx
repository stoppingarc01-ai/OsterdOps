"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, AlertTriangle, Sliders } from "lucide-react";

export function TeamGuardrailsCard() {
  const [autoThrottle, setAutoThrottle] = useState(true);
  const [piiAnonymization, setPiiAnonymization] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#dfba82]" />
        <h3 className="text-base font-semibold text-[#f4efe6]">Team Policy Guardrails</h3>
      </div>

      <div className="space-y-3">
        {/* Toggle 1: Auto-throttle */}
        <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-[#f59e0b]" />
              <span>Auto-Throttle at 90% Budget</span>
            </div>
            <p className="text-[10.5px] text-[#73788c]">
              Switch developers to gpt-4o-mini if budget exceeds limit.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoThrottle(!autoThrottle)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
              autoThrottle ? "bg-[#dfba82]" : "bg-[#232738]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                autoThrottle ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: PII Detection */}
        <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#3b82f6]" />
              <span>Prompt PII Anonymization</span>
            </div>
            <p className="text-[10.5px] text-[#73788c]">
              Mask sensitive customer identifiers before proxying to OpenAI.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPiiAnonymization(!piiAnonymization)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
              piiAnonymization ? "bg-[#dfba82]" : "bg-[#232738]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                piiAnonymization ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle 3: Multi-Key Approval */}
        <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-[#10b981]" />
              <span>Require Lead Key Approval</span>
            </div>
            <p className="text-[10.5px] text-[#73788c]">
              Production keys require 1-click authorization from Lead Engineer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRequireApproval(!requireApproval)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
              requireApproval ? "bg-[#dfba82]" : "bg-[#232738]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                requireApproval ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

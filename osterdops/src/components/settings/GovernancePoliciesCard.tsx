"use client";

import React, { useState } from "react";
import { Zap, ShieldAlert, Cpu, Check } from "lucide-react";

export function GovernancePoliciesCard() {
  const [autoFallback, setAutoFallback] = useState(true);
  const [promptCompression, setPromptCompression] = useState(true);
  const [blockExpensive, setBlockExpensive] = useState(false);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#171a27]">
          <Zap className="w-4 h-4 text-[#dfba82]" />
          <h3 className="text-base font-semibold text-[#f4efe6]">Automated Cost Governance Rules</h3>
        </div>

        <div className="space-y-3 text-xs">
          {/* Policy 1: Auto fallback */}
          <div className="p-3.5 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#dfba82]" />
                <span>Automated Gateway Degradation Fallback</span>
              </div>
              <p className="text-[10.5px] text-[#73788c]">
                If OpenAI experiences latency &gt; 2500ms or 5xx outages, automatically reroute requests to Claude 3.5 Sonnet.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoFallback(!autoFallback)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                autoFallback ? "bg-[#dfba82]" : "bg-[#232738]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                  autoFallback ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Policy 2: Prompt Compression */}
          <div className="p-3.5 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span>Lossless Prompt Context Compression</span>
              </div>
              <p className="text-[10.5px] text-[#73788c]">
                Compress redundant whitespace and repeated system prompts to save 18-24% in token cost automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPromptCompression(!promptCompression)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                promptCompression ? "bg-[#dfba82]" : "bg-[#232738]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                  promptCompression ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Policy 3: Block Unapproved Models */}
          <div className="p-3.5 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />
                <span>Block Unauthorized Ultra-Expensive Models</span>
              </div>
              <p className="text-[10.5px] text-[#73788c]">
                Reject API calls to o1-preview or Claude Opus unless explicitly permitted by Team Lead.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBlockExpensive(!blockExpensive)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                blockExpensive ? "bg-[#dfba82]" : "bg-[#232738]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                  blockExpensive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

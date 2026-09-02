"use client";

import React, { useState } from "react";
import { Copy, Check, Shield, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function ProxyGatewayConfigCard() {
  const { currentOrg } = useAuth();
  const [copied, setCopied] = useState(false);
  const [dedupCache, setDedupCache] = useState(true);

  const endpoint = `https://gateway.osterdops.io/v1/${currentOrg?.slug || "proxy"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-[#dfba82]" />
        <h3 className="text-base font-semibold text-[#f4efe6]">LLM Proxy Gateway</h3>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="block text-[11px] text-[#73788c] font-medium mb-1">
            Universal Proxy Base URL
          </label>
          <div className="flex items-center gap-2 bg-[#121422] border border-[#232738] rounded-xl p-2 font-mono text-[11.5px] text-[#e8eaf0]">
            <span className="truncate flex-1">{endpoint}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-[#8e93a6] hover:text-[#dfba82] transition-colors cursor-pointer shrink-0"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Cache Deduplication Toggle */}
        <div className="p-3 bg-[#111320] border border-[#1b1e2e] rounded-xl flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#dfba82]" />
              <span>Semantic Prompt Cache</span>
            </div>
            <p className="text-[10.5px] text-[#73788c]">
              Zero-latency instant responses for duplicate user prompts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDedupCache(!dedupCache)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
              dedupCache ? "bg-[#dfba82]" : "bg-[#232738]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                dedupCache ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

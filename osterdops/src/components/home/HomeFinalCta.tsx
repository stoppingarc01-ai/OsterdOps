"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check, Terminal, BookOpen } from "lucide-react";

export function HomeFinalCta() {
  const [copied, setCopied] = useState(false);
  const command = "curl -sSL https://gateway.osterdops.com/v1/health | jq";

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-24 bg-[#080808] relative overflow-hidden">
      {/* Background subtle champagne glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#DFB277]/08 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-2xl bg-[#0D0E14] border-2 border-[#DFB277]/40 p-8 sm:p-12 text-center space-y-7 shadow-[0_0_50px_rgba(223,178,119,0.12)]">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-sans">
              Deploy Your AI Perimeter in{" "}
              <span className="text-[#DFB277]">
                60 Seconds.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
              Connect 64+ frontier models with low-latency routing, active pre-flight controls, automatic failover, and zero-PII egress.
            </p>
          </div>

          {/* Terminal Drop-in Proxy Command Box */}
          <div className="max-w-xl mx-auto flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#08080B] border border-[#1A1C28]">
            <div className="flex items-center gap-2.5 px-2 text-xs font-mono text-neutral-300 truncate">
              <Terminal className="w-4 h-4 text-[#DFB277] shrink-0" />
              <span className="text-neutral-500">$</span>
              <span className="truncate">{command}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141622] hover:bg-[#1E2130] text-neutral-300 hover:text-white border border-[#242738] text-xs font-mono transition-all cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Dual CTAs: Deploy in 60 Seconds + Documentation / Contact */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-bold text-sm font-mono transition-all shadow-[0_0_30px_rgba(223,178,119,0.3)] hover:shadow-[0_0_40px_rgba(223,178,119,0.5)] cursor-pointer"
            >
              <span>Deploy in 60 Seconds</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <Link
              href="/developers"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#08080B] hover:bg-[#141622] border border-[#1A1C28] hover:border-[#DFB277]/50 text-white font-medium text-sm font-mono transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-neutral-400" />
              <span>Read Documentation</span>
            </Link>
          </div>

          {/* Micro trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-neutral-500 border-t border-[#181A26]">
            <span>1-line OpenAI Drop-in</span>
            <span>•</span>
            <span>&lt;15µs Memory Overhead</span>
            <span>•</span>
            <span>No Credit Card Required</span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check, Terminal, ShieldCheck, Zap, Sparkles } from "lucide-react";

export function HomeFinalCta() {
  const [copied, setCopied] = useState(false);
  const command = "curl -sSL https://gateway.osterdops.com/install.sh | bash";

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-24 bg-[#080808] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#DFB277]/10 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] p-8 sm:p-12 text-center space-y-7">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Start Guarding Your{" "}
              <span className="text-[#DFB277]">
                LLM Fleet.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-400">
              Point your base URL to OsterdOps to enforce hard budgets, prevent runaway loops, and monitor traffic in real time.
            </p>
          </div>

          {/* Terminal Command Box */}
          <div className="max-w-xl mx-auto flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#080808] border border-[#1A1A1A]">
            <div className="flex items-center gap-2.5 px-2 text-xs font-mono text-neutral-300 truncate">
              <Terminal className="w-4 h-4 text-[#DFB277] shrink-0" />
              <span className="text-neutral-500">$</span>
              <span className="truncate">{command}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] text-neutral-300 hover:text-white border border-[#222222] text-xs font-mono transition-all cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-bold text-sm font-mono transition-all shadow-[0_0_30px_rgba(223,178,119,0.3)] cursor-pointer"
            >
              <span>Deploy Free Perimeter</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#080808] hover:bg-[#141414] border border-[#1A1A1A] hover:border-[#DFB277]/50 text-white font-medium text-sm font-mono transition-all cursor-pointer"
            >
              <span>Book Architecture Review</span>
            </Link>
          </div>

          {/* Micro trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-neutral-500 border-t border-[#161616]">
            <span>1-line OpenAI Drop-in</span>
            <span>•</span>
            <span>Sub-5ms Latency Overhead</span>
            <span>•</span>
            <span>No Credit Card Required</span>
          </div>
        </div>
      </div>
    </section>
  );
}

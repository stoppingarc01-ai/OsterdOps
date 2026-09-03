"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, Lock, EyeOff } from "lucide-react";

export function PiiSanitizerDemo() {
  const [sanitizerOn, setSanitizerOn] = useState(true);
  const [inputPrompt, setInputPrompt] = useState(
    "Customer SSN is 452-88-9102, authorization key is sk-proj-9827361928, primary contact email is john.doe@acme.corp, and payment card on file is 4532-8921-9920-1123."
  );

  // Redaction logic
  const sanitizeText = (text: string) => {
    if (!sanitizerOn) return text;

    return text
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "«REDACTED_SSN»")
      .replace(/\bsk-[a-zA-Z0-9_-]{20,}\b/g, "«REDACTED_API_KEY»")
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g, "«REDACTED_EMAIL»")
      .replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, "«REDACTED_CARD»");
  };

  const renderedSanitized = sanitizeText(inputPrompt);

  return (
    <section className="py-24 bg-[#080808] border-t border-[#161720] relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            Zero-Data Retention (ZDR) &amp; <span className="text-[#DFB277]">Security Sanitizer</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            Client-side and wire-level in-memory PII scrubbing (API keys, SSNs, credit cards, emails) executed at wire speed before upstream proxying.
          </p>
        </div>

        {/* Demo Box */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#0D0E14] border border-[#1A1C28] p-6 lg:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Top Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#181A26]">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-neutral-400">Security Engine:</span>
              <span className="text-white font-bold">Regex + Cryptographic Tokenizer</span>
              <span className="text-neutral-600">|</span>
              <span className="text-[#10B981] font-mono">Scrubbed in &lt; 1.4ms</span>
            </div>

            {/* Sanitizer Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-300">
                OsterdOps Sanitizer:
              </span>
              <button
                type="button"
                onClick={() => setSanitizerOn(!sanitizerOn)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  sanitizerOn ? "bg-[#DFB277]" : "bg-neutral-800"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#0E0E0E] transition-transform ${
                    sanitizerOn ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Dual Textboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Input Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-400 flex items-center justify-between">
                <span>Inbound Client Prompt (Edit text below):</span>
                <span className="text-rose-400 text-[11px] font-mono">Raw Payload</span>
              </label>
              <textarea
                rows={5}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#08080B] border border-[#1A1C28] text-xs font-mono text-neutral-200 focus:border-[#DFB277]/60 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Outgoing Scrubbed Payload */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-400 flex items-center justify-between">
                <span>Sanitized Wire Payload Dispatched to LLM:</span>
                <span className="text-[#10B981] text-[11px] font-mono">
                  {sanitizerOn ? "Protected Perimeter" : "Unprotected (Raw)"}
                </span>
              </label>
              <div className="w-full h-[126px] p-3.5 rounded-xl bg-[#08080B] border border-[#1A1C28] text-xs font-mono text-neutral-200 overflow-y-auto leading-relaxed">
                {renderedSanitized.split(/(«[^»]+»)/g).map((chunk, i) => {
                  if (chunk === "«REDACTED_SSN»") {
                    return (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold mx-0.5"
                      >
                        [REDACTED_SSN]
                      </span>
                    );
                  }
                  if (chunk === "«REDACTED_API_KEY»") {
                    return (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold mx-0.5"
                      >
                        [REDACTED_SECRET]
                      </span>
                    );
                  }
                  if (chunk === "«REDACTED_EMAIL»") {
                    return (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/40 text-sky-300 font-bold mx-0.5"
                      >
                        [REDACTED_EMAIL]
                      </span>
                    );
                  }
                  if (chunk === "«REDACTED_CARD»") {
                    return (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-[#DFB277]/20 border border-[#DFB277]/40 text-[#DFB277] font-bold mx-0.5"
                      >
                        [REDACTED_CARD]
                      </span>
                    );
                  }
                  return <span key={i}>{chunk}</span>;
                })}
              </div>
            </div>
          </div>

          {/* Security Features Bottom Pill List */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>HIPAA BAA &amp; SOC2 Type II Certified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Zero Raw Prompt Retention on Disk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Deterministic SHA-256 Hash Chaining</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

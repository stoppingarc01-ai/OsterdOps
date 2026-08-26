"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Terminal, Shield, Zap, RefreshCw } from "lucide-react";

const codeSnippets: Record<string, string> = {
  TypeScript: `import OpenAI from "openai";

// Just swap the baseURL — instant cost tracking & guardrails
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://proxy.osterdops.com/v1",
  defaultHeaders: {
    "X-OsterdOps-Project": "production-copilot",
    "X-OsterdOps-Budget-Guard": "strict"
  }
});

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Analyze Q3 financial anomalies" }],
});`,
  Python: `import openai
import os

# 1-Line Drop-in Proxy integration
client = openai.OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url="https://proxy.osterdops.com/v1",
    default_headers={
        "X-OsterdOps-Project": "risk-scoring-pipeline",
        "X-OsterdOps-Budget-Guard": "strict"
    }
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Analyze Q3 financial anomalies"}]
)`,
  cURL: `curl https://proxy.osterdops.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -H "X-OsterdOps-Project: production-copilot" \\
  -H "X-OsterdOps-Budget-Guard: strict" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Analyze Q3 financial anomalies"}]
  }'`,
};

export function CodeIntegrationSection() {
  const [activeLang, setActiveLang] = useState<"TypeScript" | "Python" | "cURL">("TypeScript");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative w-full bg-[#08090e] py-16 lg:py-24 border-t border-[#1a1d2a]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading & Key Features */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#717684] mb-3">
              DEVELOPER EXPERIENCE
            </p>
            <h2 className="text-[30px] lg:text-[36px] font-bold leading-[1.12] tracking-tight text-white mb-4">
              Integrate in 60 seconds.
              <br />
              <span className="text-[#8e94a8]">Zero code changes.</span>
            </h2>
            <p className="text-[14px] leading-relaxed text-[#7a7e94] mb-6">
              Switch your existing AI SDK client <code className="text-[#38bdf8] bg-[#121520] px-1.5 py-0.5 rounded text-[12px] border border-[#1e2230]">baseURL</code> to our ultra-low latency proxy. Immediately unlock real-time budget guardrails, prompt caching, and cost analytics.
            </p>

            <div className="space-y-3.5">
              {[
                {
                  icon: Zap,
                  title: "< 2ms Proxy Overhead",
                  desc: "Edge-routed global proxy infrastructure ensures imperceptible latency.",
                },
                {
                  icon: Shield,
                  title: "Smart Circuit Breakers",
                  desc: "Automatically cutoff runaway loops and prevent 5-figure budget spikes.",
                },
                {
                  icon: RefreshCw,
                  title: "Semantic Fallbacks & Downgrades",
                  desc: "Intelligently route low-complexity queries to cost-effective models.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-[#141824] border border-[#212638] text-[#38bdf8] shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-white leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[11.5px] text-[#717684] mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Interactive Code Snippet Window */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-2xl bg-[#0a0c12] border border-[#1e2232] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-mono text-[12px]">
              {/* Code Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#06070a] border-b border-[#171b26]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#22c55e]/60" />
                  </div>
                  <div className="flex items-center gap-1">
                    {(["TypeScript", "Python", "cURL"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`px-3 py-1 rounded-md text-[11px] font-sans font-medium transition-all ${
                          activeLang === lang
                            ? "bg-[#181d2c] text-white border border-[#2b334a]"
                            : "text-[#6b7280] hover:text-[#c8cad4]"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121520] border border-[#212638] text-[11px] font-sans text-[#9ca3af] hover:text-white hover:border-[#323a50] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-[#22c55e]" />
                      <span className="text-[#22c55e]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Body */}
              <div className="p-5 overflow-x-auto text-[#d1d5db] leading-relaxed bg-[#090b10]">
                <pre>
                  <code>{codeSnippets[activeLang]}</code>
                </pre>
              </div>

              {/* Code Footer Banner */}
              <div className="px-5 py-3 bg-[#0c0f17] border-t border-[#171b26] flex items-center justify-between text-[11px] font-sans">
                <div className="flex items-center gap-2 text-[#9ca3af]">
                  <Terminal className="h-3.5 w-3.5 text-[#38bdf8]" />
                  <span>Compatible with LangChain, LlamaIndex, Vercel AI SDK, AutoGen</span>
                </div>
                <span className="text-[#22c55e] font-medium hidden sm:inline">100% Drop-in</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

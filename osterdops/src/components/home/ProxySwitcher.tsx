"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, Code2, Cpu, CheckCircle2, ArrowRight } from "lucide-react";

export function ProxySwitcher() {
  const [activeTab, setActiveTab] = useState<"python" | "nodejs" | "curl" | "langchain">("python");
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    python: `# 1-line change: point baseURL to OsterdOps proxy perimeter
from openai import OpenAI

client = OpenAI(
    base_url="https://gateway.osterdops.com/api/v1/gateway",  # <- only change needed
    api_key="ost_live_9f82ab73c0914de6b02a"                    # <- your OsterdOps project key
)

# Outgoing requests are automatically routed, metered, and protected
response = client.chat.completions.create(
    model="gpt-4o",  # Auto-downgrades to gpt-4o-mini if 80% spend reached
    messages=[{"role": "user", "content": "Analyze quarterly EBITDA projections."}]
)
print(response.choices[0].message.content)`,

    nodejs: `// 1-line change: point baseURL to OsterdOps proxy perimeter
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://gateway.osterdops.com/api/v1/gateway", // <- only change needed
  apiKey: "ost_live_9f82ab73c0914de6b02a",                // <- your OsterdOps project key
});

// Outgoing requests are automatically routed, metered, and protected
const completion = await client.chat.completions.create({
  model: "claude-3-5-sonnet-20241022", // Handled via unified gateway adapter
  messages: [{ role: "user", content: "Summarize distributed transaction logs." }],
});

console.log(completion.choices[0].message.content);`,

    curl: `# Drop-in cURL execution through OsterdOps Gateway
curl https://gateway.osterdops.com/api/v1/gateway/chat/completions \\
  -H "Authorization: Bearer ost_live_9f82ab73c0914de6b02a" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "kimi-k1.5",
    "messages": [
      {"role": "system", "content": "You are a quantitative FinOps engine."},
      {"role": "user", "content": "Optimize GPU token throughput."}
    ]
  }'`,

    langchain: `// LangChain & LlamaIndex Drop-in Configuration
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://gateway.osterdops.com/api/v1/gateway",
    apiKey: process.env.OSTERDOPS_API_KEY,
  },
  modelName: "gpt-4o",
  temperature: 0.2,
});

const res = await model.invoke("Plan Kubernetes auto-scaler limits.");
console.log(res.content);`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-20 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Explanatory Column */}
          <div className="space-y-6 lg:max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/30 text-xs font-mono text-[#DFB277]">
              <Cpu className="w-3.5 h-3.5" />
              <span>ZERO SDK LOCK-IN</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              1-Minute Drop-in Proxy. <br />
              <span className="text-[#DFB277]">Zero Code Rewrite.</span>
            </h2>

            <p className="text-sm text-neutral-400 leading-relaxed">
              Don&apos;t install proprietary vendor wrappers that break your test suites. OsterdOps exposes a standard OpenAI-compatible API format. Just point your existing SDK&apos;s <code className="text-[#DFB277] bg-[#141414] px-1.5 py-0.5 rounded font-mono text-xs">base_url</code> to our gateway perimeter.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Compatible with OpenAI, Anthropic, Gemini, Kimi, &amp; Bedrock</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Works natively with LangChain, LlamaIndex, &amp; Vercel AI SDK</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Sub-5ms inline latency overhead (P95 verified)</span>
              </div>
            </div>
          </div>

          {/* Right Code Sandbox Card */}
          <div className="w-full lg:max-w-2xl rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Tab Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0A0A] border-b border-[#1A1A1A]">
              <div className="flex items-center gap-1 sm:gap-2">
                {(
                  [
                    { id: "python", label: "Python" },
                    { id: "nodejs", label: "Node.js" },
                    { id: "curl", label: "cURL" },
                    { id: "langchain", label: "LangChain" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#1A1A1A] text-[#DFB277] font-bold border border-[#DFB277]/30"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Copy Code Button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#222222] text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[#10B981]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-5 overflow-x-auto bg-[#080808]">
              <pre className="text-xs font-mono text-neutral-300 leading-relaxed">
                <code>{codeSnippets[activeTab]}</code>
              </pre>
            </div>

            {/* Bottom Difference Banner */}
            <div className="px-4 py-2.5 bg-[#0A0A0A] border-t border-[#161616] flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-red-400">- api.openai.com</span>
                <ArrowRight className="w-3 h-3 text-[#DFB277]" />
                <span className="text-[#10B981] font-bold">+ gateway.osterdops.com</span>
              </div>
              <span className="text-neutral-500">1 line modified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

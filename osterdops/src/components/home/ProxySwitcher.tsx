"use client";

import React, { useState } from "react";
import { Check, Copy, Zap, ArrowRight, ShieldCheck } from "lucide-react";

export function ProxySwitcher() {
  const [activeTab, setActiveTab] = useState<"python" | "nodejs" | "curl">("python");
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    python: `import openai

client = openai.OpenAI(
    base_url="https://gateway.osterdops.com/v1",
    api_key="sk_live_your_key_here"
)

response = client.chat.completions.create(
    model="gpt-4o",  # or claude-3-5-sonnet, deepseek-r1
    messages=[{"role": "user", "content": "Hello, production AI!"}]
)
print(response.choices[0].message.content)`,

    nodejs: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://gateway.osterdops.com/v1",
  apiKey: "sk_live_your_key_here",
});

const response = await client.chat.completions.create({
  model: "gpt-4o", // or claude-3-5-sonnet, deepseek-r1
  messages: [{ role: "user", content: "Hello, production AI!" }],
});

console.log(response.choices[0].message.content);`,

    curl: `curl https://gateway.osterdops.com/v1/chat/completions \\
  -H "Authorization: Bearer sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello, production AI!"}
    ]
  }'`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const steps = [
    {
      num: "01",
      title: "Copy endpoint",
      desc: "Point client to gateway.osterdops.com/v1",
    },
    {
      num: "02",
      title: "Set API Key",
      desc: "Pass your scoped OsterdOps virtual key",
    },
    {
      num: "03",
      title: "Route traffic",
      desc: "Dispatch to 64+ frontier models with zero SDK changes",
    },
  ];

  return (
    <section className="py-20 bg-[#080808] border-b border-[#161720]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: 3-step vertical stepper */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[#DFB277] uppercase tracking-wider">
                ONE ENDPOINT. ANY MODEL.
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-sans">
                1-Minute Drop-in Proxy
              </h2>

              <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
                Zero proprietary SDK lock-in. Swap two lines of code in your existing client and immediately gain hard budgets, auto-downgrades, and sub-15µs pre-flight controls.
              </p>
            </div>

            {/* 3-Step Vertical Stepper */}
            <div className="space-y-4 pt-2">
              {steps.map((step, idx) => (
                <div
                  key={step.num}
                  className="p-3.5 rounded-xl bg-[#0D0E14] border border-[#1A1C28] flex items-start gap-3.5 group hover:border-[#DFB277]/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#DFB277]/10 border border-[#DFB277]/30 text-[#DFB277] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {step.num}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white font-sans group-hover:text-[#DFB277] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#0F1017] border border-[#1A1C27] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#DFB277]/15 border border-[#DFB277]/30 flex items-center justify-center text-[#DFB277] shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white font-sans">
                  Native OpenAI Protocol Compatibility
                </div>
                <div className="text-[11px] text-neutral-400 font-sans">
                  Works seamlessly with LangChain, LlamaIndex, CrewAI, Vercel AI SDK
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Code Sandbox */}
          <div className="lg:col-span-7 w-full rounded-2xl bg-[#0D0E14] border border-[#1A1C28] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Tab Bar Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#08080B] border-b border-[#181A26]">
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: "python", label: "Python" },
                    { id: "nodejs", label: "Node.js" },
                    { id: "curl", label: "cURL" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#161822] text-[#DFB277] font-semibold border border-[#262A3B]"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161822] hover:bg-[#1E2130] border border-[#262A3B] text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer"
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

            {/* Code Content */}
            <div className="p-4 sm:p-5 overflow-x-auto bg-[#07080B]">
              <pre className="text-xs sm:text-[13px] font-mono text-neutral-200 leading-relaxed">
                <code>{codeSnippets[activeTab]}</code>
              </pre>
            </div>

            {/* Code Footer info */}
            <div className="px-4 py-2.5 bg-[#090A0E] border-t border-[#181A26] flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                Target Base URL: https://gateway.osterdops.com/v1
              </span>
              <span className="text-neutral-500">Latency Overhead: &lt;15µs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

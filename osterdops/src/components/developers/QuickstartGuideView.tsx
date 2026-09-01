"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Terminal,
  Activity,
  Coins,
  Shield,
  Copy,
  ExternalLink,
} from "lucide-react";
import { CodeBlock } from "./CodeBlock";

export function QuickstartGuideView() {
  const [activeLang, setActiveLang] = useState<"curl" | "typescript" | "python">("curl");

  const CURL_CODE = `curl -X POST https://api.osterdops.com/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OSTERDOPS_API_KEY" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "system", "content": "You are a helpful AI engineer." },
      { "role": "user", "content": "Hello from OsterdOps Gateway!" }
    ],
    "temperature": 0.7,
    "max_tokens": 256
  }'`;

  const TS_CODE = `import { OsterdOpsClient } from "@osterdops/sdk"; // or standard fetch

async function main() {
  const response = await fetch("https://api.osterdops.com/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${process.env.OSTERDOPS_API_KEY}\`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI engineer." },
        { role: "user", content: "Hello from OsterdOps Gateway!" },
      ],
      temperature: 0.7,
      max_tokens: 256,
    }),
  });

  const data = await response.json();
  console.log("Completion:", data.choices[0].message.content);
  console.log("Latency:", response.headers.get("x-osterdops-latency-ms"), "ms");
  console.log("Cost USD:", response.headers.get("x-osterdops-cost-usd"));
}

main();`;

  const PYTHON_CODE = `import os
import requests

api_key = os.environ.get("OSTERDOPS_API_KEY")

response = requests.post(
    "https://api.osterdops.com/api/v1/chat/completions",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    },
    json={
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a helpful AI engineer."},
            {"role": "user", "content": "Hello from OsterdOps Gateway!"},
        ],
        "temperature": 0.7,
        "max_tokens": 256,
    },
)

data = response.json()
print("Completion:", data["choices"][0]["message"]["content"])
print("Latency:", response.headers.get("x-osterdops-latency-ms"), "ms")
print("Cost USD:", response.headers.get("x-osterdops-cost-usd"))`;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Introduction Hero */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82]">
          <Sparkles className="w-4 h-4" />
          <span>5-Minute Developer Quick Start</span>
        </div>
        <h2 className="text-xl font-bold text-white font-serif">
          Integrate OsterdOps AI Gateway in 3 Simple Steps
        </h2>
        <p className="text-xs text-[#8e93a6] leading-relaxed">
          OsterdOps acts as an ultra-fast, cost-governed AI proxy for OpenAI, Anthropic, and Google Gemini models. Route requests with automatic budget preflight, token tracking, and deterministic cost metering.
        </p>
      </div>

      {/* Step 1: Create API Key */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#dfba82] text-black font-bold text-xs flex items-center justify-center font-mono">
            1
          </div>
          <h3 className="text-sm font-bold text-white">Generate Your Project API Key</h3>
        </div>

        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 space-y-3 text-xs">
          <p className="text-[#8e93a6]">
            Navigate to the <strong className="text-white">API Keys</strong> tab and create a new key. Your raw secret (<code className="text-[#dfba82]">ost_live_...</code>) will be shown strictly once upon creation.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/developers/api-keys"
              className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Create API Key</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Step 2: Send Request */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#dfba82] text-black font-bold text-xs flex items-center justify-center font-mono">
            2
          </div>
          <h3 className="text-sm font-bold text-white">Make Your First Request</h3>
        </div>

        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#8e93a6]">Select your integration language:</div>
            <div className="flex items-center gap-1">
              {(["curl", "typescript", "python"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-colors cursor-pointer ${
                    activeLang === lang
                      ? "bg-[#dfba82] text-black"
                      : "bg-[#07080c] text-[#8e93a6] hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <CodeBlock
            singleCode={
              activeLang === "curl"
                ? CURL_CODE
                : activeLang === "typescript"
                ? TS_CODE
                : PYTHON_CODE
            }
            language={activeLang === "curl" ? "bash" : activeLang}
          />
        </div>
      </div>

      {/* Step 3: Inspect Telemetry */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#dfba82] text-black font-bold text-xs flex items-center justify-center font-mono">
            3
          </div>
          <h3 className="text-sm font-bold text-white">Inspect Real-Time Telemetry &amp; Cost Headers</h3>
        </div>

        <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl p-5 space-y-4 text-xs">
          <p className="text-[#8e93a6]">
            Every gateway response includes deterministic response headers for latency, cost in USD, token breakdown, and correlation Request IDs:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-[#07080c] border border-[#171b26]">
              <div className="text-[#dfba82] font-semibold">x-osterdops-latency-ms</div>
              <div className="text-[11px] text-[#717688] mt-0.5">e.g. 142 ms</div>
            </div>
            <div className="p-3 rounded-xl bg-[#07080c] border border-[#171b26]">
              <div className="text-[#dfba82] font-semibold">x-osterdops-cost-usd</div>
              <div className="text-[11px] text-[#717688] mt-0.5">e.g. 0.00002040</div>
            </div>
            <div className="p-3 rounded-xl bg-[#07080c] border border-[#171b26]">
              <div className="text-[#dfba82] font-semibold">x-osterdops-total-tokens</div>
              <div className="text-[11px] text-[#717688] mt-0.5">e.g. 52 tokens</div>
            </div>
            <div className="p-3 rounded-xl bg-[#07080c] border border-[#171b26]">
              <div className="text-[#dfba82] font-semibold">x-osterdops-request-id</div>
              <div className="text-[11px] text-[#717688] mt-0.5">e.g. req_1788191200_abc</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/developers/logs"
              className="px-4 py-2 rounded-xl bg-[#1b202e] hover:bg-[#252c3f] text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-[#dfba82]" />
              <span>View Live Request Logs</span>
            </Link>
            <Link
              href="/developers/playground"
              className="px-4 py-2 rounded-xl bg-[#1b202e] hover:bg-[#252c3f] text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-[#dfba82]" />
              <span>Open Interactive Playground</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

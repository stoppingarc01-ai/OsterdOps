"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Code2,
  Terminal,
  BookOpen,
  KeyRound,
  Workflow,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Layers,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function DeveloperCenterPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const curlExample = `curl -X POST https://api.osterdops.com/api/v1/chat/completions \\
  -H "Authorization: Bearer osk_live_••••••••••••94f2" \\
  -H "Content-Type: application/json" \\
  -H "x-osterdops-request-id: req_1788022596_trace" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Explain deterministic AI cost governance." }
    ]
  }'`;

  const sdkExample = `import { OsterdOpsClient } from "@osterdops/sdk";

const client = new OsterdOpsClient({
  apiKey: process.env.OSTERDOPS_API_KEY,
  apiVersion: "v1",
});

const response = await client.gateway.chat.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello OsterdOps!" }],
});

console.log("Inference Cost:", "$" + response.costUsd);`;

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#dfba82] tracking-wider uppercase mb-1">
                  <Code2 className="w-3.5 h-3.5" />
                  Developer Center
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  API Platform, SDKs & Tooling
                </h1>
                <p className="text-xs text-[#8e93a6] mt-1">
                  Integrate OsterdOps AI Gateway routing, deterministic spend tracking, and idempotency into your production workloads.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/developers/api"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141724] border border-[#24283b] text-xs font-medium hover:border-[#dfba82]/40 transition-colors text-white"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#dfba82]" />
                  OpenAPI 3.1 Spec
                </Link>
                <Link
                  href="/dashboard/api-keys"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#dfba82] to-[#c79d60] text-black font-semibold text-xs shadow-[0_0_20px_rgba(223,186,130,0.2)] hover:opacity-95 transition-opacity"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Issue API Key
                </Link>
              </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/developers/quickstart"
                className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1e2234] hover:border-[#dfba82]/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#141724] border border-[#262a3f] flex items-center justify-center text-[#dfba82] mb-3 group-hover:scale-105 transition-transform">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 font-serif">Quick Start Guide</h3>
                  <p className="text-xs text-[#8e93a6]">Connect upstream providers and dispatch your first chat completion in under 3 minutes.</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-[#dfba82] font-semibold">
                  Get Started →
                </div>
              </Link>

              <Link
                href="/dashboard/developers/api"
                className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1e2234] hover:border-[#dfba82]/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#141724] border border-[#262a3f] flex items-center justify-center text-[#dfba82] mb-3 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 font-serif">REST API Reference</h3>
                  <p className="text-xs text-[#8e93a6]">Complete specification for chat completions, budgets, token telemetry, and idempotency.</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-[#dfba82] font-semibold">
                  View Reference →
                </div>
              </Link>

              <Link
                href="/dashboard/developers/webhooks"
                className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1e2234] hover:border-[#dfba82]/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#141724] border border-[#262a3f] flex items-center justify-center text-[#dfba82] mb-3 group-hover:scale-105 transition-transform">
                    <Workflow className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 font-serif">Signed Webhooks</h3>
                  <p className="text-xs text-[#8e93a6]">Real-time HMAC-SHA256 signed event notifications for spend caps, alerts, and billing events.</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-[#dfba82] font-semibold">
                  Configure Webhooks →
                </div>
              </Link>
            </div>

            {/* API Capabilities & Spec Discovery */}
            <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1e2234] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white font-serif">Active API Platform (Version 1.0.0)</h3>
                </div>
                <span className="text-xs font-mono text-[#8e93a6]">
                  Endpoint: <code className="text-[#dfba82]">https://api.osterdops.com/api/v1</code>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#10121e] border border-[#1c1f30]">
                  <div className="text-[10px] text-[#71768a] uppercase">Current Version</div>
                  <div className="text-white font-bold mt-0.5">v1 (STABLE)</div>
                </div>
                <div className="p-3 rounded-xl bg-[#10121e] border border-[#1c1f30]">
                  <div className="text-[10px] text-[#71768a] uppercase">Idempotency TTL</div>
                  <div className="text-white font-bold mt-0.5">86,400s (24h)</div>
                </div>
                <div className="p-3 rounded-xl bg-[#10121e] border border-[#1c1f30]">
                  <div className="text-[10px] text-[#71768a] uppercase">Webhook Signatures</div>
                  <div className="text-white font-bold mt-0.5">HMAC-SHA256</div>
                </div>
                <div className="p-3 rounded-xl bg-[#10121e] border border-[#1c1f30]">
                  <div className="text-[10px] text-[#71768a] uppercase">Pagination Engine</div>
                  <div className="text-white font-bold mt-0.5">Base64 Cursors</div>
                </div>
              </div>
            </div>

            {/* Code Examples Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* cURL Example */}
              <div className="rounded-2xl bg-[#0c0e17] border border-[#1e2234] overflow-hidden flex flex-col">
                <div className="p-3.5 bg-[#10121d] border-b border-[#1c1f30] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#dfba82]">
                    <Terminal className="w-3.5 h-3.5" />
                    cURL Gateway Chat Completion
                  </div>
                  <button
                    onClick={() => handleCopy(curlExample, "curl")}
                    className="flex items-center gap-1 text-[11px] text-[#8e93a6] hover:text-white transition-colors"
                  >
                    {copiedKey === "curl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === "curl" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="p-4 bg-[#07080d] font-mono text-xs text-[#a5abbf] overflow-x-auto">
                  <pre>{curlExample}</pre>
                </div>
              </div>

              {/* TypeScript SDK Example */}
              <div className="rounded-2xl bg-[#0c0e17] border border-[#1e2234] overflow-hidden flex flex-col">
                <div className="p-3.5 bg-[#10121d] border-b border-[#1c1f30] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#dfba82]">
                    <Code2 className="w-3.5 h-3.5" />
                    TypeScript SDK (@osterdops/sdk)
                  </div>
                  <button
                    onClick={() => handleCopy(sdkExample, "sdk")}
                    className="flex items-center gap-1 text-[11px] text-[#8e93a6] hover:text-white transition-colors"
                  >
                    {copiedKey === "sdk" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === "sdk" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="p-4 bg-[#07080d] font-mono text-xs text-[#a5abbf] overflow-x-auto">
                  <pre>{sdkExample}</pre>
                </div>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>
    </div>
  );
}

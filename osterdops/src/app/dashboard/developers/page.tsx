"use client";

import React from "react";
import Link from "next/link";
import {
  Rocket,
  BookOpen,
  Terminal,
  Activity,
  KeyRound,
  Boxes,
  Webhook,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Copy,
} from "lucide-react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";
import { DoctorWidget } from "@/components/developers/DoctorWidget";
import { FirstRequestRunner } from "@/components/developers/FirstRequestRunner";
import { CodeBlock } from "@/components/developers/CodeBlock";

export default function DeveloperPortalPage() {
  return (
    <DeveloperPortalLayout
      title="Developer Hub"
      subtitle="Complete toolchain, SDKs, diagnostics, and API references for OsterdOps AI Governance"
    >
      <div className="space-y-8">
        {/* Top Hero Banner / Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#dfba82]/10 via-[#111422] to-[#0c0e17] border border-[#dfba82]/30 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#dfba82]/20 text-[#dfba82] flex items-center justify-center border border-[#dfba82]/30">
                <Rocket className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white font-serif">Quick Start Guide</h2>
              <p className="text-xs text-[#8e93a6] leading-relaxed">
                Send your first inference request, inspect costs, and set hard budget limits in under 5 minutes.
              </p>
            </div>
            <Link
              href="/dashboard/developers/quickstart"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfba82] hover:underline pt-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-950/60 text-blue-400 flex items-center justify-center border border-blue-800/40">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white font-serif">Interactive API Reference</h2>
              <p className="text-xs text-[#8e93a6] leading-relaxed">
                Explore every endpoint, parameters, request body schemas, response headers, and RBAC permissions.
              </p>
            </div>
            <Link
              href="/dashboard/developers/api"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:underline pt-2"
            >
              <span>Browse Endpoints</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center border border-purple-800/40">
                <Terminal className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white font-serif">TypeScript SDK & CLI</h2>
              <p className="text-xs text-[#8e93a6] leading-relaxed">
                Typed client library with automatic exponential retries, request correlation, and zero secret leaks.
              </p>
            </div>
            <a
              href="#sdk"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:underline pt-2"
            >
              <span>Install & Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Real-Time Diagnostics Doctor */}
        <div id="doctor">
          <DoctorWidget />
        </div>

        {/* Interactive "Send Your First Request" Runner */}
        <div>
          <FirstRequestRunner />
        </div>

        {/* SDK Installation & Code Integration */}
        <div id="sdk" className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#161824]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f4efe6] font-serif">@osterdops/sdk Integration</h3>
                <p className="text-[11.5px] text-[#73788c]">
                  Multi-language SDK examples for Node.js, TypeScript, Python, and cURL
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8e93a6]">
              <span className="font-mono bg-[#111422] px-2 py-1 rounded-lg border border-[#232738]">
                npm install @osterdops/sdk
              </span>
            </div>
          </div>

          <CodeBlock
            tabs={[
              {
                label: "TypeScript / Node.js",
                language: "typescript",
                code: `import { OsterdOpsClient } from "@osterdops/sdk";

const client = new OsterdOpsClient({
  apiKey: process.env.OSTERDOPS_API_KEY, // "osk_live_..."
});

async function main() {
  // 1. Send chat completion through the OsterdOps AI Gateway
  const completion = await client.gateway.chat.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are an enterprise AI assistant." },
      { role: "user", content: "Summarize today's latency trends." }
    ],
  });

  console.log("Response:", completion.output.content);
  console.log("Calculated Cost:", "$" + completion.costUsd);
  console.log("Tokens Used:", completion.usage?.totalTokens);

  // 2. Query Project Usage & Spend
  const usage = await client.usage.get();
  console.log("Total requests this period:", usage.totalRequests);
}

main().catch(console.error);`,
              },
              {
                label: "Python",
                language: "python",
                code: `import os
import requests

OSTERDOPS_API_KEY = os.getenv("OSTERDOPS_API_KEY")
OSTERDOPS_BASE_URL = os.getenv("OSTERDOPS_BASE_URL", "https://api.osterdops.com")

headers = {
    "Authorization": f"Bearer {OSTERDOPS_API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": "gpt-4o",
    "messages": [
        {"role": "user", "content": "Explain zero-retention logging."}
    ]
}

response = requests.post(f"{OSTERDOPS_BASE_URL}/api/v1/chat/completions", json=payload, headers=headers)
data = response.json()

print("Status:", response.status_code)
print("Request ID:", response.headers.get("x-osterdops-request-id"))
print("Cost (USD):", response.headers.get("x-osterdops-cost-usd"))
print("AI Output:", data.get("data", {}).get("output", {}).get("content"))`,
              },
              {
                label: "cURL",
                language: "curl",
                code: `curl -X POST "https://api.osterdops.com/api/v1/chat/completions" \\
  -H "Authorization: Bearer OSTERDOPS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Hello OsterdOps!" }
    ]
  }'`,
              },
            ]}
          />
        </div>

        {/* Quick Navigation Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/developers/api-keys"
            className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 transition-all group cursor-pointer space-y-1.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#dfba82]">
              <KeyRound className="w-4 h-4 text-[#dfba82]" />
              <span>API Key Lifecycle</span>
            </div>
            <p className="text-[11.5px] text-[#8e93a6]">
              Issue, rotate, and revoke cryptographically hashed API keys with single-reveal secrets.
            </p>
          </Link>

          <Link
            href="/dashboard/developers/requests"
            className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 transition-all group cursor-pointer space-y-1.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#dfba82]">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Request Inspector</span>
            </div>
            <p className="text-[11.5px] text-[#8e93a6]">
              Inspect live request latency, tokens, and costs under strict zero-prompt retention guarantees.
            </p>
          </Link>

          <Link
            href="/dashboard/developers/providers"
            className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 transition-all group cursor-pointer space-y-1.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#dfba82]">
              <Boxes className="w-4 h-4 text-blue-400" />
              <span>Provider Integrations</span>
            </div>
            <p className="text-[11.5px] text-[#8e93a6]">
              Connect OpenAI, Anthropic, Gemini, Azure, and AWS Bedrock with AES-256-GCM encryption.
            </p>
          </Link>

          <Link
            href="/dashboard/developers/webhooks"
            className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 transition-all group cursor-pointer space-y-1.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#dfba82]">
              <Webhook className="w-4 h-4 text-purple-400" />
              <span>Webhooks & Verification</span>
            </div>
            <p className="text-[11.5px] text-[#8e93a6]">
              HMAC-SHA256 signature verification code examples, replay attack protection, and retry policies.
            </p>
          </Link>

          <Link
            href="/dashboard/developers/errors"
            className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 transition-all group cursor-pointer space-y-1.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#dfba82]">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Error Code Reference</span>
            </div>
            <p className="text-[11.5px] text-[#8e93a6]">
              Complete catalog of error codes, root causes, HTTP statuses, and recommended resolution steps.
            </p>
          </Link>

          <a
            href="/docs/openapi.yaml"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-xl bg-[#0c0e17] border border-[#1b1e2c] hover:border-[#dfba82]/40 transition-all group cursor-pointer space-y-1.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#dfba82]">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>OpenAPI 3.1.0 Specification</span>
            </div>
            <p className="text-[11.5px] text-[#8e93a6]">
              Download or view the raw YAML contract specification representing all public OsterdOps API routes.
            </p>
          </a>
        </div>
      </div>
    </DeveloperPortalLayout>
  );
}

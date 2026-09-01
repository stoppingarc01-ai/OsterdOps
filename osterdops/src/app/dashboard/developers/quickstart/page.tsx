"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderPlus,
  KeyRound,
  Boxes,
  Globe,
  Play,
  Activity,
  DollarSign,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";
import { CodeBlock } from "@/components/developers/CodeBlock";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  codeTabs: Array<{ label: string; language: "curl" | "typescript" | "python" | "bash" | "json"; code: string }>;
  tip?: string;
  actionLink?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Create an OsterdOps Project",
    description: "Projects isolate your AI workloads, API keys, usage metrics, and spend limits.",
    icon: FolderPlus,
    codeTabs: [
      {
        label: "cURL",
        language: "curl",
        code: `curl -X POST "https://api.osterdops.com/api/v1/projects" \\
  -H "Authorization: Bearer USER_SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production AI Services",
    "description": "Core application LLM pipeline",
    "spendLimitMonthly": 500
  }'`,
      },
      {
        label: "TypeScript / Node.js",
        language: "typescript",
        code: `import { OsterdOpsClient } from "@osterdops/sdk";

const client = new OsterdOpsClient({ apiKey: process.env.OSTERDOPS_API_KEY });

const project = await client.projects.create({
  name: "Production AI Services",
  description: "Core application LLM pipeline",
  spendLimitMonthly: 500,
});

console.log("Project created:", project.id);`,
      },
      {
        label: "Python",
        language: "python",
        code: `import requests

res = requests.post(
    "https://api.osterdops.com/api/v1/projects",
    headers={"Authorization": "Bearer USER_SESSION_TOKEN", "Content-Type": "application/json"},
    json={"name": "Production AI Services", "spendLimitMonthly": 500}
)
print("Project:", res.json())`,
      },
    ],
    tip: "You can also create projects directly from the Dashboard UI under Projects.",
    actionLink: { label: "Go to Projects UI", href: "/dashboard/projects" },
  },
  {
    number: 2,
    title: "Generate a Project API Key",
    description: "Issue a cryptographically hashed key (`osk_live_...`). Plaintext secrets are shown only once.",
    icon: KeyRound,
    codeTabs: [
      {
        label: "cURL",
        language: "curl",
        code: `curl -X POST "https://api.osterdops.com/api/v1/projects/proj_01j9a8b/api-keys" \\
  -H "Authorization: Bearer USER_SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Backend Production Ingestion",
    "environment": "production"
  }'`,
      },
      {
        label: "TypeScript / Node.js",
        language: "typescript",
        code: `const key = await client.apiKeys.create("proj_01j9a8b", {
  name: "Backend Production Ingestion",
  environment: "production",
});

// IMPORTANT: Save key.secret securely — it cannot be recovered later!
console.log("Your OsterdOps API Key:", key.secret);`,
      },
      {
        label: "Python",
        language: "python",
        code: `res = requests.post(
    "https://api.osterdops.com/api/v1/projects/proj_01j9a8b/api-keys",
    headers={"Authorization": "Bearer USER_SESSION_TOKEN"},
    json={"name": "Backend Production Ingestion", "environment": "production"}
)
print("API Key Secret:", res.json()["data"]["secret"])`,
      },
    ],
    tip: "Store your API key in environment variables or your secret manager as OSTERDOPS_API_KEY.",
    actionLink: { label: "Manage API Keys", href: "/dashboard/developers/api-keys" },
  },
  {
    number: 3,
    title: "Configure Upstream Provider Connections",
    description: "Connect OpenAI, Anthropic, Gemini, Azure, or Bedrock. Keys are encrypted with AES-256-GCM.",
    icon: Boxes,
    codeTabs: [
      {
        label: "Dashboard UI Workflow",
        language: "typescript",
        code: `// In OsterdOps Settings -> Integrations:
// 1. Select provider (e.g. OpenAI / Anthropic)
// 2. Paste your upstream provider key (sk-proj-...)
// 3. OsterdOps encrypts with AES-256-GCM and generates a safe preview mask.`,
      },
      {
        label: "cURL",
        language: "curl",
        code: `curl -X POST "https://api.osterdops.com/api/v1/provider-connections" \\
  -H "Authorization: Bearer USER_SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "openai",
    "apiKey": "sk-proj-••••••••••••••••••••••••"
  }'`,
      },
      {
        label: "Python",
        language: "python",
        code: `res = requests.post(
    "https://api.osterdops.com/api/v1/provider-connections",
    headers={"Authorization": "Bearer USER_SESSION_TOKEN"},
    json={"provider": "openai", "apiKey": "sk-proj-..."}
)
print("Provider connection:", res.status_code)`,
      },
    ],
    tip: "Your upstream provider secrets never leave the secure server and are never returned in client responses.",
    actionLink: { label: "Connect Providers", href: "/dashboard/integrations" },
  },
  {
    number: 4,
    title: "Set Gateway Base URL & Endpoint",
    description: "Configure your client application to route completions through the OsterdOps AI Gateway.",
    icon: Globe,
    codeTabs: [
      {
        label: ".env Configuration",
        language: "bash",
        code: `# OsterdOps Environment Configuration
OSTERDOPS_API_KEY="osk_live_94f2a188c9f4d1e204b78912"
OSTERDOPS_BASE_URL="https://api.osterdops.com"`,
      },
      {
        label: "Node.js Initialization",
        language: "typescript",
        code: `import { OsterdOpsClient } from "@osterdops/sdk";

export const ai = new OsterdOpsClient({
  apiKey: process.env.OSTERDOPS_API_KEY,
  baseUrl: process.env.OSTERDOPS_BASE_URL || "https://api.osterdops.com",
  timeoutMs: 30000,
});`,
      },
      {
        label: "Python Initialization",
        language: "python",
        code: `import os

OSTERDOPS_API_KEY = os.getenv("OSTERDOPS_API_KEY")
OSTERDOPS_BASE_URL = os.getenv("OSTERDOPS_BASE_URL", "https://api.osterdops.com")`,
      },
    ],
  },
  {
    number: 5,
    title: "Send Your First AI Request",
    description: "Send an AI completion through the gateway and receive instant cost & latency telemetry.",
    icon: Play,
    codeTabs: [
      {
        label: "TypeScript / Node.js",
        language: "typescript",
        code: `const response = await ai.gateway.chat.create({
  model: "gpt-4o",
  messages: [
    { role: "user", content: "What are the three pillars of AI cost observability?" }
  ],
});

console.log("Assistant:", response.output.content);
console.log("Inference Cost:", "$" + response.costUsd);
console.log("Tokens:", response.usage?.totalTokens);
console.log("Latency:", response.latencyMs + "ms");`,
      },
      {
        label: "cURL",
        language: "curl",
        code: `curl -i -X POST "https://api.osterdops.com/api/v1/chat/completions" \\
  -H "Authorization: Bearer OSTERDOPS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "What are the three pillars of AI cost observability?" }
    ]
  }'`,
      },
      {
        label: "Python",
        language: "python",
        code: `response = requests.post(
    f"{OSTERDOPS_BASE_URL}/api/v1/chat/completions",
    headers={"Authorization": f"Bearer {OSTERDOPS_API_KEY}"},
    json={
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Explain AI cost observability."}]
    }
)
data = response.json()
print("Cost:", response.headers.get("x-osterdops-cost-usd"))
print("Output:", data["data"]["output"]["content"])`,
      },
    ],
  },
  {
    number: 6,
    title: "Inspect Token & Request Usage",
    description: "Query aggregated token breakdowns (input, output, cached) in real-time.",
    icon: Activity,
    codeTabs: [
      {
        label: "TypeScript / Node.js",
        language: "typescript",
        code: `const usage = await ai.usage.get();
console.log("Total Requests:", usage.totalRequests);
console.log("Input Tokens:", usage.inputTokens);
console.log("Output Tokens:", usage.outputTokens);
console.log("Cached Tokens:", usage.cachedTokens);`,
      },
      {
        label: "cURL",
        language: "curl",
        code: `curl -X GET "https://api.osterdops.com/api/v1/usage" \\
  -H "Authorization: Bearer OSTERDOPS_API_KEY"`,
      },
      {
        label: "Python",
        language: "python",
        code: `res = requests.get(
    f"{OSTERDOPS_BASE_URL}/api/v1/usage",
    headers={"Authorization": f"Bearer {OSTERDOPS_API_KEY}"}
)
print("Usage:", res.json()["data"])`,
      },
    ],
    actionLink: { label: "View Usage Dashboard", href: "/dashboard/billing/usage" },
  },
  {
    number: 7,
    title: "Inspect Cost Breakdown by Model & Provider",
    description: "Analyze precise cost metrics with prompt caching savings and latency percentiles.",
    icon: DollarSign,
    codeTabs: [
      {
        label: "TypeScript / Node.js",
        language: "typescript",
        code: `const costs = await ai.costs.get();
console.log("Total Spend:", costs.totalCostUsd, costs.currency);
for (const row of costs.breakdown) {
  console.log(\`\${row.provider}/\${row.model}: $\${row.costUsd} (\${row.requests} reqs)\`);
}`,
      },
      {
        label: "cURL",
        language: "curl",
        code: `curl -X GET "https://api.osterdops.com/api/v1/costs" \\
  -H "Authorization: Bearer OSTERDOPS_API_KEY"`,
      },
      {
        label: "Python",
        language: "python",
        code: `res = requests.get(
    f"{OSTERDOPS_BASE_URL}/api/v1/costs",
    headers={"Authorization": f"Bearer {OSTERDOPS_API_KEY}"}
)
print("Costs:", res.json()["data"])`,
      },
    ],
    actionLink: { label: "View Costs Dashboard", href: "/dashboard/costs" },
  },
  {
    number: 8,
    title: "Configure Budgets & Hard Enforcement",
    description: "Set strict monthly spend limits. Requests will automatically be blocked if limits are exceeded.",
    icon: Wallet,
    codeTabs: [
      {
        label: "TypeScript / Node.js",
        language: "typescript",
        code: `const budget = await ai.budgets.create({
  name: "Monthly Production Budget",
  amountUsd: 1000,
  period: "monthly",
  enforcementMode: "BLOCK", // Hard enforcement
  thresholds: [50, 80, 100],
});

console.log("Budget configured with hard limit:", budget.id);`,
      },
      {
        label: "cURL",
        language: "curl",
        code: `curl -X POST "https://api.osterdops.com/api/v1/budgets" \\
  -H "Authorization: Bearer OSTERDOPS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Monthly Production Budget",
    "amountUsd": 1000,
    "period": "monthly",
    "enforcementMode": "BLOCK",
    "thresholds": [50, 80, 100]
  }'`,
      },
      {
        label: "Python",
        language: "python",
        code: `res = requests.post(
    f"{OSTERDOPS_BASE_URL}/api/v1/budgets",
    headers={"Authorization": f"Bearer {OSTERDOPS_API_KEY}"},
    json={
        "name": "Monthly Production Budget",
        "amountUsd": 1000,
        "period": "monthly",
        "enforcementMode": "BLOCK",
        "thresholds": [50, 80, 100]
    }
)
print("Budget:", res.json()["data"])`,
      },
    ],
    actionLink: { label: "Configure Budgets", href: "/dashboard/budgets" },
  },
];

export default function QuickstartPage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2, 3, 4]);

  const toggleStep = (num: number) => {
    setCompletedSteps((prev) =>
      prev.includes(num) ? prev.filter((s) => s !== num) : [...prev, num]
    );
  };

  return (
    <DeveloperPortalLayout
      title="Quick Start Guide"
      subtitle="Follow this 8-step guide to connect your first provider, send AI requests, and establish cost governance."
    >
      <div className="space-y-6 max-w-4xl">
        {/* Progress Tracker Banner */}
        <div className="p-4 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="text-xs font-bold text-[#dfba82] uppercase tracking-wider">
              Integration Progress
            </div>
            <div className="text-sm font-semibold text-white mt-0.5">
              {completedSteps.length} of {STEPS.length} steps completed
            </div>
          </div>

          <div className="w-full sm:w-48 bg-[#161928] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#dfba82] to-amber-500 h-full transition-all duration-300"
              style={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 8-Step Timeline */}
        <div className="space-y-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = completedSteps.includes(step.number);

            return (
              <div
                key={step.number}
                className={`p-6 rounded-2xl border transition-all ${
                  isDone
                    ? "bg-[#0c0e17] border-[#1b1e2c]"
                    : "bg-[#090b12] border-[#161824]"
                } space-y-4`}
              >
                {/* Step Title Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleStep(step.number)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                        isDone
                          ? "bg-emerald-950/80 border-emerald-700/60 text-emerald-400"
                          : "bg-[#161928] border-[#232738] text-[#8e93a6] hover:text-white"
                      }`}
                      title={isDone ? "Mark incomplete" : "Mark completed"}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold font-mono">{step.number}</span>
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#dfba82] uppercase tracking-wider font-mono">
                          STEP {step.number}
                        </span>
                        {step.actionLink && (
                          <Link
                            href={step.actionLink.href}
                            className="inline-flex items-center gap-1 text-[11px] text-[#8e93a6] hover:text-[#dfba82] transition-colors"
                          >
                            <span>{step.actionLink.label}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-white mt-0.5">{step.title}</h2>
                      <p className="text-xs text-[#8e93a6] mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>

                {/* Code Tabs */}
                <CodeBlock tabs={step.codeTabs} />

                {/* Optional Helpful Tip */}
                {step.tip && (
                  <div className="p-3 rounded-xl bg-[#111422] border border-[#1b1e2c] text-xs text-[#a0a5b8]">
                    <span className="text-[#dfba82] font-semibold">Tip: </span>
                    {step.tip}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Completion Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#dfba82]/10 via-[#111422] to-[#0c0e17] border border-[#dfba82]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white font-serif">Ready to Explore Further?</h3>
            <p className="text-xs text-[#8e93a6] mt-0.5">
              Browse our interactive API Reference or inspect real-time request streams.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/developers/api"
              className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#c9a36d] text-black text-xs font-bold transition-all"
            >
              API Reference
            </Link>
            <Link
              href="/dashboard/developers/requests"
              className="px-4 py-2 rounded-xl bg-[#161928] hover:bg-[#1f2438] text-white border border-[#232738] text-xs font-semibold transition-all"
            >
              Request Inspector
            </Link>
          </div>
        </div>
      </div>
    </DeveloperPortalLayout>
  );
}

"use client";

import React, { useState } from "react";
import {
  Boxes,
  Cpu,
  Lock,
  DollarSign,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";
import { CodeBlock } from "@/components/developers/CodeBlock";

interface ProviderGuide {
  id: string;
  name: string;
  badge: string;
  description: string;
  models: Array<{ name: string; inputPerM: number; outputPerM: number; cachedPerM?: number; desc: string }>;
  authRequirements: string;
  encryption: string;
  exampleConfig: string;
  exampleRequest: string;
  errorBehavior: string;
}

const PROVIDERS: ProviderGuide[] = [
  {
    id: "openai",
    name: "OpenAI Direct",
    badge: "Native Adapter",
    description:
      "Direct integration with OpenAI's REST API for GPT-4o, GPT-4o-mini, o1, and o3-mini reasoning models.",
    models: [
      { name: "gpt-4o", inputPerM: 2.5, outputPerM: 10.0, cachedPerM: 1.25, desc: "Flagship multimodal model" },
      { name: "gpt-4o-mini", inputPerM: 0.15, outputPerM: 0.6, cachedPerM: 0.075, desc: "Fast cost-efficient lightweight model" },
      { name: "o1", inputPerM: 15.0, outputPerM: 60.0, cachedPerM: 7.5, desc: "High-reasoning deep math/code model" },
      { name: "o3-mini", inputPerM: 1.1, outputPerM: 4.4, cachedPerM: 0.55, desc: "State-of-the-art cost-effective reasoning" },
    ],
    authRequirements: "OpenAI API Key (sk-proj-...)",
    encryption: "AES-256-GCM encrypted in Firestore; masked preview (sk-proj-••••49a1)",
    exampleConfig: `// Connect OpenAI in OsterdOps Settings -> Integrations
// Or via API:
await fetch("/api/v1/provider-connections", {
  method: "POST",
  headers: { "Authorization": "Bearer USER_TOKEN", "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "openai",
    apiKey: "sk-proj-••••••••••••••••••••"
  })
});`,
    exampleRequest: `const response = await client.gateway.chat.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Explain vector embeddings." }],
});`,
    errorBehavior: "Maps 429 to PROVIDER_RATE_LIMITED, 401 to INVALID_CREDENTIALS, 503 to PROVIDER_UNAVAILABLE.",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    badge: "Native Adapter",
    description:
      "Native adapter for Anthropic Claude 3.5 Sonnet, Claude 3.5 Haiku, and Claude 3 Opus models.",
    models: [
      { name: "claude-3-5-sonnet", inputPerM: 3.0, outputPerM: 15.0, cachedPerM: 0.3, desc: "Flagship intelligence model" },
      { name: "claude-3-5-haiku", inputPerM: 0.8, outputPerM: 4.0, cachedPerM: 0.08, desc: "Lightning fast coding and data processing" },
      { name: "claude-3-opus", inputPerM: 15.0, outputPerM: 75.0, cachedPerM: 1.5, desc: "Maximum complexity reasoning" },
    ],
    authRequirements: "Anthropic API Key (sk-ant-...)",
    encryption: "AES-256-GCM encrypted in Firestore; masked preview (sk-ant-••••88d3)",
    exampleConfig: `// Connect Anthropic Claude
await fetch("/api/v1/provider-connections", {
  method: "POST",
  headers: { "Authorization": "Bearer USER_TOKEN", "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "anthropic",
    apiKey: "sk-ant-••••••••••••••••••••"
  })
});`,
    exampleRequest: `const response = await client.gateway.chat.create({
  model: "claude-3-5-sonnet",
  messages: [{ role: "user", content: "Write a PostgreSQL migration script." }],
});`,
    errorBehavior: "Maps Anthropic overloaded (529) to PROVIDER_UNAVAILABLE, rate limits to PROVIDER_RATE_LIMITED.",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Native Adapter",
    description:
      "Google Gemini 1.5 Pro and Gemini 1.5 Flash adapter supporting immense context windows and cached tokens.",
    models: [
      { name: "gemini-1.5-pro", inputPerM: 3.5, outputPerM: 10.5, cachedPerM: 0.875, desc: "2M token context window model" },
      { name: "gemini-1.5-flash", inputPerM: 0.075, outputPerM: 0.3, cachedPerM: 0.01875, desc: "Ultra-fast low-cost multimodal model" },
    ],
    authRequirements: "Google AI Studio API Key (AIzaSy...)",
    encryption: "AES-256-GCM encrypted in Firestore; masked preview (AIzaSy••••39f1)",
    exampleConfig: `// Connect Google Gemini
await fetch("/api/v1/provider-connections", {
  method: "POST",
  headers: { "Authorization": "Bearer USER_TOKEN", "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "gemini",
    apiKey: "AIzaSy••••••••••••••••••••"
  })
});`,
    exampleRequest: `const response = await client.gateway.chat.create({
  model: "gemini-1.5-flash",
  messages: [{ role: "user", content: "Process this document stream." }],
});`,
    errorBehavior: "Normalizes Google RESOURCE_EXHAUSTED into RATE_LIMITED and upstream timeouts to 504 TIMEOUT.",
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    badge: "Enterprise Connection",
    description:
      "Connect private Azure OpenAI deployments with custom resource endpoints, API versions, and IAM credentials.",
    models: [
      { name: "azure-gpt-4o", inputPerM: 2.5, outputPerM: 10.0, desc: "Dedicated Azure tenant deployment" },
      { name: "azure-gpt-4o-mini", inputPerM: 0.15, outputPerM: 0.6, desc: "Cost-optimized Azure deployment" },
    ],
    authRequirements: "Azure OpenAI API Key + Custom Resource Endpoint URL",
    encryption: "AES-256-GCM encrypted; Endpoint URL validated against strict domain security checks",
    exampleConfig: `// Connect Azure OpenAI Deployment
await fetch("/api/v1/provider-connections", {
  method: "POST",
  headers: { "Authorization": "Bearer USER_TOKEN", "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "azure",
    apiKey: "azure-key-••••••••••••••••",
    customBaseUrl: "https://my-company-eastus.openai.azure.com"
  })
});`,
    exampleRequest: `const response = await client.gateway.chat.create({
  model: "azure-gpt-4o",
  messages: [{ role: "user", content: "Run enterprise query." }],
});`,
    errorBehavior: "Handles Azure Content Filter triggers, 429 quota exhaustion, and VNet connection timeouts.",
  },
  {
    id: "bedrock",
    name: "AWS Bedrock",
    badge: "Enterprise Connection",
    description:
      "Route inference to Anthropic Claude and Amazon Titan models running inside AWS Bedrock infrastructure.",
    models: [
      { name: "bedrock-claude-3-5-sonnet", inputPerM: 3.0, outputPerM: 15.0, desc: "AWS GovCloud & HIPAA eligible" },
      { name: "amazon.titan-text-express", inputPerM: 0.8, outputPerM: 1.6, desc: "Amazon foundational language model" },
    ],
    authRequirements: "AWS IAM Access Key ID & Secret Access Key (SigV4 Signature)",
    encryption: "AES-256-GCM encrypted credentials; signed SigV4 request headers generated on-the-fly",
    exampleConfig: `// Connect AWS Bedrock
await fetch("/api/v1/provider-connections", {
  method: "POST",
  headers: { "Authorization": "Bearer USER_TOKEN", "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "bedrock",
    apiKey: "AKIA••••••••••••••••:SECRET••••••••••••••••"
  })
});`,
    exampleRequest: `const response = await client.gateway.chat.create({
  model: "bedrock-claude-3-5-sonnet",
  messages: [{ role: "user", content: "Process HIPAA compliant payload." }],
});`,
    errorBehavior: "Translates AWS ThrottlingException to 429 PROVIDER_RATE_LIMITED and AccessDenied to 401.",
  },
];

export default function ProviderDocsPage() {
  const [selectedProvider, setSelectedProvider] = useState<ProviderGuide>(PROVIDERS[0]);

  return (
    <DeveloperPortalLayout
      title="Provider Integrations"
      subtitle="Comprehensive integration guides, pricing registries, and error handling for supported AI providers"
    >
      <div className="space-y-6">
        {/* Top Provider Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PROVIDERS.map((prov) => {
            const active = selectedProvider.id === prov.id;
            return (
              <button
                key={prov.id}
                type="button"
                onClick={() => setSelectedProvider(prov)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  active
                    ? "bg-[#dfba82]/15 border-[#dfba82]/40 shadow-lg"
                    : "bg-[#0c0e17] border-[#1b1e2c] hover:border-[#2a2f45]"
                }`}
              >
                <div className="text-[10px] font-bold font-mono text-[#dfba82] uppercase">
                  {prov.badge}
                </div>
                <div className="text-sm font-bold text-white mt-0.5">{prov.name}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Provider Details */}
        <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#161824]">
            <div>
              <div className="text-xs font-bold text-[#dfba82] uppercase tracking-wider font-mono">
                {selectedProvider.badge}
              </div>
              <h2 className="text-xl font-bold text-white font-serif mt-0.5">
                {selectedProvider.name} Integration
              </h2>
              <p className="text-xs text-[#8e93a6] mt-1">{selectedProvider.description}</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono bg-[#111422] px-3 py-1.5 rounded-xl border border-[#232738] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AES-256-GCM Encrypted</span>
            </div>
          </div>

          {/* Pricing Registry Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#dfba82] uppercase tracking-wider">
              Supported Models & Deterministic Pricing Matrix ($ / 1M Tokens)
            </h3>
            <div className="rounded-xl border border-[#1b1e2c] bg-[#07080c] overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#111422] text-[#8e93a6] border-b border-[#1b1e2c]">
                  <tr>
                    <th className="p-3 font-semibold">Model</th>
                    <th className="p-3 font-semibold">Input / 1M</th>
                    <th className="p-3 font-semibold">Output / 1M</th>
                    <th className="p-3 font-semibold">Cached / 1M</th>
                    <th className="p-3 font-semibold font-sans">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161928]">
                  {selectedProvider.models.map((m) => (
                    <tr key={m.name} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-white font-bold">{m.name}</td>
                      <td className="p-3 text-blue-400">${m.inputPerM.toFixed(3)}</td>
                      <td className="p-3 text-purple-400">${m.outputPerM.toFixed(3)}</td>
                      <td className="p-3 text-emerald-400">
                        {m.cachedPerM !== undefined ? `$${m.cachedPerM.toFixed(3)}` : "—"}
                      </td>
                      <td className="p-3 text-[#8e93a6] font-sans">{m.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security & Authentication Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#07080c] border border-[#161928] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Lock className="w-3.5 h-3.5 text-[#dfba82]" />
                <span>Authentication Requirements</span>
              </div>
              <p className="text-xs text-[#a0a5b8]">{selectedProvider.authRequirements}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#07080c] border border-[#161928] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Error Normalization</span>
              </div>
              <p className="text-xs text-[#a0a5b8]">{selectedProvider.errorBehavior}</p>
            </div>
          </div>

          {/* Integration Code Example */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#dfba82] uppercase tracking-wider">
              Gateway Request Example
            </h3>
            <CodeBlock
              tabs={[
                { label: "TypeScript SDK", language: "typescript", code: selectedProvider.exampleRequest },
                { label: "Connection Setup", language: "typescript", code: selectedProvider.exampleConfig },
              ]}
            />
          </div>
        </div>
      </div>
    </DeveloperPortalLayout>
  );
}

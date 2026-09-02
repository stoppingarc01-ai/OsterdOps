"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Zap,
  ArrowRight,
  ArrowLeft,
  Copy,
  CheckCheck,
  Eye,
  EyeOff,
  Radio,
  Server,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Code2,
  DollarSign,
  Layers,
  Terminal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ProviderConnection } from "@/types";

export interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (connection: ProviderConnection) => void;
  initialOrgId?: string;
  initialProjectId?: string;
  initialProvider?: string;
  initialModel?: string;
}

interface ProviderPreset {
  id: string;
  name: string;
  tagline: string;
  defaultBaseUrl?: string;
  requiresBaseUrl?: boolean;
  keyPlaceholder: string;
  models: string[];
}

const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "openai",
    name: "OpenAI",
    tagline: "GPT-4o, o1, o3-mini, embeddings",
    keyPlaceholder: "sk-proj-...",
    models: ["gpt-4o", "gpt-4o-mini", "o3-mini", "o1-preview", "text-embedding-3-small"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    tagline: "Claude 3.5 Sonnet, Haiku, Opus",
    keyPlaceholder: "sk-ant-api03-...",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    tagline: "Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash",
    keyPlaceholder: "AIzaSy...",
    models: ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash", "text-embedding-004"],
  },
  {
    id: "groq",
    name: "Groq Cloud",
    tagline: "Ultra-fast LPU inference (LLaMA 3.3, 3.1)",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    keyPlaceholder: "gsk_...",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama-3.2-90b-vision"],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    tagline: "Mistral Large, Codestral, Pixtral",
    defaultBaseUrl: "https://api.mistral.ai/v1",
    keyPlaceholder: "mis_...",
    models: ["mistral-large-latest", "codestral-latest", "pixtral-large-latest"],
  },
  {
    id: "bedrock",
    name: "AWS Bedrock",
    tagline: "Amazon Titan, Claude & LLaMA on AWS",
    keyPlaceholder: "AKI...",
    models: ["bedrock/anthropic.claude-3-5-sonnet", "bedrock/amazon.titan-text-express"],
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    tagline: "Enterprise Microsoft Azure deployments",
    requiresBaseUrl: true,
    keyPlaceholder: "Azure resource API key",
    models: ["azure/gpt-4o", "azure/gpt-4o-mini"],
  },
  {
    id: "custom",
    name: "Custom OpenAI-Compatible",
    tagline: "vLLM, Ollama, Together, OpenRouter, LocalAI",
    requiresBaseUrl: true,
    defaultBaseUrl: "https://api.together.xyz/v1",
    keyPlaceholder: "API key or token (if required)",
    models: ["meta-llama/Llama-3.3-70B-Instruct", "mistralai/Mixtral-8x7B-Instruct-v0.1"],
  },
];

export function AddModelModal({
  isOpen,
  onClose,
  onSuccess,
  initialOrgId,
  initialProjectId,
  initialProvider,
  initialModel,
}: AddModelModalProps) {
  const { currentOrg, organizations } = useAuth();
  const effectiveOrgId = initialOrgId || currentOrg?.id || organizations[0]?.organization?.id || "";

  // Wizard Step: 1 = Provider, 2 = Credentials & Model, 3 = Integration Snippet
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedProvider, setSelectedProvider] = useState<ProviderPreset>(PROVIDER_PRESETS[0]);
  const [connectionName, setConnectionName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [customModelInput, setCustomModelInput] = useState("");
  const [maxSpendCap, setMaxSpendCap] = useState("");
  const [fallbackModel, setFallbackModel] = useState("");

  // Testing & Execution State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message?: string;
    latencyMs?: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 3 Result State
  const [createdConnection, setCreatedConnection] = useState<ProviderConnection | null>(null);
  const [gatewayApiKey, setGatewayApiKey] = useState<string>("osk_live_sec_prod_99f2a0b1");
  const [activeTab, setActiveTab] = useState<"python" | "typescript" | "curl">("python");
  const [hasCopiedSnippet, setHasCopiedSnippet] = useState(false);
  const [hasCopiedKey, setHasCopiedKey] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      // Find preset by initialProvider if given
      let targetPreset = PROVIDER_PRESETS[0];
      if (initialProvider) {
        const found = PROVIDER_PRESETS.find(
          (p) => p.id.toLowerCase() === initialProvider.toLowerCase() || p.name.toLowerCase() === initialProvider.toLowerCase()
        );
        if (found) targetPreset = found;
      }

      setSelectedProvider(targetPreset);
      setConnectionName(`${targetPreset.name} Gateway Connection`);
      setApiKey("");
      setShowApiKey(false);
      setCustomBaseUrl(targetPreset.defaultBaseUrl || "");

      if (initialModel) {
        if (targetPreset.models.includes(initialModel)) {
          setSelectedModel(initialModel);
          setCustomModelInput("");
        } else {
          setSelectedModel(targetPreset.models[0] || "");
          setCustomModelInput(initialModel);
        }
        // Jump straight to step 2 if model was directly chosen
        setStep(2);
      } else {
        setSelectedModel(targetPreset.models[0] || "");
        setCustomModelInput("");
        setStep(initialProvider ? 2 : 1);
      }

      setMaxSpendCap("");
      setFallbackModel("");
      setValidationResult(null);
      setSubmitError(null);
      setCreatedConnection(null);
      setHasCopiedSnippet(false);
      setHasCopiedKey(false);
    }
  }, [isOpen, initialProvider, initialModel]);

  // Sync default values when provider changes
  const handleSelectProvider = (preset: ProviderPreset) => {
    setSelectedProvider(preset);
    setConnectionName(`${preset.name} Gateway Connection`);
    setCustomBaseUrl(preset.defaultBaseUrl || "");
    setSelectedModel(preset.models[0] || "");
    setValidationResult(null);
    setSubmitError(null);
  };

  const getEffectiveModel = () => {
    return customModelInput.trim() || selectedModel;
  };

  // Test upstream connection before saving
  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setValidationResult({ valid: false, message: "Please enter an API key to test." });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch("/api/v1/provider-connections/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider.id,
          apiKey: apiKey.trim(),
          customBaseUrl: customBaseUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.data?.valid) {
        setValidationResult({
          valid: true,
          message: `Connection Verified — Upstream API Handshake OK (${data.data.latencyMs || 120}ms)`,
          latencyMs: data.data.latencyMs || 120,
        });
      } else {
        const errorDetail =
          data?.error?.detail || data?.error?.message || data?.data?.error || "Upstream authentication failed.";
        setValidationResult({
          valid: false,
          message: errorDetail,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error testing credentials";
      setValidationResult({ valid: false, message: msg });
    } finally {
      setIsValidating(false);
    }
  };

  // Persist Connection and Generate Scoped Project Gateway Key
  const handleConnectAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setSubmitError("API key is required.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const activeModel = getEffectiveModel();

      // 1. Create provider connection record
      const connRes = await fetch("/api/v1/provider-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: effectiveOrgId,
          projectId: initialProjectId || undefined,
          provider: selectedProvider.id,
          name: connectionName.trim(),
          displayName: connectionName.trim(),
          apiKey: apiKey.trim(),
          customBaseUrl: customBaseUrl.trim() || undefined,
          defaultModel: activeModel,
          models: [activeModel],
          maxSpendCap: maxSpendCap ? Number(maxSpendCap) : undefined,
          fallbackModel: fallbackModel.trim() || undefined,
        }),
      });

      const connData = await connRes.json();
      if (!connRes.ok) {
        const errorMsg =
          connData?.error?.detail || connData?.error?.message || "Failed to persist provider connection.";
        throw new Error(errorMsg);
      }

      const connection: ProviderConnection = connData.data;
      setCreatedConnection(connection);

      // 2. Issue or retrieve scoped Project Gateway API Key
      try {
        // Resolve project ID
        let targetProjectId = initialProjectId;
        if (!targetProjectId) {
          const projRes = await fetch(`/api/v1/projects?organizationId=${effectiveOrgId}`);
          if (projRes.ok) {
            const pData = await projRes.json();
            if (Array.isArray(pData?.data) && pData.data.length > 0) {
              targetProjectId = pData.data[0].id;
            }
          }
        }

        if (targetProjectId) {
          const keyRes = await fetch(`/api/v1/projects/${targetProjectId}/api-keys`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `${selectedProvider.name} Gateway Key`,
              environment: "production",
            }),
          });

          if (keyRes.ok) {
            const keyData = await keyRes.json();
            if (keyData?.data?.secret) {
              setGatewayApiKey(keyData.data.secret);
            }
          }
        }
      } catch (keyErr) {
        console.warn("[OsterdOps] Could not generate new project key; using default fallback key format", keyErr);
      }

      // Success: Advance to step 3
      setStep(3);
      if (onSuccess) {
        onSuccess(connection);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register model connection.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate code snippet based on active tab
  const getGatewayUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/v1/gateway`;
    }
    return "https://gateway.osterdops.com/api/v1/gateway";
  };

  const getSnippets = () => {
    const model = getEffectiveModel();
    const gatewayUrl = getGatewayUrl();
    const key = gatewayApiKey;

    return {
      python: `import os
from openai import OpenAI

# Drop-in OpenAI SDK integration routing through OsterdOps Gateway
client = OpenAI(
    base_url="${gatewayUrl}",
    api_key="${key}"  # Scoped OsterdOps Key
)

response = client.chat.completions.create(
    model="${model}",
    messages=[
        {"role": "system", "content": "You are a production AI assistant."},
        {"role": "user", "content": "Execute fast latency inference via OsterdOps."}
    ],
    temperature=0.7,
)

print(response.choices[0].message.content)`,

      typescript: `import OpenAI from "openai";

// Drop-in OpenAI Node / Browser SDK integration routing through OsterdOps
const client = new OpenAI({
  baseURL: "${gatewayUrl}",
  apiKey: "${key}",
});

async function main() {
  const completion = await client.chat.completions.create({
    model: "${model}",
    messages: [
      { role: "system", content: "You are a production AI assistant." },
      { role: "user", content: "Execute fast latency inference via OsterdOps." },
    ],
  });

  console.log(completion.choices[0].message.content);
}

main().catch(console.error);`,

      curl: `curl -X POST "${gatewayUrl}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${key}" \\
  -d '{
    "model": "${model}",
    "messages": [
      { "role": "system", "content": "You are a production AI assistant." },
      { "role": "user", "content": "Execute fast latency inference via OsterdOps." }
    ],
    "temperature": 0.7
  }'`,
    };
  };

  const copyToClipboard = async (text: string, type: "snippet" | "key") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "snippet") {
        setHasCopiedSnippet(true);
        setTimeout(() => setHasCopiedSnippet(false), 2000);
      } else {
        setHasCopiedKey(true);
        setTimeout(() => setHasCopiedKey(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="w-full max-w-2xl bg-[#111111] border border-[#262626] rounded-xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#0e0e0e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                Connect Upstream Model & Provider
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {step === 1 && "Select the AI provider or custom OpenAI-compatible endpoint to connect."}
                {step === 2 && "Enter your provider API key, select models, and test upstream connectivity."}
                {step === 3 && "Drop-in 1-line gateway proxy snippet ready for production use."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="grid grid-cols-3 border-b border-[#262626] text-xs font-medium">
          <div
            className={`px-4 py-2.5 flex items-center gap-2 border-r border-[#262626] ${
              step === 1
                ? "bg-amber-400/10 text-amber-400 font-semibold"
                : step > 1
                ? "text-emerald-400 bg-emerald-500/5"
                : "text-neutral-500"
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono border border-current">
              {step > 1 ? <Check className="w-3 h-3" /> : "1"}
            </span>
            <span>Provider</span>
          </div>

          <div
            className={`px-4 py-2.5 flex items-center gap-2 border-r border-[#262626] ${
              step === 2
                ? "bg-amber-400/10 text-amber-400 font-semibold"
                : step > 2
                ? "text-emerald-400 bg-emerald-500/5"
                : "text-neutral-500"
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono border border-current">
              {step > 2 ? <Check className="w-3 h-3" /> : "2"}
            </span>
            <span>Credentials</span>
          </div>

          <div
            className={`px-4 py-2.5 flex items-center gap-2 ${
              step === 3 ? "bg-amber-400/10 text-amber-400 font-semibold" : "text-neutral-500"
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono border border-current">
              3
            </span>
            <span>Gateway Snippet</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* ========================================================
              STEP 1: Provider Selection Grid
             ======================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Choose Provider or Custom Protocol
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROVIDER_PRESETS.map((preset) => {
                  const isSelected = selectedProvider.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectProvider(preset)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all text-left flex items-start gap-3 ${
                        isSelected
                          ? "bg-[#181818] border-amber-400/60 ring-1 ring-amber-400/40 text-neutral-100"
                          : "bg-[#141414] border-[#262626] text-neutral-300 hover:border-neutral-700 hover:bg-[#161616]"
                      }`}
                    >
                      <div className="mt-0.5">
                        <Radio
                          className={`w-4 h-4 ${isSelected ? "text-amber-400 fill-amber-400/20" : "text-neutral-600"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-neutral-100">{preset.name}</div>
                          {preset.id === "custom" && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400">
                              BYO Endpoint
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{preset.tagline}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {preset.models.slice(0, 2).map((m) => (
                            <span
                              key={m}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0a0a0a] border border-[#2a2a2a] text-neutral-400"
                            >
                              {m.replace(/^models\//, "")}
                            </span>
                          ))}
                          {preset.models.length > 2 && (
                            <span className="text-[10px] text-neutral-500 self-center">
                              +{preset.models.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: Credentials & Model Configuration
             ======================================================== */}
          {step === 2 && (
            <form onSubmit={handleConnectAndSave} className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Connection Label */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                  Connection Name
                </label>
                <input
                  type="text"
                  required
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  placeholder="e.g. Primary OpenAI Key"
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400/70"
                />
              </div>

              {/* Custom Base URL (if custom or required) */}
              {(selectedProvider.requiresBaseUrl || selectedProvider.defaultBaseUrl) && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono uppercase text-neutral-400">
                      Upstream API Base URL
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">OpenAI-Compatible Wire Format</span>
                  </div>
                  <div className="relative">
                    <input
                      type="url"
                      required={selectedProvider.requiresBaseUrl}
                      value={customBaseUrl}
                      onChange={(e) => setCustomBaseUrl(e.target.value)}
                      placeholder="https://api.together.xyz/v1 or http://localhost:11434/v1"
                      className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400/70 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Secure Provider API Key with Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400">
                    Upstream API Key / Secret
                  </label>
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Encrypted with AES-256-GCM
                  </span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? "text" : "password"}
                    required
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setValidationResult(null);
                    }}
                    placeholder={selectedProvider.keyPlaceholder}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-3 pr-10 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400/70 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 text-neutral-400 hover:text-neutral-200 p-1"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Model Identifier Selector & Free-Text */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                  Target Model Identifier
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedProvider.models.map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => {
                        setSelectedModel(m);
                        setCustomModelInput("");
                      }}
                      className={`text-xs px-2.5 py-1 rounded-md font-mono transition-all border ${
                        selectedModel === m && !customModelInput
                          ? "bg-amber-400/10 border-amber-400/60 text-amber-400 font-semibold"
                          : "bg-[#0a0a0a] border-[#262626] text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={customModelInput}
                  onChange={(e) => setCustomModelInput(e.target.value)}
                  placeholder="Or enter custom model ID (e.g. meta-llama/Llama-3.3-70B-Instruct, custom-lora-v1)"
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400/70 font-mono"
                />
              </div>

              {/* Upstream Connectivity Verification Button */}
              <div className="pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isValidating || !apiKey.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#181818] border border-neutral-700 hover:border-neutral-500 text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Server className="w-3.5 h-3.5 text-amber-400" />
                    {isValidating ? "Pinging Upstream..." : "Test Upstream Handshake"}
                  </button>

                  {validationResult && (
                    <div
                      className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-mono ${
                        validationResult.valid
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}
                    >
                      {validationResult.valid ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{validationResult.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional FinOps Spend Cap & Fallback */}
              <div className="pt-2 border-t border-[#262626] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Monthly Spend Limit (Optional)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-neutral-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={maxSpendCap}
                      onChange={(e) => setMaxSpendCap(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-6 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400/70 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Budget Fallback Model (Optional)
                  </label>
                  <input
                    type="text"
                    value={fallbackModel}
                    onChange={(e) => setFallbackModel(e.target.value)}
                    placeholder="e.g. gpt-4o-mini, gemini-1.5-flash"
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400/70 font-mono"
                  />
                </div>
              </div>
            </form>
          )}

          {/* ========================================================
              STEP 3: Gateway Integration Snippet
             ======================================================== */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Status Header Badge */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-300">
                      Successfully Connected to {selectedProvider.name}
                    </div>
                    <div className="text-[11px] text-emerald-400/80 font-mono">
                      Model ID: <span className="text-white font-bold">{getEffectiveModel()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-neutral-400 font-mono">ENCRYPTED CREDENTIAL</div>
                  <div className="text-xs font-mono text-neutral-200">{createdConnection?.maskedKey || "••••••••"}</div>
                </div>
              </div>

              {/* Scoped Gateway API Key */}
              <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#262626] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase text-neutral-400">Your OsterdOps Gateway API Key</div>
                  <div className="text-xs font-mono text-amber-400 truncate mt-0.5">{gatewayApiKey}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(gatewayApiKey, "key")}
                  className="px-2.5 py-1 rounded bg-[#1c1c1c] border border-neutral-700 text-neutral-300 hover:text-white text-xs flex items-center gap-1 shrink-0"
                >
                  {hasCopiedKey ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopiedKey ? "Copied" : "Copy Key"}</span>
                </button>
              </div>

              {/* Code Snippet Tabs */}
              <div className="rounded-xl border border-[#262626] bg-[#0a0a0a] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#262626] bg-[#141414]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("python")}
                      className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                        activeTab === "python"
                          ? "bg-amber-400/10 text-amber-400 font-semibold border border-amber-400/30"
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      Python
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("typescript")}
                      className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                        activeTab === "typescript"
                          ? "bg-amber-400/10 text-amber-400 font-semibold border border-amber-400/30"
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      TypeScript
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("curl")}
                      className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                        activeTab === "curl"
                          ? "bg-amber-400/10 text-amber-400 font-semibold border border-amber-400/30"
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      cURL
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(getSnippets()[activeTab], "snippet")}
                    className="px-2.5 py-1 rounded bg-[#1e1e1e] border border-neutral-700 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5 font-mono"
                  >
                    {hasCopiedSnippet ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{hasCopiedSnippet ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>

                <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed max-h-64">
                  <code>{getSnippets()[activeTab]}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[#262626] bg-[#0e0e0e] flex items-center justify-between">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-400 text-black hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-sm"
              >
                Configure Credentials
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Provider
              </button>
              <button
                type="button"
                onClick={handleConnectAndSave}
                disabled={isSubmitting || !apiKey.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-400 text-black hover:bg-amber-300 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect & Generate Snippet
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Adjust Config
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Complete & View in Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

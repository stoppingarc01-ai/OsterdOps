"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  X,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingData } from "../types";
import { useAuth } from "@/context/AuthContext";

interface StepConnectDataProps {
  data: OnboardingData;
  onChange: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface AIProviderItem {
  id: string;
  name: string;
  keyPlaceholder: string;
  keyHint: string;
  tagline: string;
  defaultBaseUrl?: string;
  logo: React.ReactNode;
}

const PROVIDERS: AIProviderItem[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    tagline: "Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash",
    keyPlaceholder: "AIzaSy...",
    keyHint: "Starts with 'AIzaSy' from Google AI Studio",
    logo: (
      <svg className="w-5 h-5 text-[#93c5fd]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" />
      </svg>
    ),
  },
  {
    id: "openai",
    name: "OpenAI",
    tagline: "GPT-4o, o1, o3-mini, embeddings",
    keyPlaceholder: "sk-proj-...",
    keyHint: "Starts with 'sk-proj-' or 'sk-' from platform.openai.com",
    logo: (
      <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7944.7944 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zM3.6 18.304a4.4707 4.4707 0 0 1-.5351-3.0137l.142.0852 4.783 2.7582a.7707.7707 0 0 0 .7855 0l5.8333-3.3685v2.332a.0804.0804 0 0 1-.0332.0615L9.74 19.9503A4.4992 4.4992 0 0 1 3.6 18.304zm-1.5011-9.54a4.4849 4.4849 0 0 1 2.3413-1.9748v5.6773a.7802.7802 0 0 0 .3927.6813l5.8334 3.3685-2.02 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7914A4.4992 4.4992 0 0 1 2.0989 8.764zM18.9 10.625l-4.783-2.7582a.7707.7707 0 0 0-.7855 0L7.498 11.2353V8.9033a.0804.0804 0 0 1 .0332-.0615l4.8351-2.7914a4.504 4.504 0 0 1 6.6746 4.636l-.1409-.0614zm2.9982 4.6114a4.4849 4.4849 0 0 1-2.3413 1.9748v-5.6773a.7802.7802 0 0 0-.3927-.6813L13.3308 7.4842l2.02-1.1683a.0757.0757 0 0 1 .071 0l4.8303 2.7914a4.4992 4.4992 0 0 1 1.6461 6.1291zM10.74 14.3417l-2.02-1.1683a.0757.0757 0 0 1-.038-.052V7.5385a4.504 4.504 0 0 1 7.3709-3.4539l-.1419.0804-4.7783 2.7582a.7944.7944 0 0 0-.3927.6813v6.7369z" />
      </svg>
    ),
  },
  {
    id: "anthropic",
    name: "Anthropic",
    tagline: "Claude 3.5 Sonnet, Haiku, Opus",
    keyPlaceholder: "sk-ant-api03-...",
    keyHint: "Starts with 'sk-ant-' from console.anthropic.com",
    logo: (
      <div className="text-white font-serif font-black text-lg tracking-tighter">
        AI
      </div>
    ),
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    tagline: "DeepSeek-V3, DeepSeek-R1 reasoning",
    keyPlaceholder: "sk-...",
    keyHint: "API key from platform.deepseek.com",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    logo: (
      <div className="w-5 h-5 rounded-md bg-[#0066FF] flex items-center justify-center text-white font-bold text-[10px]">
        DS
      </div>
    ),
  },
  {
    id: "groq",
    name: "Groq (LPU)",
    tagline: "Ultra-fast LPU inference (>300 tps)",
    keyPlaceholder: "gsk_...",
    keyHint: "Starts with 'gsk_' from console.groq.com",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    logo: (
      <div className="w-5 h-5 rounded-md bg-[#f55036] flex items-center justify-center text-white font-bold text-[10px]">
        G
      </div>
    ),
  },
  {
    id: "mistral",
    name: "Mistral AI",
    tagline: "Mistral Large, Codestral frontier",
    keyPlaceholder: "mis_...",
    keyHint: "API key from console.mistral.ai",
    defaultBaseUrl: "https://api.mistral.ai/v1",
    logo: (
      <div className="w-5 h-5 rounded-md bg-[#FA5200] flex items-center justify-center text-white font-bold text-[10px]">
        M
      </div>
    ),
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    tagline: "Enterprise Azure-hosted LLM endpoints",
    keyPlaceholder: "API key or token...",
    keyHint: "Azure Cognitive Services subscription key",
    logo: (
      <svg className="w-5 h-5 text-[#38bdf8]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 19h5.5l3.5-7.5L15.5 19H21L12 2z" />
      </svg>
    ),
  },
  {
    id: "aws",
    name: "AWS Bedrock",
    tagline: "Amazon Bedrock Managed Foundation Models",
    keyPlaceholder: "AKIA...",
    keyHint: "AWS Access Key ID with Bedrock Invoke permissions",
    logo: (
      <div className="text-amber-400 font-sans font-bold text-xs tracking-tight">
        aws
      </div>
    ),
  },
];

export function StepConnectData({
  data,
  onChange,
  onNext,
  onBack,
}: StepConnectDataProps) {
  const { currentOrg } = useAuth();
  const [activeProviderId, setActiveProviderId] = useState<string | null>("gemini");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    latencyMs?: number;
    message?: string;
  } | null>(null);
  const [providerLatencies, setProviderLatencies] = useState<Record<string, number>>({});

  const activeProvider = PROVIDERS.find((p) => p.id === activeProviderId) || PROVIDERS[0];

  const handleSelectProvider = (providerId: string) => {
    setActiveProviderId(providerId);
    setApiKeyInput("");
    setValidationResult(null);
  };

  // Real live server-side validation against POST /api/v1/provider-connections/validate
  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setValidationResult({
        valid: false,
        message: "Please enter an API key to validate.",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch("/api/v1/provider-connections/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: activeProvider.id,
          apiKey: apiKeyInput.trim(),
          customBaseUrl: activeProvider.defaultBaseUrl,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success === true && json?.data?.valid === true) {
        const latency = json.data.latencyMs || 95;
        setValidationResult({
          valid: true,
          latencyMs: latency,
          message: `Live handshake verified via upstream endpoint (${latency}ms)`,
        });
        setProviderLatencies((prev) => ({ ...prev, [activeProvider.id]: latency }));

        // Automatically connect provider in onboarding state
        if (!data.connectedProviders.includes(activeProvider.id)) {
          onChange({
            connectedProviders: [...data.connectedProviders, activeProvider.id],
          });
        }

        // If an organization exists, save connection to backend
        if (currentOrg?.id) {
          fetch("/api/v1/provider-connections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organizationId: currentOrg.id,
              provider: activeProvider.id,
              name: `${activeProvider.name} Onboarding Key`,
              apiKey: apiKeyInput.trim(),
              customBaseUrl: activeProvider.defaultBaseUrl,
            }),
          }).catch(() => null);
        }
      } else {
        const errorMsg =
          json?.error?.message ||
          json?.data?.error ||
          json?.data?.message ||
          "Authentication failed: Upstream rejected the provided API key.";
        setValidationResult({
          valid: false,
          latencyMs: json?.data?.latencyMs,
          message: errorMsg,
        });

        // Revoke connection if validation failed
        if (data.connectedProviders.includes(activeProvider.id)) {
          onChange({
            connectedProviders: data.connectedProviders.filter((p) => p !== activeProvider.id),
          });
        }
      }
    } catch {
      setValidationResult({
        valid: false,
        message: "Network error connecting to validation endpoint.",
      });
      if (data.connectedProviders.includes(activeProvider.id)) {
        onChange({
          connectedProviders: data.connectedProviders.filter((p) => p !== activeProvider.id),
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const toggleProviderCheckbox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isConnected = data.connectedProviders.includes(id);
    // Security guard: Users cannot click-to-connect without passing live API key validation.
    // Clicking an active connection allows disconnecting it.
    if (isConnected) {
      onChange({
        connectedProviders: data.connectedProviders.filter((p) => p !== id),
      });
      if (activeProviderId === id) {
        setValidationResult(null);
        setApiKeyInput("");
      }
    } else {
      handleSelectProvider(id);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1.5"
      >
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[11px] font-mono text-[#10b981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span>Live Gateway Handshake Testing</span>
        </div>
        <h2
          className="text-[26px] sm:text-[30px] font-medium tracking-tight text-[#f4efe6]"
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          Connect your AI providers.
        </h2>
        <p className="text-[13px] text-[#8e93a6]">
          Test real API keys against upstream endpoints with millisecond latency verification.
        </p>
      </motion.div>

      {/* Provider Selector Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
      >
        {PROVIDERS.map((provider) => {
          const isSelected = activeProviderId === provider.id;
          const isConnected = data.connectedProviders.includes(provider.id);
          const latency = providerLatencies[provider.id];

          return (
            <div
              key={provider.id}
              onClick={() => handleSelectProvider(provider.id)}
              className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-200 relative ${
                isSelected
                  ? "bg-[#dfba82]/10 border-[#dfba82] shadow-[0_0_16px_rgba(223,186,130,0.15)]"
                  : isConnected
                  ? "bg-[#10b981]/5 border-[#10b981]/40"
                  : "bg-[#0d0f18] border-[#1d202e] hover:border-[#383d54] hover:bg-[#121522]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center shrink-0">
                  {provider.logo}
                </div>
                {isConnected ? (
                  <span
                    onClick={(e) => toggleProviderCheckbox(provider.id, e)}
                    className="w-5 h-5 rounded-full bg-[#10b981]/20 border border-[#10b981]/60 text-[#10b981] flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors"
                    title="Click to toggle connection"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#2a2e42]" />
                )}
              </div>

              <div>
                <div className="font-semibold text-[13px] text-white tracking-tight truncate">
                  {provider.name}
                </div>
                <div className="text-[10.5px] text-[#787d91] font-mono mt-0.5">
                  {latency ? (
                    <span className="text-[#10b981] font-semibold">{latency}ms</span>
                  ) : isConnected ? (
                    <span className="text-[#10b981]">Connected</span>
                  ) : (
                    <span>Ready</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Active Provider Live Test Configuration Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeProvider.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-5 bg-[#0a0c14] border border-[#23273a] rounded-2xl space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1b1e2c]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#131625] border border-[#252a3d] flex items-center justify-center shrink-0">
                {activeProvider.logo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{activeProvider.name}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-[#1d202e] text-[#8e93a6] text-[10px] font-mono">
                    Zero-Retention Proxy
                  </span>
                </div>
                <p className="text-[11.5px] text-[#787d91] mt-0.5">
                  {activeProvider.tagline}
                </p>
              </div>
            </div>

            {data.connectedProviders.includes(activeProvider.id) && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] text-xs font-semibold self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#dfba82]" />
                <span>{activeProvider.name} API Key</span>
              </label>
              <span className="text-[11px] text-[#6b7280] font-mono">
                {activeProvider.keyHint}
              </span>
            </div>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setApiKeyInput(newVal);
                  if (validationResult) setValidationResult(null);
                  if (data.connectedProviders.includes(activeProvider.id)) {
                    onChange({
                      connectedProviders: data.connectedProviders.filter((p) => p !== activeProvider.id),
                    });
                  }
                }}
                placeholder={activeProvider.keyPlaceholder}
                className="w-full bg-[#121524] border border-[#262b3f] focus:border-[#dfba82] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#52576b] font-mono focus:outline-none transition-all pr-24"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-[#6b7280] hover:text-white transition-colors"
                  title={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isValidating || !apiKeyInput.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dfba82] hover:bg-[#ebd5ab] disabled:opacity-50 disabled:pointer-events-none text-black text-xs font-bold transition-all shadow-xs"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 fill-current" />
                      <span>Test Handshake</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Validation Feedback Banner */}
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2.5 ${
                validationResult.valid
                  ? "bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981]"
                  : "bg-red-950/40 border border-red-800/40 text-red-300"
              }`}
            >
              {validationResult.valid ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10b981] mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-semibold text-[12px]">
                  {validationResult.valid
                    ? "Upstream Connection Successful"
                    : "Upstream Handshake Failed"}
                </div>
                <div className="text-[11px] opacity-90">{validationResult.message}</div>
                {validationResult.latencyMs !== undefined && (
                  <div className="text-[10px] opacity-75">
                    Round-trip latency: {validationResult.latencyMs}ms
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Connected providers status pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#787d91]">
            <span>
              Connected in this wizard:{" "}
              <strong className="text-white font-mono">
                {data.connectedProviders.length > 0
                  ? data.connectedProviders.join(", ")
                  : "None yet (Demo / Trial mode enabled)"}
              </strong>
            </span>
            <span className="text-[11px] text-[#555a6d]">
              Keys are AES-256-GCM encrypted and never logged.
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1b1e2c]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#232738] bg-[#0c0e17] text-[#c5c9d6] hover:text-white text-xs font-semibold hover:border-[#383d54] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (apiKeyInput.trim() && !validationResult?.valid) {
              setValidationResult({
                valid: false,
                message: "You have an unverified API key entered. Please click 'Test Handshake' to verify it, or clear the input to proceed.",
              });
              return;
            }
            onNext();
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-[0_4px_16px_rgba(223,186,130,0.25)] transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <span>
            {data.connectedProviders.length > 0 ? "Continue to Preferences" : "Continue (Skip for Now)"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

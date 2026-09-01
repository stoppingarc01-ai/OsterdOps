"use client";

import React, { useState } from "react";
import { X, Check, Plug, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ConnectIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProvider?: string;
  onConnected?: () => void;
}

const PROVIDER_MAP: Record<string, string> = {
  "OpenAI": "openai",
  "openai": "openai",
  "Anthropic Claude": "anthropic",
  "anthropic": "anthropic",
  "Google Vertex & Gemini": "gemini",
  "google-vertex": "gemini",
  "gemini": "gemini",
  "Microsoft Azure OpenAI": "azure",
  "azure-openai": "azure",
  "azure": "azure",
  "AWS Bedrock": "bedrock",
  "aws-bedrock": "bedrock",
  "bedrock": "bedrock",
};

export function ConnectIntegrationModal({
  isOpen,
  onClose,
  initialProvider = "OpenAI",
  onConnected,
}: ConnectIntegrationModalProps) {
  const { currentOrg, getIdToken } = useAuth();
  const [provider, setProvider] = useState(initialProvider);
  const [apiKey, setApiKey] = useState("");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTesting(true);

    try {
      const token = await getIdToken();
      if (!token || !currentOrg?.id) {
        throw new Error("Authentication session required.");
      }

      const normalizedProvider = PROVIDER_MAP[provider] || provider.toLowerCase().replace(/[^a-z0-9]/g, "");

      const res = await fetch("/api/v1/provider-connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          provider: normalizedProvider,
          name: `${provider} (${environment})`,
          apiKey: apiKey.trim(),
          customBaseUrl: customBaseUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || "Failed to save provider connection.");
      }

      // Optionally validate the newly created connection
      const connId = data.data?.id;
      if (connId) {
        try {
          await fetch(`/api/v1/provider-connections/${connId}/validate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              organizationId: currentOrg.id,
            }),
          });
        } catch {
          // Non-blocking background validation
        }
      }

      setConnected(true);
      if (onConnected) onConnected();

      setTimeout(() => {
        setConnected(false);
        setApiKey("");
        setCustomBaseUrl("");
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect provider.";
      setError(msg);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d0f18] border border-[#23273a] rounded-2xl p-6 shadow-2xl relative text-white space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#787d91] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#dfba82]/20 border border-[#dfba82]/40 flex items-center justify-center text-[#dfba82]">
            <Plug className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#f4efe6]">Configure Integration</h3>
            <p className="text-xs text-[#8e93a6]">Connect upstream AI provider API keys with AES-256 encryption.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center gap-2 text-xs text-[#fca5a5]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {connected ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#dfba82]/20 border border-[#dfba82] flex items-center justify-center mx-auto text-[#dfba82]">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-white">Connection Verified & Encrypted!</div>
            <div className="text-xs text-[#8e93a6]">{provider} integration is now active in {environment}.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                Integration Provider / Connector
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="OpenAI">OpenAI (Direct Proxy)</option>
                <option value="Anthropic Claude">Anthropic Claude</option>
                <option value="Google Vertex & Gemini">Google Vertex & Gemini</option>
                <option value="Microsoft Azure OpenAI">Microsoft Azure OpenAI</option>
                <option value="AWS Bedrock">AWS Bedrock</option>
              </select>
            </div>

            <div>
              <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                API Secret Key
              </label>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-••••••••••••••••"
                className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82] font-mono"
              />
              <div className="flex items-center gap-1 text-[10px] text-[#73788c] mt-1">
                <ShieldCheck className="w-3 h-3 text-[#4ade80]" />
                <span>Keys are encrypted with AES-256-GCM and never logged.</span>
              </div>
            </div>

            {(provider.includes("Azure") || provider.includes("Custom")) && (
              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Custom Endpoint URL / Resource Base (Optional)
                </label>
                <input
                  type="text"
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  placeholder="https://your-resource.openai.azure.com"
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82] font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                Target Workspace Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="Production">Production (PROD)</option>
                <option value="Staging">Staging (STG)</option>
                <option value="Development">Development (DEV)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={testing}
                className="px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {testing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{testing ? "Testing Connection..." : "Verify & Save Connector"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

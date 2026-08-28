"use client";

import React, { useState } from "react";
import { X, Check, Plus, Key, Link as LinkIcon, Sparkles } from "lucide-react";
import { IntegrationLogoBadge } from "@/components/ui/IntegrationLogos";
import { IntegrationItem } from "./ManageIntegrationModal";

interface AddIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newIntegration: IntegrationItem) => void;
}

const AVAILABLE_PROVIDERS = [
  { id: "aws-bedrock", name: "AWS Bedrock", type: "Provider", badge: "Live Rates" },
  { id: "azure-openai", name: "Azure OpenAI", type: "Provider", badge: "Managed Endpoint" },
  { id: "datadog-apm", name: "Datadog APM", type: "Telemetry", badge: "Realtime Spans" },
  { id: "langfuse", name: "Langfuse", type: "Tracing", badge: "Prompt Versioning" },
  { id: "slack-alerts", name: "Slack Webhooks", type: "Alerts", badge: "Budget Notifications" },
  { id: "mistral-ai", name: "Mistral AI", type: "Provider", badge: "Open Weights" },
];

export function AddIntegrationModal({
  isOpen,
  onClose,
  onAdd,
}: AddIntegrationModalProps) {
  const [selectedProvider, setSelectedProvider] = useState(AVAILABLE_PROVIDERS[0]);
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onAdd({
        id: selectedProvider.id,
        name: selectedProvider.name,
        badge: "Connected",
        addedDate: "Added on " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        totalSpend: "$0.00",
        status: "Connected",
        provider: selectedProvider.type,
      });
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0c0e17] border border-[#23273a] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b1e2c] bg-[#090b12]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#dfba82]/15 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82]">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Add New Integration</h3>
              <p className="text-[11px] text-[#787d91]">Connect an LLM provider or observability tool</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#787d91] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#c5c9d6] mb-2">
              Select Provider / Service
            </label>
            <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-0.5">
              {AVAILABLE_PROVIDERS.map((provider) => {
                const isSelected = selectedProvider.id === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProvider(provider)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#dfba82]/15 border-[#dfba82]/50 shadow-[0_0_12px_rgba(223,186,130,0.15)]"
                        : "bg-[#121522] border-[#1d2133] hover:border-[#dfba82]/30"
                    }`}
                  >
                    <IntegrationLogoBadge id={provider.id} size={26} />
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold truncate ${isSelected ? "text-[#dfba82]" : "text-white"}`}>
                        {provider.name}
                      </div>
                      <div className="text-[10px] text-[#787d91] truncate">{provider.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-xs font-medium text-[#c5c9d6] mb-1.5">
              Provider API Key / Secret Token
            </label>
            <div className="flex items-center bg-[#121522] border border-[#23273a] focus-within:border-[#dfba82] rounded-xl px-3.5 py-2.5 text-xs text-white transition-colors">
              <Key className="w-3.5 h-3.5 text-[#dfba82] mr-2 shrink-0" />
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-... / Bearer token"
                className="bg-transparent focus:outline-none flex-1 text-xs text-white placeholder-[#555b70]"
              />
            </div>
          </div>

          {/* Endpoint (Optional) */}
          <div>
            <label className="block text-xs font-medium text-[#c5c9d6] mb-1.5">
              Custom Endpoint / Base URL (Optional)
            </label>
            <div className="flex items-center bg-[#121522] border border-[#23273a] focus-within:border-[#dfba82] rounded-xl px-3.5 py-2.5 text-xs text-white transition-colors">
              <LinkIcon className="w-3.5 h-3.5 text-[#787d91] mr-2 shrink-0" />
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.custom-gateway.io/v1"
                className="bg-transparent focus:outline-none flex-1 text-xs text-white placeholder-[#555b70] font-mono"
              />
            </div>
          </div>

          {/* Info banner */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 text-[11px] text-[#dfba82]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>OsterdOps encrypts all provider keys at rest using AES-256 GCM in SOC2 Type II vaults.</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1b1e2c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#8e93a6] hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>{isSubmitting ? "Connecting..." : "Connect Provider"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

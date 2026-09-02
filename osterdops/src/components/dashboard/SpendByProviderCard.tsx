"use client";

import React from "react";
import { useLiveTelemetry, type LiveTelemetryData } from "@/hooks/useLiveTelemetry";
import { ModelProviderLogo } from "@/components/ui/ModelLogos";
import { Layers, Loader2 } from "lucide-react";

interface SpendByProviderCardProps {
  telemetry?: LiveTelemetryData;
  isLoading?: boolean;
}

const PROVIDER_ACCENTS: Record<string, string> = {
  openai: "#10B981",
  anthropic: "#DFB277",
  gemini: "#38BDF8",
  groq: "#F59E0B",
  meta: "#8B5CF6",
  mistral: "#EC4899",
  moonshot: "#DFB277",
  kimi: "#DFB277",
  custom: "#A3A3A3",
};

export function SpendByProviderCard({ telemetry: externalTelemetry, isLoading: externalLoading }: SpendByProviderCardProps) {
  const internalHook = useLiveTelemetry();
  const data = externalTelemetry || internalHook.data;
  const loading = externalLoading !== undefined ? externalLoading : internalHook.isLoading;

  const providers = data.providerDistribution || [];

  return (
    <div className="p-5 bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl space-y-4 transition-all">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">Spend by Provider</h3>
        <span className="text-[10px] font-mono text-neutral-400">Live Breakdown</span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#DFB277]" />
          <div className="font-mono">Aggregating provider metrics...</div>
        </div>
      ) : providers.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#161616] text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/20 text-[#DFB277] flex items-center justify-center mx-auto">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">No provider usage recorded</div>
          <p className="text-[11px] text-neutral-400">
            Provider spend breakdown will appear once gateway proxy requests are made.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {providers.map((p) => {
            const color = PROVIDER_ACCENTS[p.provider.toLowerCase()] || "#DFB277";
            return (
              <div key={p.provider} className="space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ModelProviderLogo provider={p.provider} size="sm" />
                    <span className="font-medium text-neutral-200 capitalize">{p.provider}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">({p.requests} reqs)</span>
                  </div>
                  <span className="font-mono font-bold text-white">${p.spendUsd.toFixed(2)}</span>
                </div>
                <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden border border-[#1A1A1A]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(2, p.percentageOfSpend))}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

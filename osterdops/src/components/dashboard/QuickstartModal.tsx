"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Copy,
  Check,
  RotateCw,
  Terminal,
  Zap,
  ShieldCheck,
  Radio,
  ExternalLink,
  Lock,
} from "lucide-react";

import { getGatewayBaseUrl, getGatewayCompletionsUrl } from "@/config/gateway";

export interface QuickstartModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKey?: string;
}

type LangTab = "python" | "typescript" | "curl";
type ListenerState = "idle" | "listening" | "success";

function generateRandomKey(): string {
  const chars = "0123456789abcdef";
  let hex = "";
  for (let i = 0; i < 32; i++) {
    hex += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ors_live_${hex}`;
}

export function QuickstartModal({
  isOpen,
  onClose,
  initialKey = "ors_live_8f3d9b2a7c4e1124dfb277a098c61e34",
}: QuickstartModalProps) {
  const [apiKey, setApiKey] = useState(initialKey);
  const [activeTab, setActiveTab] = useState<LangTab>("python");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [listenerState, setListenerState] = useState<ListenerState>("idle");
  const [trafficTelemetry, setTrafficTelemetry] = useState<{
    model: string;
    tokens: number;
    latency: string;
    piiScrubbed: number;
    cost: string;
  } | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Key Rotation
  const handleRotateKey = () => {
    setIsRotating(true);
    setTimeout(() => {
      setApiKey(generateRandomKey());
      setIsRotating(false);
      setCopiedKey(false);
    }, 280);
  };

  // Copy API Key
  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Code Snippets Generation
  const gatewayUrl = getGatewayBaseUrl();
  const completionsUrl = getGatewayCompletionsUrl();

  const getCodeSnippet = useCallback(() => {
    switch (activeTab) {
      case "python":
        return `from openai import OpenAI

# Drop-in replacement: Just point base_url to OsterdOps
client = OpenAI(
    base_url="${gatewayUrl}",
    api_key="${apiKey}",
)

response = client.chat.completions.create(
    model="deepseek-reasoner",
    messages=[{"role": "user", "content": "Explain quantum computing in 2 sentences."}],
)

print(response.choices[0].message.content)`;

      case "typescript":
        return `import OpenAI from "openai";

// Drop-in replacement: Just point baseURL to OsterdOps
const openai = new OpenAI({
  baseURL: "${gatewayUrl}",
  apiKey: "${apiKey}",
});

const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Optimize this algorithm for P95 latency." }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}`;

      case "curl":
        return `curl ${completionsUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello from terminal via OsterdOps!"}],
    "temperature": 0.7
  }'`;
    }
  }, [activeTab, apiKey, gatewayUrl, completionsUrl]);

  // Copy Code Snippet
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(getCodeSnippet());
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Traffic Listener Simulation
  const handleStartListener = () => {
    setListenerState("listening");
    // Simulate detecting first request after 2.8 seconds
    setTimeout(() => {
      setTrafficTelemetry({
        model: activeTab === "python" ? "deepseek-reasoner" : activeTab === "typescript" ? "gpt-4o" : "deepseek-chat",
        tokens: 124,
        latency: "11.2µs",
        piiScrubbed: 0,
        cost: "$0.00021",
      });
      setListenerState("success");
    }, 2800);
  };

  const handleResetListener = () => {
    setListenerState("idle");
    setTrafficTelemetry(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Surface Card Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickstart-title"
        className="relative w-full max-w-2xl bg-[#090909] border border-[#1F1F1F] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(223,178,119,0.08)] overflow-hidden flex flex-col my-auto z-10 max-h-[92vh]"
      >
        {/* Modal Top Brand Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#1A1A1A] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Dragon Crest Icon */}
            <div className="relative w-10 h-10 rounded-xl bg-[#12141F] border border-[#23273A] flex items-center justify-center shrink-0 drop-shadow-[0_0_12px_rgba(223,178,119,0.35)] mt-0.5">
              <Image
                src="/osterdops-logo.png"
                alt="OsterdOps Crest"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="quickstart-title"
                  className="text-lg sm:text-xl font-bold text-white tracking-tight font-sans"
                >
                  1-Minute Drop-in Proxy
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#DFB277]/15 border border-[#DFB277]/30 text-[#DFB277] text-[10px] font-mono font-semibold tracking-wide uppercase">
                  ZDR Gateway
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Drop OsterdOps into your current code without changing SDK methods.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Step 1: API Key Generation & Vault Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#DFB277]" />
                <span>STEP 1 // Provision Gateway API Key</span>
              </span>
              <button
                type="button"
                onClick={handleRotateKey}
                disabled={isRotating}
                className="text-[#DFB277] hover:text-[#faeedb] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${isRotating ? "animate-spin" : ""}`} />
                <span>+ Rotate / Generate New Key</span>
              </button>
            </div>

            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0D0D0D] border border-[#222] focus-within:border-[#DFB277]/60 transition-colors">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="flex-1 bg-transparent px-2.5 py-1 text-xs font-mono text-[#DFB277] outline-none select-all truncate"
              />
              <button
                type="button"
                onClick={handleCopyKey}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161824] hover:bg-[#202334] border border-[#262A3E] text-white text-xs font-mono transition-all cursor-pointer shrink-0"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[#10B981] font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy Key</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[10.5px] font-mono text-neutral-500 px-1">
              <span>HSM Vault AES-256-GCM</span>
              <span>In-memory wire authorization only</span>
            </div>
          </div>

          {/* Step 2: Language Code Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-300 font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#DFB277]" />
                <span>STEP 2 // Drop-in Snippet</span>
              </span>

              {/* Language Tabs */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#121212] border border-[#222]">
                {(["python", "typescript", "curl"] as LangTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setCopiedCode(false);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-[#DFB277] text-[#080808] font-bold shadow-xs"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {tab === "python"
                      ? "Python"
                      : tab === "typescript"
                      ? "TypeScript"
                      : "cURL"}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Block Container */}
            <div className="relative rounded-xl bg-[#06070A] border border-[#1C1F2B] overflow-hidden group">
              {/* Top Code Bar */}
              <div className="px-3.5 py-2 bg-[#0B0D14] border-b border-[#181A26] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span>
                    {activeTab === "python"
                      ? "quickstart.py"
                      : activeTab === "typescript"
                      ? "quickstart.ts"
                      : "terminal_request.sh"}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161824] hover:bg-[#202436] text-[#DFB277] text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-[#10B981]" />
                      <span className="text-[#10B981] font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre Container with horizontal scroll */}
              <pre className="p-4 text-[12px] font-mono text-[#DFB277] overflow-x-auto leading-relaxed selection:bg-[#DFB277]/30 selection:text-white">
                <code>{getCodeSnippet()}</code>
              </pre>
            </div>
          </div>

          {/* Step 3: Live First-Ping Traffic Listener */}
          <div className="rounded-xl bg-[#0D0E16] border border-[#1E2234] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${listenerState === "listening" ? "text-amber-400 animate-pulse" : listenerState === "success" ? "text-[#10B981]" : "text-neutral-500"}`} />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Real-time Traffic Listener
                </span>
              </div>

              {listenerState === "idle" && (
                <button
                  type="button"
                  onClick={handleStartListener}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#DFB277]/15 hover:bg-[#DFB277]/25 border border-[#DFB277]/40 text-[#DFB277] text-xs font-mono font-semibold transition-all cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  <span>Start Traffic Listener</span>
                </button>
              )}

              {listenerState === "listening" && (
                <span className="text-[11px] font-mono text-amber-400 animate-pulse flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Waiting for telemetry...</span>
                </span>
              )}

              {listenerState === "success" && (
                <button
                  type="button"
                  onClick={handleResetListener}
                  className="text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Listener State Renderings */}
            {listenerState === "idle" && (
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-neutral-600" />
                <span>Listener standby: Run command in terminal to test wire proxy</span>
              </div>
            )}

            {listenerState === "listening" && (
              <div className="p-3 rounded-lg bg-[#111422] border border-[#1D2238] flex items-center justify-between text-xs font-mono text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                  </span>
                  <span>Listening for incoming proxy traffic on port 443...</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">gateway.osterdops.com</span>
              </div>
            )}

            {listenerState === "success" && trafficTelemetry && (
              <div className="p-3 rounded-lg bg-[#0E1E17] border border-[#155239] space-y-2 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#10B981] font-bold">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>First Token Governed (Latency: {trafficTelemetry.latency})</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-semibold border border-[#10B981]/40">
                    200 OK
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#164330] text-[11px] font-mono text-neutral-300">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">MODEL</span>
                    <span className="text-white font-medium">{trafficTelemetry.model}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">TOKENS</span>
                    <span className="text-white font-medium">{trafficTelemetry.tokens}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">PII SCRUBBED</span>
                    <span className="text-[#10B981] font-medium">{trafficTelemetry.piiScrubbed}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">COST</span>
                    <span className="text-[#DFB277] font-medium">{trafficTelemetry.cost}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Modal Actions */}
        <div className="p-4 sm:p-5 bg-[#070707] border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <a
            href="/developers/quickstart"
            className="text-neutral-400 hover:text-[#DFB277] flex items-center gap-1 transition-colors"
          >
            <span>Full Integration Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-bold text-xs font-mono transition-all cursor-pointer shadow-sm"
          >
            Done &amp; Continue to Console
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  Zap,
  AlertOctagon,
  ShieldCheck,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  Coins,
  ArrowRight,
  Code2,
} from "lucide-react";

export function FinOpsSimulator() {
  const [activeTab, setActiveTab] = useState<"failover" | "runaway" | "downgrade">("failover");

  // Scenario 1: Auto-Failover (OpenAI 429 -> DeepSeek-V3 / Groq in 14ms)
  const [failoverRunning, setFailoverRunning] = useState(false);
  const [failoverStep, setFailoverStep] = useState<"idle" | "error" | "routed">("idle");
  const [failoverTarget, setFailoverTarget] = useState<"deepseek" | "groq">("deepseek");

  // Scenario 2: Runaway Loop State (RFC 7807 429 envelope)
  const [loopCount, setLoopCount] = useState(0);
  const [loopRunning, setLoopRunning] = useState(false);
  const [loopTripped, setLoopTripped] = useState(false);

  // Scenario 3: Auto-Downgrade State
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [budgetPercent, setBudgetPercent] = useState(85);
  const [downgradeRunning, setDowngradeRunning] = useState(false);
  const [downgradeResult, setDowngradeResult] = useState<{
    originalModel: string;
    activeModel: string;
    downgraded: boolean;
    costOriginal: number;
    costActive: number;
    savingsPct: string;
    latencyMs: number;
  } | null>(null);

  // Handler: Failover
  const handleRunFailover = () => {
    setFailoverRunning(true);
    setFailoverStep("idle");

    setTimeout(() => {
      setFailoverStep("error"); // OpenAI Rate Limit 429
      setTimeout(() => {
        setFailoverStep("routed"); // Instant Failover to DeepSeek-V3 / Groq LPU in 14ms
        setFailoverRunning(false);
      }, 350);
    }, 280);
  };

  // Handler: Runaway Loop
  const handleTriggerLoop = () => {
    if (loopRunning || loopTripped) return;
    setLoopRunning(true);
    setLoopCount(0);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setLoopCount(count);

      if (count >= 16) {
        clearInterval(interval);
        setLoopTripped(true);
        setLoopRunning(false);
      }
    }, 75);
  };

  const handleResetLoop = () => {
    setLoopTripped(false);
    setLoopCount(0);
  };

  // Handler: Downgrade
  const handleRunDowngrade = () => {
    setDowngradeRunning(true);
    setDowngradeResult(null);

    setTimeout(() => {
      const isOverCeiling = budgetPercent >= 80;
      let targetModel = selectedModel;
      let costOriginal = 0.0045;
      let costActive = 0.0045;
      let savings = "0%";

      if (isOverCeiling) {
        if (selectedModel === "gpt-4o") {
          targetModel = "gpt-4o-mini";
          costActive = 0.0002;
          savings = "-95.5%";
        } else if (selectedModel === "claude-3-5-sonnet") {
          targetModel = "claude-3-5-haiku";
          costActive = 0.0003;
          savings = "-93.3%";
        } else if (selectedModel === "gemini-1.5-pro") {
          targetModel = "gemini-1.5-flash";
          costActive = 0.0001;
          savings = "-97.8%";
        }
      }

      setDowngradeResult({
        originalModel: selectedModel,
        activeModel: targetModel,
        downgraded: isOverCeiling,
        costOriginal,
        costActive,
        savingsPct: savings,
        latencyMs: 8.2,
      });
      setDowngradeRunning(false);
    }, 380);
  };

  return (
    <section id="simulator" className="py-24 bg-[#080808] border-t border-[#161720] relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            Active Governance <span className="text-[#DFB277]">Simulator</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            Test real-time upstream failover, 30-second runaway loop breakers, and automatic spend downgrades before tokens ever hit upstream billing meters.
          </p>
        </div>

        {/* Main Simulator Card */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#0C0D12] border border-[#1A1C28] p-5 sm:p-7 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          {/* Top Tabs Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-5 border-b border-[#181924]">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#07080B] border border-[#161720] overflow-x-auto">
              {/* Tab 1: Failover */}
              <button
                onClick={() => setActiveTab("failover")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "failover"
                    ? "bg-[#38BDF8] text-[#080808] font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>1. Simulate OpenAI 429 Failover</span>
              </button>

              {/* Tab 2: Runaway Loop */}
              <button
                onClick={() => setActiveTab("runaway")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "runaway"
                    ? "bg-[#F43F5E] text-white font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>2. Simulate Runaway Loop</span>
              </button>

              {/* Tab 3: Downgrade */}
              <button
                onClick={() => setActiveTab("downgrade")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "downgrade"
                    ? "bg-[#DFB277] text-[#080808] font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>3. Budget Auto-Downgrade</span>
              </button>
            </div>

            {/* Gateway Status Badge */}
            <div className="flex items-center gap-2 text-xs font-mono shrink-0">
              <span className="text-neutral-400">Pre-Flight Wire:</span>
              <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                &lt;15µs Memory
              </span>
            </div>
          </div>

          {/* TAB 1: Instant Failover on Rate Limit (429) */}
          {activeTab === "failover" && (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-[#08080B] border border-[#161722] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-[#38BDF8]" />
                      <h3 className="text-sm font-bold font-mono text-white tracking-tight">
                        Zero-Downtime Multi-Provider Failover (&lt;14ms)
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-400 max-w-lg leading-relaxed font-sans">
                      When OpenAI returns an unexpected <code className="text-[#F43F5E]">429 Too Many Requests</code> or <code className="text-[#F43F5E]">503 Service Unavailable</code>, OsterdOps intercepts the packet in memory and immediately replays to an equivalent model with zero client code exceptions.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={failoverTarget}
                      onChange={(e) => setFailoverTarget(e.target.value as "deepseek" | "groq")}
                      className="px-2.5 py-2 rounded-xl bg-[#12131C] border border-[#232637] text-xs font-mono text-neutral-200 outline-none cursor-pointer"
                    >
                      <option value="deepseek">Fallback: DeepSeek-V3</option>
                      <option value="groq">Fallback: Groq LPU (Llama 3.3)</option>
                    </select>

                    <button
                      onClick={handleRunFailover}
                      disabled={failoverRunning}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#080808] font-mono font-bold text-xs cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 fill-[#080808]" />
                      <span>{failoverRunning ? "Simulating Rate Limit..." : "Simulate OpenAI Rate Limit (429)"}</span>
                    </button>
                  </div>
                </div>

                {/* Visual Step Timeline */}
                <div className="pt-4 border-t border-[#181924] grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-lg bg-[#0F1017] border border-[#1C1E2B] space-y-1">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase">Step 1: Ingress</div>
                    <div className="text-xs font-bold font-mono text-white">Client Dispatches gpt-4o</div>
                    <div className="text-[10px] font-mono text-neutral-400">Payload dispatched to gateway</div>
                  </div>

                  {/* Step 2 */}
                  <div
                    className={`p-3.5 rounded-lg border space-y-1 transition-all ${
                      failoverStep === "error" || failoverStep === "routed"
                        ? "bg-rose-950/30 border-rose-500/50 text-rose-300"
                        : "bg-[#0F1017] border-[#1C1E2B] text-neutral-400"
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase">Step 2: Primary Route</div>
                    <div className="text-xs font-bold font-mono">
                      {failoverStep === "error" || failoverStep === "routed" ? "OpenAI 429 Rate Limit Intercepted" : "OpenAI Primary Route"}
                    </div>
                    <div className="text-[10px] font-mono">
                      {failoverStep === "error" || failoverStep === "routed" ? "Zero client-side crash (<11µs)" : "Listening for upstream..."}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`p-3.5 rounded-lg border space-y-1 transition-all ${
                      failoverStep === "routed"
                        ? "bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]"
                        : "bg-[#0F1017] border-[#1C1E2B] text-neutral-400"
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase">Step 3: Instant Failover</div>
                    <div className="text-xs font-bold font-mono">
                      {failoverStep === "routed"
                        ? failoverTarget === "deepseek"
                          ? "DeepSeek-V3 (200 OK)"
                          : "Groq LPU (200 OK)"
                        : "Standby Failover Pool"}
                    </div>
                    <div className="text-[10px] font-mono">
                      {failoverStep === "routed" ? "Total switchover latency: 14ms" : "Sub-15ms ready"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Runaway Loop Breaker with RFC 7807 429 Envelope */}
          {activeTab === "runaway" && (
            <div className="space-y-5">
              <div
                className={`p-5 rounded-xl border transition-all ${
                  loopTripped
                    ? "bg-rose-950/20 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]"
                    : "bg-[#08080B] border-[#161722]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className={`w-5 h-5 ${loopTripped ? "text-rose-400 animate-pulse" : "text-[#DFB277]"}`} />
                      <h3 className="text-sm font-bold font-mono text-white tracking-tight">
                        30-Second Velocity Runaway Guard &amp; RFC 7807 Envelope
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-400 max-w-lg leading-relaxed font-sans">
                      If an autonomous AI agent enters an infinite retry loop and fires &gt; 15 identical requests within 30 seconds, OsterdOps trips the circuit breaker, freezes the API key, and returns an RFC 7807 problem envelope.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {loopTripped ? (
                      <button
                        onClick={handleResetLoop}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold text-xs cursor-pointer transition-colors shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Circuit Breaker</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleTriggerLoop}
                        disabled={loopRunning}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono font-bold text-xs cursor-pointer disabled:opacity-50 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 fill-rose-400" />
                        <span>{loopRunning ? "Firing 16 Rapid Calls..." : "Simulate Runaway Loop"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Meter */}
                <div className="mt-5 pt-4 border-t border-[#181924] space-y-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Identical Prompt Request Velocity:</span>
                    <span className={`font-bold ${loopTripped ? "text-rose-400" : "text-[#DFB277]"}`}>
                      {loopCount} / 15 requests (Safety Threshold)
                    </span>
                  </div>

                  <div className="w-full bg-[#14151E] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 ${
                        loopTripped ? "bg-rose-500" : "bg-[#DFB277]"
                      }`}
                      style={{ width: `${Math.min(100, (loopCount / 15) * 100)}%` }}
                    />
                  </div>

                  {/* RFC 7807 429 Envelope Display */}
                  {loopTripped && (
                    <div className="p-3.5 rounded-lg bg-[#07080B] border border-rose-500/40 space-y-2 animate-in fade-in-50 duration-200">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-rose-400 font-bold flex items-center gap-1.5">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          HTTP 429 Too Many Requests (RFC 7807 Problem Details)
                        </span>
                        <span className="text-[10px] text-neutral-500">Latency: 0.9ms</span>
                      </div>

                      <pre className="p-2.5 rounded bg-[#090A0F] border border-[#161824] text-[11px] font-mono text-neutral-300 overflow-x-auto">
                        <code>{`{
  "type": "https://osterdops.com/errors/runaway-loop-detected",
  "title": "Circuit Breaker Tripped",
  "status": 429,
  "detail": "16 identical prompt payloads detected within 30 seconds. Key execution frozen for 300s to prevent token burn.",
  "instance": "urn:osterdops:wire:req_7f8a9e10"
}`}</code>
                      </pre>
                      <div className="text-[10px] text-[#10B981] font-mono font-semibold">
                        ✓ 32,000+ downstream tokens saved ($140.00 damage prevented instantly).
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Auto-Downgrade Routing Playground */}
          {activeTab === "downgrade" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Controls (Left) */}
                <div className="p-4 rounded-xl bg-[#08080B] border border-[#161722] space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-neutral-300">
                      Requested Frontier Model:
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0F1017] border border-[#222533] text-xs font-mono text-white outline-none focus:border-[#DFB277]/60"
                    >
                      <option value="gpt-4o">OpenAI gpt-4o ($2.50 / 1M tokens)</option>
                      <option value="claude-3-5-sonnet">Anthropic claude-3-5-sonnet ($3.00 / 1M tokens)</option>
                      <option value="gemini-1.5-pro">Google gemini-1.5-pro ($1.25 / 1M tokens)</option>
                    </select>
                  </div>

                  {/* Budget Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-400">Current Monthly Spend:</span>
                      <span className={`font-bold ${budgetPercent >= 80 ? "text-[#DFB277]" : "text-[#10B981]"}`}>
                        {budgetPercent}% of Budget
                      </span>
                    </div>

                    <input
                      type="range"
                      min="40"
                      max="98"
                      value={budgetPercent}
                      onChange={(e) => setBudgetPercent(Number(e.target.value))}
                      className="w-full accent-[#DFB277] bg-neutral-800 h-2 rounded-lg cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                      <span>40% (Safe)</span>
                      <span className="text-[#DFB277] font-semibold">80% (Auto-Downgrade Trigger)</span>
                      <span>98% (Near Limit)</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleRunDowngrade}
                    disabled={downgradeRunning}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#DFB277] hover:bg-[#D4A362] text-[#080808] font-bold text-xs font-mono transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-[0_2px_12px_rgba(223,178,119,0.2)]"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#080808]" />
                    <span>{downgradeRunning ? "Evaluating Pre-Flight Rules..." : "Dispatch Gateway Proxy Request"}</span>
                  </button>
                </div>

                {/* Live Verdict (Right) */}
                <div className="p-4 rounded-xl bg-[#080808] border border-[#161722] flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#161722] text-xs font-mono text-neutral-400">
                      <span>Gateway Decision Verdict</span>
                      <span className="text-[10px] text-[#10B981] font-semibold">&lt;15µs Overhead</span>
                    </div>

                    {downgradeResult ? (
                      <div className="pt-3 space-y-3">
                        {downgradeResult.downgraded ? (
                          <div className="p-3.5 rounded-lg bg-[#DFB277]/10 border border-[#DFB277]/30 text-xs font-mono space-y-2">
                            <div className="flex items-center gap-2 text-[#DFB277] font-bold">
                              <TrendingDown className="w-4 h-4" />
                              <span>Auto-Downgrade Triggered ({budgetPercent}% $\ge$ 80% ceiling)</span>
                            </div>
                            <div className="text-[11.5px] text-neutral-300">
                              Payload mutated: <span className="line-through text-neutral-500">{downgradeResult.originalModel}</span>{" "}
                              $\rightarrow$ <span className="text-[#10B981] font-bold">{downgradeResult.activeModel}</span>
                            </div>
                            <div className="text-[11.5px] text-[#10B981] font-semibold">
                              Immediate Cost Savings: {downgradeResult.savingsPct} (${downgradeResult.costActive} vs ${downgradeResult.costOriginal})
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-mono space-y-1.5">
                            <div className="flex items-center gap-2 text-[#10B981] font-bold">
                              <ShieldCheck className="w-4 h-4" />
                              <span>Normal Dispatch Allowed ({budgetPercent}% &lt; 80%)</span>
                            </div>
                            <div className="text-[11.5px] text-neutral-300">
                              Dispatched directly to {downgradeResult.originalModel} without alterations.
                            </div>
                          </div>
                        )}

                        <div className="p-2.5 rounded-lg bg-[#0E0E14] border border-[#1A1C28] text-[10px] font-mono text-neutral-400 space-y-1">
                          <div className="flex justify-between">
                            <span>HTTP Status:</span>
                            <span className="text-[#10B981] font-bold">200 OK ({downgradeResult.latencyMs}ms)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>x-osterdops-rule:</span>
                            <span className="text-neutral-200">{downgradeResult.downgraded ? "budget-ceiling-downgrade" : "passthrough-normal"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>x-osterdops-routed-model:</span>
                            <span className="text-[#DFB277] font-bold">{downgradeResult.activeModel}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 flex flex-col items-center justify-center text-center text-xs font-mono text-neutral-500 border border-dashed border-[#1D202D] rounded-lg mt-3 p-4">
                        <span>Click &quot;Dispatch Gateway Proxy Request&quot;</span>
                        <span className="text-[10px] text-neutral-600 mt-1">Slide above 80% to see automatic model downgrade in action</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Proof Strip */}
          <div className="pt-4 border-t border-[#181924] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="flex items-start gap-2 text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">&lt;15µs In-Memory Execution:</span>
                <p className="text-[11px] text-neutral-500 mt-0.5 font-sans">Rules evaluated deterministically in memory with zero external database hops.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">RFC 7807 Standard:</span>
                <p className="text-[11px] text-neutral-500 mt-0.5 font-sans">Compliant problem envelopes for structured downstream exception parsing.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Active Pre-Flight Defense:</span>
                <p className="text-[11px] text-neutral-500 mt-0.5 font-sans">Blocks rogue agent execution before the provider charges your card.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

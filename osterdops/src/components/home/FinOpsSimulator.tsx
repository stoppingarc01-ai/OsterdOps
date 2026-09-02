"use client";

import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  Sliders,
  Zap,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
} from "lucide-react";

export function FinOpsSimulator() {
  const [activeScenario, setActiveScenario] = useState<"downgrade" | "runaway">("downgrade");

  // Scenario 1 State (Auto-Downgrade)
  const [spendPercent, setSpendPercent] = useState(85);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
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

  // Scenario 2 State (Runaway Loop Breaker)
  const [loopCount, setLoopCount] = useState(0);
  const [loopRunning, setLoopRunning] = useState(false);
  const [loopTripped, setLoopTripped] = useState(false);
  const [freezeSeconds, setFreezeSeconds] = useState(300);

  // Trigger Scenario 1: Dispatch call with spend ceiling evaluation
  const handleFireDowngradeTest = () => {
    setDowngradeRunning(true);
    setDowngradeResult(null);

    setTimeout(() => {
      const isOverThreshold = spendPercent >= 80;
      let targetModel = selectedModel;
      let costOriginal = 0.00045; // gpt-4o approx
      let costActive = 0.00045;
      let savings = "0%";

      if (isOverThreshold) {
        if (selectedModel === "gpt-4o") {
          targetModel = "gpt-4o-mini";
          costActive = 0.00002;
          savings = "-95.5%";
        } else if (selectedModel === "claude-3-5-sonnet") {
          targetModel = "claude-3-5-haiku";
          costActive = 0.00003;
          savings = "-93.3%";
        } else if (selectedModel === "gemini-1.5-pro") {
          targetModel = "gemini-1.5-flash";
          costActive = 0.00001;
          savings = "-97.8%";
        }
      }

      setDowngradeResult({
        originalModel: selectedModel,
        activeModel: targetModel,
        downgraded: isOverThreshold,
        costOriginal,
        costActive,
        savingsPct: savings,
        latencyMs: 38,
      });
      setDowngradeRunning(false);
    }, 450);
  };

  // Trigger Scenario 2: Simulate 16 rapid identical requests to trip breaker
  const handleTriggerRunawayLoop = () => {
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
        setFreezeSeconds(300);
      }
    }, 90);
  };

  const handleResetLoopBreaker = () => {
    setLoopTripped(false);
    setLoopCount(0);
  };

  return (
    <section id="simulator" className="py-20 bg-[#0A0A0A] border-y border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
            Simulator
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Active Governance Simulator
          </h2>

          <p className="text-sm text-neutral-400">
            Test pre-flight auto-downgrade routing and the 30-second runaway loop breaker in real time.
          </p>
        </div>

        {/* Simulator Card Box */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] p-6 lg:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* Top Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-[#1A1A1A]">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#080808] border border-[#161616]">
              <button
                onClick={() => setActiveScenario("downgrade")}
                className={`px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeScenario === "downgrade"
                    ? "bg-[#DFB277] text-[#0E0E0E] font-bold shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                1. Auto-Downgrade Routing (80% Ceiling)
              </button>
              <button
                onClick={() => setActiveScenario("runaway")}
                className={`px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeScenario === "runaway"
                    ? "bg-red-500 text-white font-bold shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                2. Runaway Loop Breaker (30s Velocity)
              </button>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-neutral-400">Circuit State:</span>
              {loopTripped ? (
                <span className="px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-500/40 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Tripped (Frozen)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  Closed (Healthy)
                </span>
              )}
            </div>
          </div>

          {/* Scenario 1: Auto-Downgrade Playground */}
          {activeScenario === "downgrade" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Control Panel */}
                <div className="p-4 rounded-xl bg-[#080808] border border-[#161616] space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-neutral-300">Target Frontier Model:</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#222222] text-xs font-mono text-white outline-none focus:border-[#DFB277]/50"
                    >
                      <option value="gpt-4o">OpenAI gpt-4o ($2.50 / 1M)</option>
                      <option value="claude-3-5-sonnet">Anthropic claude-3-5-sonnet ($3.00 / 1M)</option>
                      <option value="gemini-1.5-pro">Google gemini-1.5-pro ($1.25 / 1M)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-400">Simulated Workspace Spend:</span>
                      <span
                        className={`font-bold ${
                          spendPercent >= 80 ? "text-[#DFB277]" : "text-[#10B981]"
                        }`}
                      >
                        {spendPercent}% of Budget
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="98"
                      value={spendPercent}
                      onChange={(e) => setSpendPercent(Number(e.target.value))}
                      className="w-full accent-[#DFB277] bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                      <span>40% (Normal)</span>
                      <span className="text-[#DFB277]">80% (Downgrade Trigger)</span>
                      <span>98% (Near Limit)</span>
                    </div>
                  </div>

                  <button
                    onClick={handleFireDowngradeTest}
                    disabled={downgradeRunning}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-bold text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#0E0E0E]" />
                    <span>{downgradeRunning ? "Evaluating Policy..." : "Dispatch Gateway Proxy Call"}</span>
                  </button>
                </div>

                {/* Gateway Inspection Output */}
                <div className="p-4 rounded-xl bg-[#080808] border border-[#161616] flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Gateway Decision Verdict:</span>
                      <span className="text-[10px] text-neutral-500 font-mono">&lt; 1.8ms</span>
                    </div>

                    {downgradeResult ? (
                      <div className="space-y-2.5">
                        {downgradeResult.downgraded ? (
                          <div className="p-3 rounded-lg bg-[#DFB277]/10 border border-[#DFB277]/30 text-xs font-mono space-y-1.5">
                            <div className="flex items-center gap-2 text-[#DFB277] font-bold">
                              <TrendingDown className="w-4 h-4" />
                              <span>Auto-Downgrade Triggered ({spendPercent}% $\ge$ 80%)</span>
                            </div>
                            <div className="text-[11px] text-neutral-300">
                              Payload mutated: <span className="line-through text-neutral-500">{downgradeResult.originalModel}</span>{" "}
                              $\rightarrow$ <span className="text-[#10B981] font-bold">{downgradeResult.activeModel}</span>
                            </div>
                            <div className="text-[11px] text-[#10B981] font-semibold">
                              Cost Savings: {downgradeResult.savingsPct} (${downgradeResult.costActive.toFixed(5)} vs ${downgradeResult.costOriginal.toFixed(5)})
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-mono space-y-1">
                            <div className="flex items-center gap-2 text-[#10B981] font-bold">
                              <ShieldCheck className="w-4 h-4" />
                              <span>Normal Dispatch Allowed ({spendPercent}% &lt; 80%)</span>
                            </div>
                            <div className="text-[11px] text-neutral-300">
                              Dispatched directly to {downgradeResult.originalModel} with zero alterations.
                            </div>
                          </div>
                        )}

                        <div className="p-2.5 rounded bg-[#0E0E0E] border border-[#161616] text-[10px] font-mono text-neutral-400 space-y-1">
                          <div>HTTP Status: 200 OK | Latency: {downgradeResult.latencyMs}ms</div>
                          <div>x-osterdops-governance: {downgradeResult.downgraded ? "auto-downgraded" : "passthrough"}</div>
                          <div>x-osterdops-active-model: {downgradeResult.activeModel}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 flex items-center justify-center text-xs font-mono text-neutral-500 border border-dashed border-[#1A1A1A] rounded-lg">
                        Click &quot;Dispatch Gateway Proxy Call&quot; to inspect policy verdict
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scenario 2: Runaway Loop Breaker Playground */}
          {activeScenario === "runaway" && (
            <div className="space-y-6">
              <div
                className={`p-5 rounded-xl border transition-all ${
                  loopTripped
                    ? "bg-red-950/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                    : "bg-[#080808] border-[#161616]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className={`w-5 h-5 ${loopTripped ? "text-red-400" : "text-neutral-400"}`} />
                      <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                        30-Second Velocity Runaway Guard
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">
                      If an autonomous agent gets stuck in a recursive prompt loop and fires &gt; 15 identical requests within 30 seconds, OsterdOps freezes the key for 5 minutes.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {loopTripped ? (
                      <button
                        onClick={handleResetLoopBreaker}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono font-bold text-xs cursor-pointer shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Breaker</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleTriggerRunawayLoop}
                        disabled={loopRunning}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-mono font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5 fill-red-400" />
                        <span>{loopRunning ? "Firing Rapid Requests..." : "Trigger Loop (16 Rapid Calls)"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Counter & Live Interception */}
                <div className="mt-5 pt-4 border-t border-[#1A1A1A] space-y-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Identical Prompt Request Velocity:</span>
                    <span className={`font-bold ${loopTripped ? "text-red-400" : "text-[#DFB277]"}`}>
                      {loopCount} / 15 requests (Threshold)
                    </span>
                  </div>

                  {/* Meter Bar */}
                  <div className="w-full bg-[#161616] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 ${
                        loopTripped ? "bg-red-500" : "bg-[#DFB277]"
                      }`}
                      style={{ width: `${Math.min(100, (loopCount / 15) * 100)}%` }}
                    />
                  </div>

                  {loopTripped && (
                    <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-red-400" />
                        <span>HTTP 429: BLOCKED_RUNAWAY_LOOP (Execution Frozen)</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        &quot;Runaway agent loop detected by OsterdOps Circuit Breaker. Gateway execution frozen for 300s.&quot;
                      </p>
                      <div className="text-[10px] text-neutral-500 pt-1">
                        Downstream LLM provider was spared 10,000+ looped tokens. Zero billing damage incurred.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

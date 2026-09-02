"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sliders,
  DollarSign,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Lock,
  RefreshCw,
} from "lucide-react";

interface GovernanceRulesCardProps {
  organizationId?: string;
  projectId?: string;
  className?: string;
}

export function GovernanceRulesCard({
  organizationId = "default",
  projectId = "default",
  className = "",
}: GovernanceRulesCardProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form state
  const [autoDowngrade, setAutoDowngrade] = useState(true);
  const [downgradeThreshold, setDowngradeThreshold] = useState(80);
  const [runawayProtection, setRunawayProtection] = useState(true);
  const [runawayThreshold, setRunawayThreshold] = useState(15);
  const [monthlyProjectCap, setMonthlyProjectCap] = useState(500);
  const [dailyKeyCap, setDailyKeyCap] = useState(50);

  // Tripped circuit breaker state
  const [trippedBreakers, setTrippedBreakers] = useState<
    Record<string, { trippedAt: string; tripUntil: string; remainingSeconds: number }>
  >({});
  const isTripped = Object.keys(trippedBreakers).length > 0;

  // Fetch active policy
  useEffect(() => {
    let mounted = true;
    async function fetchPolicy() {
      try {
        const res = await fetch(
          `/api/v1/governance/policies?organizationId=${encodeURIComponent(
            organizationId
          )}&projectId=${encodeURIComponent(projectId)}`
        );
        if (res.ok) {
          const json = await res.json();
          if (mounted && json.data?.policy) {
            const p = json.data.policy;
            setAutoDowngrade(p.autoDowngradeEnabled ?? true);
            setDowngradeThreshold(p.downgradeThreshold ?? 80);
            setRunawayProtection(p.runawayLoopProtectionEnabled ?? true);
            setRunawayThreshold(p.runawayLoopThreshold ?? 15);
            setMonthlyProjectCap(p.monthlyProjectCap ?? 500);
            setDailyKeyCap(p.dailyKeyCap ?? 50);
            if (json.data.trippedBreakers) {
              setTrippedBreakers(json.data.trippedBreakers);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load governance policy:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPolicy();
    const interval = setInterval(fetchPolicy, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [organizationId, projectId]);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/v1/governance/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          projectId,
          autoDowngradeEnabled: autoDowngrade,
          downgradeThreshold: Number(downgradeThreshold),
          runawayLoopProtectionEnabled: runawayProtection,
          runawayLoopThreshold: Number(runawayThreshold),
          monthlyProjectCap: Number(monthlyProjectCap),
          dailyKeyCap: Number(dailyKeyCap),
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save governance policy:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetBreaker = async (apiKeyId: string) => {
    try {
      await fetch("/api/v1/governance/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          projectId,
          action: "reset_breaker",
          apiKeyId,
        }),
      });
      setTrippedBreakers((prev) => {
        const next = { ...prev };
        delete next[apiKeyId];
        return next;
      });
    } catch (err) {
      console.error("Failed to reset circuit breaker:", err);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-[#0E0E0E] border ${
        isTripped ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse" : "border-[#1A1A1A]"
      } p-5 lg:p-6 space-y-6 transition-all ${className}`}
    >
      {/* Top Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DFB277]/10 border border-[#DFB277]/30 flex items-center justify-center text-[#DFB277]">
            <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Hard FinOps & Active Governance
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DFB277]/10 text-[#DFB277] border border-[#DFB277]/30 font-semibold uppercase">
                Active Pre-Flight
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Sub-5ms inline policy enforcement: hard spend ceilings, dynamic model downgrade, and runaway agent loop protection.
            </p>
          </div>
        </div>

        {/* Live Breaker Status Badge */}
        <div className="flex items-center gap-2.5">
          {isTripped ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-400 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Circuit Tripped (Frozen)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Circuit Closed (Healthy)</span>
            </div>
          )}
        </div>
      </div>

      {/* Tripped Notice Banner (If Any Breaker Is Active) */}
      {isTripped && (
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-300 text-xs font-semibold">
              <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                Runaway loop breaker active on {Object.keys(trippedBreakers).length} key(s). Downstream calls frozen for 5 minutes.
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(trippedBreakers).map(([keyId, record]) => (
              <div
                key={keyId}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/60 border border-red-500/30 text-[11px] font-mono text-neutral-300"
              >
                <span>Key: {keyId.slice(0, 12)}...</span>
                <span className="text-red-400 font-bold">{record.remainingSeconds}s left</span>
                <button
                  onClick={() => handleResetBreaker(keyId)}
                  className="px-1.5 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[10px] cursor-pointer"
                >
                  Reset Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of 3 Governance Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Domain 1: Automated Downgrade Routing */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#1A1A1A] hover:border-[#262626] transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#DFB277]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Automated Downgrade
              </h3>
            </div>
            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => setAutoDowngrade(!autoDowngrade)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                autoDowngrade ? "bg-[#DFB277]" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#0E0E0E] transition-transform ${
                  autoDowngrade ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Automatically rewrites outgoing model requests to high-efficiency variants when budget reaches threshold, preserving uptime without breaking client code.
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400">Trigger Threshold:</span>
              <span className="text-[#DFB277] font-bold">{downgradeThreshold}% of Budget</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={downgradeThreshold}
              disabled={!autoDowngrade}
              onChange={(e) => setDowngradeThreshold(Number(e.target.value))}
              className="w-full accent-[#DFB277] bg-neutral-800 h-1.5 rounded-lg cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>50% (Early)</span>
              <span>80% (Recommended)</span>
              <span>95% (Aggressive)</span>
            </div>
          </div>

          {/* Model Mapping Preview Tags */}
          <div className="pt-2 border-t border-[#161616] space-y-1.5">
            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
              Fallback Matrix:
            </div>
            <div className="flex flex-col gap-1 text-[10px] font-mono text-neutral-300">
              <div className="flex items-center justify-between px-2 py-1 rounded bg-[#0E0E0E] border border-[#161616]">
                <span className="text-neutral-400">gpt-4o</span>
                <ArrowRight className="w-3 h-3 text-[#DFB277]" />
                <span className="text-[#10B981]">gpt-4o-mini (-94%)</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-[#0E0E0E] border border-[#161616]">
                <span className="text-neutral-400">claude-3-5-sonnet</span>
                <ArrowRight className="w-3 h-3 text-[#DFB277]" />
                <span className="text-[#10B981]">claude-3-5-haiku (-80%)</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-[#0E0E0E] border border-[#161616]">
                <span className="text-neutral-400">gemini-1.5-pro</span>
                <ArrowRight className="w-3 h-3 text-[#DFB277]" />
                <span className="text-[#10B981]">gemini-1.5-flash (-95%)</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-[#0E0E0E] border border-[#161616]">
                <span className="text-neutral-400">kimi-k1.5</span>
                <ArrowRight className="w-3 h-3 text-[#DFB277]" />
                <span className="text-[#10B981]">moonshot-v1-8k (-50%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Domain 2: Runaway Loop Guard */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#1A1A1A] hover:border-[#262626] transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Runaway Loop Guard
              </h3>
            </div>
            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => setRunawayProtection(!runawayProtection)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                runawayProtection ? "bg-red-500" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#0E0E0E] transition-transform ${
                  runawayProtection ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Intercepts recursive agent loops and buggy client code by tracking duplicate prompt signatures in a 30-second sliding window.
          </p>

          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Trip Trigger Velocity:</span>
                <span className="text-red-400 font-bold">{runawayThreshold} req / 30s</span>
              </div>
              <input
                type="number"
                min="5"
                max="100"
                value={runawayThreshold}
                disabled={!runawayProtection}
                onChange={(e) => setRunawayThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] text-white text-xs font-mono focus:border-red-500/60 outline-none disabled:opacity-40"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-[#0E0E0E] border border-[#161616] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 font-medium">
                <Lock className="w-3 h-3 text-red-400" />
                <span>Enforcement Action:</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                Instantly drops downstream calls with HTTP 429 and freezes the offending API key for 5 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Domain 3: Hierarchical Hard Spend Caps */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#1A1A1A] hover:border-[#262626] transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#10B981]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Hard Spend Ceilings
              </h3>
            </div>
            <div className="px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-[10px] font-mono">
              RFC 7807 402
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Strict pre-flight enforcement evaluated hierarchically. When spend hits 100%, proxy calls are blocked before reaching vendor APIs.
          </p>

          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                <span>Monthly Project Cap ($):</span>
                <span className="text-neutral-500">1st of Month Reset</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-neutral-500 text-xs">$</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={monthlyProjectCap}
                  onChange={(e) => setMonthlyProjectCap(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] text-white text-xs font-mono focus:border-[#10B981]/60 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                <span>Daily Key Cap ($):</span>
                <span className="text-neutral-500">Midnight UTC Reset</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-neutral-500 text-xs">$</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={dailyKeyCap}
                  onChange={(e) => setDailyKeyCap(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] text-white text-xs font-mono focus:border-[#10B981]/60 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1A1A1A]">
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>Inline Pre-Flight Overhead: &lt; 1.8ms (Redis / In-Memory LRU)</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-mono font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Policies Active & Saved!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-bold text-xs font-mono transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Applying Policies...</span>
              </>
            ) : (
              <span>Save Governance Rules</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

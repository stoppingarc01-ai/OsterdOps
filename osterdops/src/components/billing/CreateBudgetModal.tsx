"use client";

import React, { useState } from "react";
import { X, Check, Wallet, ShieldAlert, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetCreated?: (newBudget: any) => void;
}

export function CreateBudgetModal({ isOpen, onClose, onBudgetCreated }: CreateBudgetModalProps) {
  const { currentOrg, getIdToken } = useAuth();
  const [scopeName, setScopeName] = useState("");
  const [scopeType, setScopeType] = useState<"ORGANIZATION" | "PROJECT">("ORGANIZATION");
  const [monthlyLimit, setMonthlyLimit] = useState("500");
  const [warningThreshold, setWarningThreshold] = useState("80");
  const [enforcementMode, setEnforcementMode] = useState<"SOFT_ALERT" | "HARD_BLOCK">("HARD_BLOCK");
  const [period, setPeriod] = useState<"MONTHLY" | "WEEKLY" | "DAILY">("MONTHLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id) return;

    setError(null);
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any>("/api/v1/budgets", {
        method: "POST",
        token,
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name: scopeName.trim(),
          amountUsd: parseFloat(monthlyLimit) || 500,
          period,
          scope: scopeType,
          enforcementMode,
          alertThresholdsPercent: [parseInt(warningThreshold, 10) || 80, 95, 100],
        }),
      });

      if (res.error) {
        throw new Error(res.error || "Failed to create budget cap");
      }

      setSubmitted(true);
      if (onBudgetCreated && res.data) {
        onBudgetCreated(res.data);
      }

      setTimeout(() => {
        setSubmitted(false);
        setScopeName("");
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0d0f18] border border-[#23273a] rounded-2xl p-6 shadow-2xl relative text-white space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#787d91] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#dfba82]/20 border border-[#dfba82]/40 flex items-center justify-center text-[#dfba82]">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#f4efe6]">Create Budget Spending Cap</h3>
            <p className="text-xs text-[#8e93a6]">Enforce automated cost limits and throttling policies.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#dfba82]/20 border border-[#dfba82] flex items-center justify-center mx-auto text-[#dfba82]">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-white">Budget Cap Enforced!</div>
            <div className="text-xs text-[#8e93a6]">
              {scopeName} capped at ${monthlyLimit}/{period.toLowerCase()} with {enforcementMode}.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                Budget Cap Name
              </label>
              <input
                type="text"
                required
                value={scopeName}
                onChange={(e) => setScopeName(e.target.value)}
                placeholder="e.g. Organization Master Cap"
                className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Budget Scope
                </label>
                <select
                  value={scopeType}
                  onChange={(e) => setScopeType(e.target.value as any)}
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="ORGANIZATION">Organization-Wide</option>
                  <option value="PROJECT">Project Specific</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Spending Cap ($ USD)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  placeholder="500.00"
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Warning Threshold
                </label>
                <select
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(e.target.value)}
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="75">At 75% Utilization</option>
                  <option value="80">At 80% Utilization</option>
                  <option value="85">At 85% Utilization</option>
                  <option value="90">At 90% Utilization</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Enforcement Mode
                </label>
                <select
                  value={enforcementMode}
                  onChange={(e) => setEnforcementMode(e.target.value as any)}
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="HARD_BLOCK">Hard Block (Reject requests at 100%)</option>
                  <option value="SOFT_ALERT">Soft Alert (Notify team without block)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1c1f2e]">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Enforce Budget Cap</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

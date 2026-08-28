"use client";

import React, { useState } from "react";
import { X, Check, Wallet, ShieldAlert } from "lucide-react";

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBudgetModal({ isOpen, onClose }: CreateBudgetModalProps) {
  const [scopeName, setScopeName] = useState("");
  const [scopeType, setScopeType] = useState("Team Budget");
  const [monthlyLimit, setMonthlyLimit] = useState("10000");
  const [warningThreshold, setWarningThreshold] = useState("85");
  const [enforcementAction, setEnforcementAction] = useState("Throttle to gpt-4o-mini");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setScopeName("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
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
            <h3 className="text-lg font-semibold text-[#f4efe6]">Create Budget Spending Cap</h3>
            <p className="text-xs text-[#8e93a6]">Enforce automated cost limits and throttling policies.</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#dfba82]/20 border border-[#dfba82] flex items-center justify-center mx-auto text-[#dfba82]">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-white">Budget Cap Enforced!</div>
            <div className="text-xs text-[#8e93a6]">{scopeName} capped at ${monthlyLimit}/mo with {enforcementAction}.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                Target Entity / Scope Name
              </label>
              <input
                type="text"
                required
                value={scopeName}
                onChange={(e) => setScopeName(e.target.value)}
                placeholder="e.g. Mobile App AI Backend"
                className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Budget Scope Type
                </label>
                <select
                  value={scopeType}
                  onChange={(e) => setScopeType(e.target.value)}
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Team Budget">Team Budget</option>
                  <option value="Project">Project / App</option>
                  <option value="Model Limit">Specific Model Limit</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Monthly Cap ($ USD)
                </label>
                <input
                  type="number"
                  required
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  placeholder="10000"
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Warning Alert Threshold
                </label>
                <select
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(e.target.value)}
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="80">At 80% Utilization</option>
                  <option value="85">At 85% Utilization</option>
                  <option value="90">At 90% Utilization</option>
                  <option value="95">At 95% Utilization</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Enforcement Action
                </label>
                <select
                  value={enforcementAction}
                  onChange={(e) => setEnforcementAction(e.target.value)}
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Throttle to gpt-4o-mini">Auto-Route to Cheaper Model</option>
                  <option value="Prompt Compression">Compress Prompt Context</option>
                  <option value="Slack #alerts Page">Notify Slack / PagerDuty</option>
                  <option value="Hard Stop at 100%">Hard Stop (Reject Excess)</option>
                </select>
              </div>
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
                className="px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save & Enforce Limit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

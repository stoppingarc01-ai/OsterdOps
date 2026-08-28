"use client";

import React, { useState } from "react";
import { Cpu, ShieldCheck, Zap, Sliders } from "lucide-react";

export function SmartAutomationCard() {
  const [toggles, setToggles] = useState({
    routing: true,
    guard: true,
    anomaly: true,
    token: false,
  });

  const toggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#f4efe6]">Smart Automation</h3>
        <span className="px-2.5 py-0.5 rounded-full bg-[#4ade80]/15 border border-[#4ade80]/30 text-[#4ade80] text-[10.5px] font-bold">
          Active
        </span>
      </div>

      {/* Toggles List */}
      <div className="space-y-3">
        {/* Toggle 1: Auto Model Routing */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82] shrink-0">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Auto Model Routing</div>
              <div className="text-[10.5px] text-[#73788c]">Automatically route to most cost-effective model</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle("routing")}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
              toggles.routing ? "bg-[#dfba82]" : "bg-[#1f2233]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                toggles.routing ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Budget Guard */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82] shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Budget Guard</div>
              <div className="text-[10.5px] text-[#73788c]">Prevent costs from exceeding budgets</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle("guard")}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
              toggles.guard ? "bg-[#dfba82]" : "bg-[#1f2233]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                toggles.guard ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle 3: Anomaly Auto-Response */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82] shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Anomaly Auto-Response</div>
              <div className="text-[10.5px] text-[#73788c]">Block or throttle unexpected spikes</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle("anomaly")}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
              toggles.anomaly ? "bg-[#dfba82]" : "bg-[#1f2233]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                toggles.anomaly ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle 4: Token Optimization */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#141724] border border-[#232738] flex items-center justify-center text-[#dfba82] shrink-0">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Token Optimization</div>
              <div className="text-[10.5px] text-[#73788c]">Compress and optimize prompts automatically</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle("token")}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
              toggles.token ? "bg-[#dfba82]" : "bg-[#1f2233]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#07080c] transition-transform ${
                toggles.token ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

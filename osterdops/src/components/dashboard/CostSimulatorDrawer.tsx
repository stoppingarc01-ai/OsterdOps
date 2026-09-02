"use client";

import React, { useEffect, useState } from "react";
import { X, Zap, TrendingDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface CostSimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CostSimulatorDrawer({ isOpen, onClose }: CostSimulatorDrawerProps) {
  const { currentOrg, getIdToken } = useAuth();
  const [currentSpend, setCurrentSpend] = useState<number>(0);
  const [fallbackRatio, setFallbackRatio] = useState(40); // 0% to 100%
  const [cacheRate, setCacheRate] = useState(65); // 0% to 90%
  const [semanticCompression, setSemanticCompression] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCurrentSpend() {
      if (!currentOrg?.id) return;
      try {
        const token = await getIdToken();
        const res = await apiRequest<any>("/api/v1/analytics/overview", {
          params: { organizationId: currentOrg.id, timeRange: "30d" },
          token,
        });
        if (isMounted && res.data?.kpis?.totalSpendUsd != null) {
          setCurrentSpend(res.data.kpis.totalSpendUsd);
        }
      } catch (err) {
        if (isMounted) setCurrentSpend(0);
      }
    }

    if (isOpen) {
      fetchCurrentSpend();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentOrg?.id, getIdToken]);

  if (!isOpen) return null;

  // Calculate simulated savings based on live spend
  const effectiveSpend = currentSpend > 0 ? currentSpend : 100; // base for formula if zero spend yet
  const fallbackSavings = (fallbackRatio / 100) * (effectiveSpend * 0.3);
  const cacheSavings = (cacheRate / 100) * (effectiveSpend * 0.25);
  const compressionSavings = semanticCompression ? effectiveSpend * 0.1 : 0;

  const totalSavings = fallbackSavings + cacheSavings + compressionSavings;
  const simulatedSpend = Math.max(0, currentSpend - totalSavings);
  const percentageSaved = effectiveSpend > 0 ? ((totalSavings / effectiveSpend) * 100).toFixed(1) : "0.0";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-lg bg-[#0d0f18] border-l border-[#23273a] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto text-white"
        >
          {/* Header */}
          <div className="space-y-4 pb-4 border-b border-[#1c1f30]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#f4efe6]">Interactive Cost Simulator</h3>
                  <p className="text-xs text-[#8e93a6]">Simulate LLM routing & semantic cache optimizations in real time.</p>
                </div>
              </div>
              <button onClick={onClose} className="text-[#6e7387] hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Results Card */}
            <div className="p-4 bg-[#141726] border border-[#262a3f] rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs text-[#8e93a6]">
                <span>Current Monthly Spend</span>
                <span>Simulated Spend</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <div className="text-lg font-bold text-[#8e93a6] line-through">${currentSpend.toFixed(2)}</div>
                <div className="text-2xl font-extrabold text-[#dfba82]">${simulatedSpend.toFixed(2)}</div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#1f2336] text-xs">
                <span className="text-[#4ade80] font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Save ${totalSavings.toFixed(2)}/mo ({percentageSaved}%)
                </span>
                <span className="text-[10.5px] text-[#6e7387]">Live Calculation</span>
              </div>
            </div>
          </div>

          {/* Controls Form */}
          <div className="py-6 space-y-6 flex-1">
            {/* Slider 1: Fallback Ratio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-white">Route flagship traffic to mini models</label>
                <span className="font-bold text-[#dfba82] font-mono">{fallbackRatio}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={fallbackRatio}
                onChange={(e) => setFallbackRatio(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1f2336] rounded-lg appearance-none cursor-pointer accent-[#dfba82]"
              />
              <p className="text-[11px] text-[#73788c]">
                Automatically route simple classification and formatting queries to high-throughput mini models.
              </p>
            </div>

            {/* Slider 2: Prompt Caching */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-white">Semantic Cache Target Hit Rate</label>
                <span className="font-bold text-[#dfba82] font-mono">{cacheRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={cacheRate}
                onChange={(e) => setCacheRate(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1f2336] rounded-lg appearance-none cursor-pointer accent-[#dfba82]"
              />
              <p className="text-[11px] text-[#73788c]">
                Deflect repeated and semantically similar prompt requests at the edge.
              </p>
            </div>

            {/* Toggle: Semantic Compression */}
            <div
              className="p-4 bg-[#121422] border border-[#1e2236] rounded-xl flex items-center justify-between cursor-pointer"
              onClick={() => setSemanticCompression(!semanticCompression)}
            >
              <div>
                <div className="text-xs font-semibold text-white">Enable Semantic Prompt Compression</div>
                <div className="text-[11px] text-[#73788c] mt-0.5">Strip unnecessary tokens before upstream dispatch.</div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  semanticCompression ? "bg-[#dfba82] border-[#dfba82] text-black" : "border-[#383d54]"
                }`}
              >
                {semanticCompression && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-[#1c1f30] flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#23273a] text-xs font-medium text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold shadow-md transition-all text-center cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

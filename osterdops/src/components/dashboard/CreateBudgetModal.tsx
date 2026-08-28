"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";

interface CreateBudgetModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
}

export function CreateBudgetModal({ isOpen, title, onClose }: CreateBudgetModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("5000");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d0f18] border border-[#23273a] rounded-2xl p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#787d91] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-[#f4efe6]">{title || "Create Budget"}</h3>
        <p className="text-xs text-[#8e93a6] mt-1">
          Configure AI cost guardrails and automated threshold alerts.
        </p>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#dfba82]/20 border border-[#dfba82] flex items-center justify-center mx-auto text-[#dfba82]">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-white">Action saved successfully!</div>
            <div className="text-xs text-[#8e93a6]">Your OsterdOps policies have been updated.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                Name / Label
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production LLM Gateway"
                className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
              />
            </div>

            <div>
              <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                Monthly Threshold Limit ($)
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#8e93a6] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Save Configuration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Search, Command, ArrowRight, X, Cpu, DollarSign, ShieldAlert, Folder, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectAction,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent if needed
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { id: "sim", title: "Open AI Cost Simulator", category: "Actions", icon: Zap, shortcut: "⌘S" },
    { id: "budget", title: "Create New Budget Guardrail", category: "Actions", icon: DollarSign, shortcut: "⌘B" },
    { id: "policy", title: "Enforce Model Rate Limit Policy", category: "Governance", icon: ShieldAlert, shortcut: "⌘P" },
    { id: "gpt4o", title: "Inspect gpt-4o Model Spend & Latency", category: "Models", icon: Cpu, shortcut: "↵" },
    { id: "support", title: "View Support Agent Project Analytics", category: "Projects", icon: Folder, shortcut: "↵" },
    { id: "keys", title: "Manage Provider API Keys & Proxy Tokens", category: "Settings", icon: Command, shortcut: "⌘K" },
  ];

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-xl bg-[#0c0e17] border border-[#23273a] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_0_1px_rgba(223,186,130,0.15)] overflow-hidden text-white relative"
        >
          {/* Top Search Bar */}
          <div className="p-4 border-b border-[#1c1f30] flex items-center gap-3">
            <Search className="w-5 h-5 text-[#dfba82] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, models, guardrails, actions... (Press Esc to close)"
              className="w-full bg-transparent text-sm text-white placeholder-[#5d6278] focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-[#6e7387] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#787d91]">
                No matching command found for &quot;{query}&quot;
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectAction(item.title);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#151828] border border-transparent hover:border-[#dfba82]/30 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#181b2a] border border-[#262a3f] flex items-center justify-center text-[#dfba82] group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-[#dfba82] transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#6e7387]">{item.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#161826] border border-[#232738] text-[10px] font-mono text-[#8e93a6]">
                        {item.shortcut}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#6e7387] group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="p-3 bg-[#08090f] border-t border-[#1a1c2a] flex items-center justify-between text-[10.5px] text-[#6e7387]">
            <div className="flex items-center gap-3">
              <span><kbd className="px-1.5 py-0.5 bg-[#141724] border border-[#232738] rounded">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-[#141724] border border-[#232738] rounded">Enter</kbd> Select</span>
            </div>
            <div>OsterdOps Fast Command System</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

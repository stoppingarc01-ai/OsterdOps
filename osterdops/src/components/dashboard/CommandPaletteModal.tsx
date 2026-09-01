"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  ArrowRight,
  X,
  Cpu,
  DollarSign,
  ShieldAlert,
  Folder,
  Zap,
  LayoutDashboard,
  LineChart,
  Wallet,
  Bell,
  KeyRound,
  Users,
  CreditCard,
  ShieldCheck,
  FileCheck2,
  HeartPulse,
  Settings,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectAction,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
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
    { id: "dash", title: "Go to Overview Dashboard", category: "Navigation", href: "/dashboard", icon: LayoutDashboard, shortcut: "G D" },
    { id: "analytics", title: "View Spend & Usage Analytics", category: "Observability", href: "/dashboard/analytics", icon: LineChart, shortcut: "G A" },
    { id: "budgets", title: "Manage Budgets & Spend Ceilings", category: "Governance", href: "/dashboard/budgets", icon: Wallet, shortcut: "G B" },
    { id: "alerts", title: "View Operational & Threshold Alerts", category: "Governance", href: "/dashboard/alerts", icon: Bell, shortcut: "G L" },
    { id: "projects", title: "Manage Projects & API Configuration", category: "Developer", href: "/dashboard/projects", icon: Folder, shortcut: "G P" },
    { id: "keys", title: "Manage Scoped API Keys", category: "Developer", href: "/dashboard/api-keys", icon: KeyRound, shortcut: "G K" },
    { id: "docs", title: "API Documentation & Specifications", category: "Developer", href: "/dashboard/developers/api", icon: BookOpen, shortcut: "G R" },
    { id: "members", title: "Team Members & Role Management", category: "Organization", href: "/dashboard/members", icon: Users, shortcut: "G M" },
    { id: "audit", title: "Inspect Tamper-Evident Audit Logs", category: "Organization", href: "/dashboard/audit-logs", icon: FileCheck2, shortcut: "G T" },
    { id: "billing", title: "Subscription, Invoices & Usage", category: "Billing", href: "/dashboard/billing", icon: CreditCard, shortcut: "G $" },
    { id: "security", title: "Security Center & Posture Score", category: "Security", href: "/dashboard/security", icon: ShieldCheck, shortcut: "G S" },
    { id: "system", title: "System Health & Diagnostics", category: "System", href: "/dashboard/system", icon: HeartPulse, shortcut: "G H" },
    { id: "settings", title: "Organization & Governance Settings", category: "Settings", href: "/dashboard/settings", icon: Settings, shortcut: "G ," },
    { id: "sim", title: "Open AI Cost Simulator", category: "Actions", icon: Zap, shortcut: "⌘S" },
  ];

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: (typeof items)[0]) => {
    if (item.href) {
      router.push(item.href);
    }
    if (onSelectAction) {
      onSelectAction(item.title);
    }
    onClose();
  };

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
                    onClick={() => handleSelect(item)}
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

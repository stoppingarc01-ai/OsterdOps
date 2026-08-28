"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  CreditCard,
  FileText,
  Headphones,
  Home,
  PenTool,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";

interface AdminCommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string) => void;
}

export function AdminCommandPaletteModal({
  isOpen,
  onClose,
  onSelectAction,
}: AdminCommandPaletteModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onSelectAction("open_palette");
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onSelectAction]);

  if (!isOpen) return null;

  const items = [
    { id: "overview", label: "Dashboard Overview", category: "Navigation", icon: Home },
    { id: "customers", label: "Customers & Accounts", category: "Navigation", icon: Users },
    { id: "organizations", label: "Organizations & Teams", category: "Navigation", icon: Building2 },
    { id: "subscriptions", label: "Subscriptions & Billing", category: "Navigation", icon: CreditCard },
    { id: "support", label: "Support Ticket Inbox", category: "Navigation", icon: Headphones },
    { id: "health", label: "System Health & Gateway Matrix", category: "Operations", icon: Radio },
    { id: "audit-logs", label: "SOC 2 Audit Logs", category: "Operations", icon: FileText },
    { id: "blog", label: "Create & Manage Blog Posts", category: "Content", icon: PenTool },
    { id: "admin-users", label: "Admin Users & RBAC Roles", category: "System", icon: ShieldCheck },
    { id: "settings", label: "System Settings", category: "System", icon: Settings },
    { id: "gateway_test", label: "Test AI Gateway Endpoint", category: "Quick Actions", icon: Zap },
    { id: "create_post", label: "+ Create New Blog Post", category: "Quick Actions", icon: Sparkles },
  ];

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#0e111a] border border-[#262c3e] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1c2232] gap-3">
          <Search className="h-4 w-4 text-[#dfba82] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search sections..."
            className="w-full bg-transparent text-[13.5px] text-white placeholder-[#6c7285] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#6c7285] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectAction(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#161a26] text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <IconComp className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[13px] font-medium text-[#e4e0d8] group-hover:text-[#dfba82] transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#555a6d] bg-[#121520] px-2 py-0.5 rounded border border-[#1b202e]">
                    {item.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-[#6c7285] text-[13px]">
              No matching commands or pages found.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#080a10] border-t border-[#171b26] flex items-center justify-between text-[11px] text-[#555a6d]">
          <div className="flex items-center gap-2">
            <span>Navigate with</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#121520] border border-[#22283a] text-[10px] text-[#8e94a8]">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[#121520] border border-[#22283a] text-[10px] text-[#8e94a8]">↓</kbd>
          </div>
          <div className="flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#121520] border border-[#22283a] text-[10px] text-[#8e94a8]">ESC</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

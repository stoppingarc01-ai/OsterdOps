"use client";

import React, { useState } from "react";
import { Bell, ChevronDown, LogOut, Search, ShieldCheck } from "lucide-react";

interface AdminHeaderProps {
  breadcrumb?: string;
  onOpenCommandPalette?: () => void;
  onLogout?: () => void;
}

export function AdminHeader({
  breadcrumb = "Overview",
  onOpenCommandPalette,
  onLogout,
}: AdminHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-16 border-b border-[#171b26] bg-[#07080d]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Left: Breadcrumbs & Search */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[12.5px] text-[#717688]">
          <span className="hover:text-white transition-colors cursor-pointer">Admin</span>
          <span className="text-[#3c4253]">/</span>
          <span className="text-[#dfba82] font-medium">{breadcrumb}</span>
        </div>

        {/* Global Search Bar */}
        <div
          onClick={onOpenCommandPalette}
          className="relative hidden sm:flex items-center w-72 lg:w-96 bg-[#0e111a] border border-[#1d2232] hover:border-[#2b334a] rounded-xl px-3.5 py-1.5 transition-all cursor-pointer group shadow-sm"
        >
          <Search className="h-3.5 w-3.5 text-[#6c7285] group-hover:text-[#9ca3b8] transition-colors shrink-0 mr-2.5" />
          <span className="text-[12.5px] text-[#6c7285] group-hover:text-[#9ca3b8] transition-colors grow">
            Search everything...
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#7a8094] bg-[#141824] border border-[#232a3d] rounded">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <button
          id="admin-notification-btn"
          aria-label="View notifications"
          className="relative p-2 rounded-xl text-[#8e94a8] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#dfba82] text-[#07080c] font-bold text-[10px] flex items-center justify-center shadow-[0_0_8px_rgba(223,186,130,0.5)]">
            7
          </span>
        </button>

        <div className="h-5 w-px bg-[#1d2232]" />

        {/* Profile Pill & Dropdown */}
        <div className="relative">
          <div
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="h-8 w-8 rounded-full bg-[#dfba82]/20 border border-[#dfba82]/40 text-[#dfba82] flex items-center justify-center font-bold text-[11.5px]">
              AP
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[12.5px] font-semibold text-white group-hover:text-[#dfba82] transition-colors">
                Admin Prasad
              </div>
              <div className="text-[10px] text-[#717688]">Administrator</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#555a6d] group-hover:text-white transition-colors ml-0.5" />
          </div>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#121622] border border-[#232c40] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in">
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (onLogout) onLogout();
                }}
                className="w-full text-left px-3 py-2 text-[12px] text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Lock &amp; Sign Out</span>
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

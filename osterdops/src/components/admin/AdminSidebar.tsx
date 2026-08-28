"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  CreditCard,
  FileText,
  Headphones,
  Home,
  Image as ImageIcon,
  PenTool,
  Radio,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

interface AdminSidebarProps {
  activeSection?: string;
  onSelectSection?: (section: string) => void;
  onLogout?: () => void;
}

export function AdminSidebar({
  activeSection = "overview",
  onSelectSection,
  onLogout,
}: AdminSidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleNavClick = (sectionId: string) => {
    if (onSelectSection) {
      onSelectSection(sectionId);
    }
  };

  return (
    <aside className="w-64 bg-[#090b10] border-r border-[#171b26] flex flex-col justify-between shrink-0 h-screen sticky top-0 font-sans select-none overflow-y-auto">
      {/* Top Brand Header */}
      <div>
        <div className="p-6 border-b border-[#141824]/80">
          <Link href="/" className="block group">
            <h1
              className="text-[17px] font-bold tracking-[0.18em] text-[#dfba82] uppercase leading-tight group-hover:text-[#ebd2a9] transition-colors"
              style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
            >
              OsterdOps
            </h1>
            <div className="text-[10px] tracking-[0.22em] text-[#717688] uppercase font-semibold mt-1">
              Admin Console
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4 space-y-6">
          {/* Main Section */}
          <div>
            <button
              onClick={() => handleNavClick("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                activeSection === "overview"
                  ? "bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/30 shadow-[0_2px_12px_rgba(223,186,130,0.12)]"
                  : "text-[#8e94a8] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Overview</span>
            </button>
          </div>

          {/* CUSTOMERS Group */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-[0.16em] text-[#555a6d] uppercase">
              Customers
            </div>
            <div className="space-y-0.5 pt-1">
              <button
                onClick={() => handleNavClick("customers")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  activeSection === "customers"
                    ? "bg-[#dfba82]/15 text-[#dfba82]"
                    : "text-[#8e94a8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Customers</span>
              </button>
              <button
                onClick={() => handleNavClick("organizations")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  activeSection === "organizations"
                    ? "bg-[#dfba82]/15 text-[#dfba82]"
                    : "text-[#8e94a8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Organizations</span>
              </button>
              <button
                onClick={() => handleNavClick("subscriptions")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  activeSection === "subscriptions"
                    ? "bg-[#dfba82]/15 text-[#dfba82]"
                    : "text-[#8e94a8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Subscriptions</span>
              </button>
            </div>
          </div>

          {/* OPERATIONS Group */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-[0.16em] text-[#555a6d] uppercase">
              Operations
            </div>
            <div className="space-y-0.5 pt-1">
              <button
                onClick={() => handleNavClick("support")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  activeSection === "support"
                    ? "bg-[#dfba82]/15 text-[#dfba82]"
                    : "text-[#8e94a8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Headphones className="h-4 w-4" />
                <span>Support</span>
              </button>
              <button
                onClick={() => handleNavClick("health")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  activeSection === "health"
                    ? "bg-[#dfba82]/15 text-[#dfba82]"
                    : "text-[#8e94a8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Radio className="h-4 w-4" />
                <span>System Health</span>
              </button>
              <button
                onClick={() => handleNavClick("audit-logs")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  activeSection === "audit-logs"
                    ? "bg-[#dfba82]/15 text-[#dfba82]"
                    : "text-[#8e94a8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Audit Logs</span>
              </button>
            </div>
          </div>

          {/* CONTENT Group */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-[0.16em] text-[#555a6d] uppercase">
              Content
            </div>
            <div className="space-y-0.5 pt-1">
              <button
                onClick={() => handleNavClick("blog")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  activeSection === "blog"
                    ? "bg-[#dfba82]/15 text-[#dfba82]"
                    : "text-[#8e94a8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <PenTool className="h-4 w-4" />
                <span>Blog</span>
              </button>
              <button
                onClick={() => handleNavClick("media")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  activeSection === "media"
                    ? "bg-[#dfba82]/15 text-[#dfba82]"
                    : "text-[#8e94a8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Media</span>
              </button>
            </div>
          </div>

          {/* SYSTEM Group */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-[0.16em] text-[#555a6d] uppercase">
              System
            </div>
            <div className="space-y-0.5 pt-1">
              <button
                onClick={() => handleNavClick("admin-users")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  activeSection === "admin-users"
                    ? "bg-[#dfba82]/15 text-[#dfba82]"
                    : "text-[#8e94a8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Users</span>
              </button>
              <button
                onClick={() => handleNavClick("settings")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  activeSection === "settings"
                    ? "bg-[#dfba82]/15 text-[#dfba82]"
                    : "text-[#8e94a8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Footer User Profile */}
      <div className="p-3 border-t border-[#171b26] bg-[#07090e] relative">
        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#dfba82]/20 border border-[#dfba82]/40 text-[#dfba82] flex items-center justify-center font-bold text-[12px]">
              AP
            </div>
            <div>
              <div className="text-[12.5px] font-semibold text-white group-hover:text-[#dfba82] transition-colors">
                Admin Prasad
              </div>
              <div className="text-[10.5px] text-[#717688]">Administrator</div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-[#555a6d] group-hover:text-white transition-colors" />
        </div>

        {/* Dropdown Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-16 left-3 right-3 bg-[#121622] border border-[#232c40] rounded-xl shadow-2xl p-1.5 space-y-1 z-30 font-sans animate-in fade-in">
            <button
              onClick={() => {
                setShowProfileMenu(false);
                if (onLogout) onLogout();
              }}
              className="w-full text-left px-3 py-2 text-[12px] text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Lock Console &amp; Sign Out</span>
              <ShieldCheck className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

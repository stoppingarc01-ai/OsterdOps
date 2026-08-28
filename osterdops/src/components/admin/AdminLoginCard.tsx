"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { OsterdOpsLogo } from "@/components/layout/OsterdOpsLogo";

interface AdminLoginCardProps {
  onLoginSuccess: (adminData: { name: string; email: string; role: string }) => void;
}

export function AdminLoginCard({ onLoginSuccess }: AdminLoginCardProps) {
  const [adminId, setAdminId] = useState("admin@osterdops.com");
  const [password, setPassword] = useState("admin123");
  const [securityToken, setSecurityToken] = useState("849201");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials (support default demo or valid strings)
      if (
        (adminId.toLowerCase().includes("admin") || adminId.toLowerCase().includes("osterdops")) &&
        password.length >= 4
      ) {
        setIsLoading(false);
        onLoginSuccess({
          name: "Admin Prasad",
          email: adminId,
          role: "SUPERADMIN",
        });
      } else {
        setIsLoading(false);
        setErrorMessage("Invalid Administrative ID or Security Token. Use default credentials.");
      }
    }, 750);
  };

  const handleFillDemo = () => {
    setAdminId("admin@osterdops.com");
    setPassword("admin123");
    setSecurityToken("849201");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#07080d] flex items-center justify-center p-4 selection:bg-[#dfba82] selection:text-black font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#dfba82]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#38bdf8]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#0c0f16]/95 border border-[#232a3d] backdrop-blur-xl rounded-3xl p-8 shadow-[0_16px_60px_rgba(0,0,0,0.8)] relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#dfba82]/10 border border-[#dfba82]/25 text-[#dfba82] mb-1 shadow-[0_0_20px_rgba(223,186,130,0.15)]">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h1
            className="text-[24px] font-bold text-[#f4efe6] tracking-[0.08em] uppercase"
            style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
          >
            OsterdOps
          </h1>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] text-[10.5px] uppercase tracking-[0.16em] font-bold">
            <Lock className="h-3 w-3" />
            <span>Restricted Admin Portal</span>
          </div>

          <p className="text-[12px] text-[#717688] pt-1">
            Please authenticate with administrative credentials to access the OsterdOps Operations Console.
          </p>
        </div>

        {/* 1-Click Demo Fill Badge */}
        <div
          onClick={handleFillDemo}
          className="bg-[#121622] border border-[#1e2638] hover:border-[#dfba82]/40 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-2 text-[11.5px] text-[#c5c8d4]">
            <Sparkles className="h-3.5 w-3.5 text-[#dfba82]" />
            <span>Click here for <strong>Instant Demo Credentials</strong></span>
          </div>
          <span className="text-[10.5px] text-[#dfba82] font-semibold group-hover:underline">
            Auto-fill
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2.5 text-[12px] text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Admin ID */}
          <div>
            <label className="block text-[11.5px] font-semibold text-[#8e94a8] uppercase tracking-wider mb-1.5">
              Admin Identity / Email
            </label>
            <div className="relative flex items-center">
              <Mail className="h-4 w-4 text-[#555a6d] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="admin@osterdops.com"
                className="w-full bg-[#131722] border border-[#22283a] focus:border-[#dfba82] text-white text-[13px] rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Master Password */}
          <div>
            <label className="block text-[11.5px] font-semibold text-[#8e94a8] uppercase tracking-wider mb-1.5">
              Master Password
            </label>
            <div className="relative flex items-center">
              <Lock className="h-4 w-4 text-[#555a6d] absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#131722] border border-[#22283a] focus:border-[#dfba82] text-white text-[13px] rounded-xl pl-10 pr-10 py-2.5 focus:outline-none transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#555a6d] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 2FA Security Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11.5px] font-semibold text-[#8e94a8] uppercase tracking-wider">
                Security Key / 2FA Token
              </label>
              <span className="text-[10px] text-[#22c55e] font-mono font-bold">HARDWARE SYNCED</span>
            </div>
            <div className="relative flex items-center">
              <Key className="h-4 w-4 text-[#dfba82] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={securityToken}
                onChange={(e) => setSecurityToken(e.target.value)}
                placeholder="849201"
                className="w-full bg-[#131722] border border-[#22283a] focus:border-[#dfba82] text-[#dfba82] font-mono text-[13px] rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none transition-colors tracking-widest"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[13px] rounded-xl transition-all shadow-[0_2px_16px_rgba(223,186,130,0.25)] hover:shadow-[0_4px_24px_rgba(223,186,130,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Verifying Hardware Clearance...</span>
              </>
            ) : (
              <>
                <span>Authenticate &amp; Onboard to Console</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info & Return Home */}
        <div className="pt-2 border-t border-[#171b26] flex items-center justify-between text-[11px] text-[#555a6d]">
          <Link href="/" className="hover:text-[#dfba82] transition-colors">
            &larr; Return to OsterdOps Home
          </Link>
          <span>SOC 2 Type II Protected</span>
        </div>
      </div>
    </div>
  );
}

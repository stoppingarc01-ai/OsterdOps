"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Copy,
  Check,
  Eye,
  EyeOff,
  Key,
  Mail,
  Shield,
  X,
  Lock,
  ExternalLink,
} from "lucide-react";

interface ProvisionCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    email: string;
    role: string;
    temporaryPassword: string;
    workspaceName?: string;
  } | null;
}

export function ProvisionCredentialsModal({
  isOpen,
  onClose,
  credentials,
}: ProvisionCredentialsModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen || !credentials) return null;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(credentials.temporaryPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleCopyAll = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://app.osterdops.com";
    const text = `OsterdOps Workspace Invitation
Workspace: ${credentials.workspaceName || "OsterdOps"}
Login URL: ${origin}/auth/login
Email: ${credentials.email}
Role: ${credentials.role}
Temporary Password: ${credentials.temporaryPassword}

Note: You will be required to create a new password on your first login.`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const getRoleBadge = (role: string) => {
    const r = role.toUpperCase();
    if (r === "OWNER") {
      return "bg-[#DFB277]/15 border-[#DFB277]/40 text-[#DFB277]";
    }
    if (r === "ADMIN") {
      return "bg-amber-500/15 border-amber-500/30 text-amber-400";
    }
    if (r === "DEVELOPER") {
      return "bg-cyan-500/15 border-cyan-500/30 text-cyan-400";
    }
    return "bg-neutral-800 border-neutral-700 text-neutral-300";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="relative w-full max-w-lg bg-[#0E0E0E] border border-[#1A1A1A] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A] border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DFB277]/10 border border-[#DFB277]/30 flex items-center justify-center text-[#DFB277]">
              <Key className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-white">Team Member Provisioned</h3>
              <div className="text-[10px] font-mono text-[#10B981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Active Account Created
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#161616] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Security Banner */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] font-mono text-amber-200 leading-relaxed">
              <span className="font-bold text-amber-300">One-Time Credentials:</span> This temporary password will not be displayed again. Transmit it to the user over an encrypted, secure channel.
            </div>
          </div>

          {/* Credentials Card */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#161616] space-y-3">
            {/* Email & Role */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#161616]">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono text-neutral-500 uppercase">User Email</div>
                <div className="text-xs font-mono font-medium text-white">{credentials.email}</div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="text-[10px] font-mono text-neutral-500 uppercase">Role</div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRoleBadge(credentials.role)}`}>
                  {credentials.role.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Temporary Password */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-neutral-500 uppercase flex items-center justify-between">
                <span>Temporary Password</span>
                <span className="text-[#10B981] text-[9px] lowercase font-mono">first login reset required</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A]">
                <span className="font-mono text-xs text-[#DFB277] tracking-wider select-all">
                  {showPassword ? credentials.temporaryPassword : "•".repeat(credentials.temporaryPassword.length)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded hover:bg-[#161616] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-[#161616] hover:bg-[#202020] border border-[#262626] text-neutral-200 text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="w-3 h-3 text-[#10B981]" />
                        <span className="text-[#10B981]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-neutral-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-mono font-bold text-xs transition-colors cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Invitation Details Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Copy Complete Invitation Details</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl bg-[#141414] hover:bg-[#1A1A1A] border border-[#222222] text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

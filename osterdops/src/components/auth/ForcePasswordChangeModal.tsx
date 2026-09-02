"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export function ForcePasswordChangeModal({ isOpen, onSuccess }: ForcePasswordChangeModalProps) {
  const { getIdToken, refreshUser } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const token = await getIdToken(true);
      const res = await fetch("/api/v1/auth/reset-first-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || "Failed to update password.");
      }

      setSuccess(true);
      await refreshUser();
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: unknown) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="relative w-full max-w-md bg-[#0E0E0E] border border-[#1A1A1A] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 pb-4 bg-[#0A0A0A] border-b border-[#1A1A1A] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#DFB277]/10 border border-[#DFB277]/30 flex items-center justify-center text-[#DFB277]">
            <Lock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono text-white">First-Time Login Security</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Your administrator provisioned your account with a temporary password. Establish your new permanent password to access the workspace.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {success ? (
            <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-3 text-xs font-mono text-[#10B981]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Password successfully established! Unlocking workspace...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase">
                  New Password <span className="text-neutral-500">(min 8 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new permanent password"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#161616] focus:border-[#DFB277] text-white text-xs font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat permanent password"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#161616] focus:border-[#DFB277] text-white text-xs font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-mono font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <span>{submitting ? "Establishing Credentials..." : "Set Password & Access Workspace"}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

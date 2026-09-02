"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  Search,
  CheckCircle2,
  Lock,
  Zap,
  RefreshCw,
  Sparkles,
  ArrowRight,
  X,
  Loader2,
  Mail,
  Key,
  Eye,
  EyeOff,
  Copy,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RbacGuard } from "@/components/auth/RbacGuard";
import { can } from "@/lib/auth/client-permissions";
import { apiRequest } from "@/lib/api/client";
import { ProvisionCredentialsModal } from "@/components/members/ProvisionCredentialsModal";
import { ForcePasswordChangeModal } from "@/components/auth/ForcePasswordChangeModal";
import type { OrganizationRole } from "@/types";

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: OrganizationRole;
  status: "ACTIVE" | "INVITED";
  mustResetPassword?: boolean;
  joinedAt: string;
  lastActive: string;
}

export function generateClientPassword(length = 14): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  let result = "";
  const values = new Uint32Array(length);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
  }
  return result;
}

export default function MembersPage() {
  const { currentMembership, currentOrg, user, userProfile, getIdToken } = useAuth();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");

  // Direct Provisioning Modal State
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationRole>("DEVELOPER");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // One-time Credentials Modal State
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    role: string;
    temporaryPassword: string;
    workspaceName?: string;
  } | null>(null);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const callerRole: OrganizationRole = currentMembership?.role || "OWNER";
  const canManage = can("members:manage", callerRole);

  const fetchMembers = useCallback(async () => {
    if (!currentOrg?.id) return;
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any[]>(`/api/v1/workspace/members?orgId=${currentOrg.id}`, {
        token,
      });

      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: MemberItem[] = res.data.map((m: any) => ({
          id: m.id || m.userId,
          name: m.user?.name || m.user?.displayName || m.displayName || m.email?.split("@")[0] || "Team Member",
          email: m.user?.email || m.email || "user@workspace",
          role: (m.role || "DEVELOPER").toUpperCase() as OrganizationRole,
          status: m.status === "INVITED" ? "INVITED" : "ACTIVE",
          mustResetPassword: Boolean(m.mustResetPassword),
          joinedAt: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "Active",
          lastActive: m.lastActive ? new Date(m.lastActive).toLocaleDateString() : "Recently",
        }));
        setMembers(mapped);
      } else {
        // Self fallback
        const selfMember: MemberItem = {
          id: user?.uid || "usr_self",
          name: userProfile?.name || user?.displayName || (user?.email ? user.email.split("@")[0] : "Workspace Owner"),
          email: user?.email || "admin@workspace.com",
          role: callerRole,
          status: "ACTIVE",
          mustResetPassword: Boolean(currentMembership?.mustResetPassword),
          joinedAt: "Today",
          lastActive: "Just now",
        };
        setMembers([selfMember]);
      }
    } catch {
      if (user?.email) {
        setMembers([
          {
            id: user.uid,
            name: userProfile?.name || user.displayName || user.email.split("@")[0],
            email: user.email,
            role: callerRole,
            status: "ACTIVE",
            mustResetPassword: Boolean(currentMembership?.mustResetPassword),
            joinedAt: "Today",
            lastActive: "Just now",
          },
        ]);
      } else {
        setMembers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentOrg, getIdToken, user, userProfile, callerRole, currentMembership]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Open direct provisioning modal with pre-generated secure password
  const handleOpenProvisionModal = () => {
    setProvisionError(null);
    setEmail("");
    setRole("DEVELOPER");
    setTemporaryPassword(generateClientPassword(14));
    setShowPassword(false);
    setIsProvisionOpen(true);
  };

  const handleGenerateNewPassword = () => {
    setTemporaryPassword(generateClientPassword(14));
  };

  const handleProvisionMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !email.trim()) return;

    setProvisioning(true);
    setProvisionError(null);

    try {
      const token = await getIdToken();
      const res = await fetch("/api/v1/workspace/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orgId: currentOrg.id,
          email: email.trim(),
          role: role.toLowerCase(),
          password: temporaryPassword.trim(),
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error?.message || "Failed to provision workspace member.");
      }

      // Close provision form & open one-time credentials modal
      setIsProvisionOpen(false);
      setCreatedCredentials({
        email: email.trim(),
        role,
        temporaryPassword: payload.data.temporaryPassword || temporaryPassword,
        workspaceName: currentOrg.name,
      });
      setIsCredentialsModalOpen(true);

      // Refresh directory
      await fetchMembers();
    } catch (err: unknown) {
      setProvisionError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setProvisioning(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "ALL" || m.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const ownersCount = members.filter((m) => m.role === "OWNER").length;
  const adminsCount = members.filter((m) => m.role === "ADMIN").length;
  const devCount = members.filter((m) => m.role === "DEVELOPER").length;
  const viewerCount = members.filter((m) => m.role === "VIEWER").length;

  const mustResetSelf = Boolean(currentMembership?.mustResetPassword || (userProfile as any)?.mustResetPassword);

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-200 flex flex-col font-sans selection:bg-[#DFB277] selection:text-[#0E0E0E]">
      <div className="flex-1 flex flex-col lg:flex-row">
        <AppSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <ContentTransition>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1A1A]">
                <div>
                  <div className="text-[11px] font-mono text-[#DFB277] uppercase tracking-wider font-semibold">
                    Access Control &amp; RBAC
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight mt-0.5">
                    Workspace Members
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1">
                    Directly provision team members with secure temporary credentials, enforce first-login password resets, and assign least-privilege roles.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={fetchMembers}
                    disabled={loading}
                    className="p-2.5 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#262626] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Refresh member directory"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </button>

                  <RbacGuard permission="members:manage" fallback={null}>
                    <button
                      type="button"
                      onClick={handleOpenProvisionModal}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-mono font-bold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <UserPlus className="w-4 h-4 stroke-[2.5]" />
                      <span>Provision Member</span>
                    </button>
                  </RbacGuard>
                </div>
              </div>

              {/* 4 Metric Micro-Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Members */}
                <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="uppercase">Total Members</span>
                    <Users className="w-3.5 h-3.5 text-[#DFB277]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {members.length}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Active workspace accounts</div>
                </div>

                {/* Admins */}
                <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="uppercase">Administrators</span>
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {ownersCount + adminsCount}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono mt-0.5">Full policy governance</div>
                </div>

                {/* Developers */}
                <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="uppercase">Developers</span>
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {devCount}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">API key &amp; proxy ingress</div>
                </div>

                {/* Viewers */}
                <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1A1A1A]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="uppercase">Viewers</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {viewerCount}
                  </div>
                  <div className="text-[10px] text-[#10B981] font-mono mt-0.5">Read-only audit telemetry</div>
                </div>
              </div>

              {/* Members Directory Card */}
              <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] overflow-hidden shadow-sm">
                {/* Search and Filters Bar */}
                <div className="p-4 bg-[#0A0A0A] border-b border-[#1A1A1A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative max-w-sm w-full">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] focus:border-[#DFB277] text-white text-xs font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] overflow-x-auto">
                    {(["ALL", "OWNER", "ADMIN", "DEVELOPER", "VIEWER"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRole(r)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                          selectedRole === r
                            ? "bg-[#DFB277] text-[#0E0E0E] font-bold"
                            : "text-neutral-400 hover:text-white hover:bg-[#161616]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Directory Table */}
                {loading ? (
                  <div className="p-12 text-center text-xs font-mono text-neutral-500 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#DFB277]" />
                    <div>Synchronizing member directory...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#161616] text-[10px] uppercase tracking-wider text-neutral-500 bg-[#0A0A0A]/50">
                          <th className="py-3 px-4">Member</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Security Status</th>
                          <th className="py-3 px-4">Provisioned</th>
                          <th className="py-3 px-4 text-right">Last Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#161616]">
                        {filteredMembers.map((m) => (
                          <tr key={m.id} className="hover:bg-[#121212] transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-xs font-bold text-[#DFB277] uppercase shrink-0">
                                  {m.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-xs">{m.name}</div>
                                  <div className="text-[11px] text-neutral-400">{m.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Role Badge */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold border ${
                                  m.role === "OWNER"
                                    ? "bg-[#DFB277]/10 text-[#DFB277] border-[#DFB277]/40"
                                    : m.role === "ADMIN"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                    : m.role === "DEVELOPER"
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                    : "bg-neutral-800/40 text-neutral-300 border-neutral-700"
                                }`}
                              >
                                {m.role}
                              </span>
                            </td>

                            {/* Security Status */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs text-[#10B981] font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                  Active
                                </span>

                                {m.mustResetPassword && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-mono">
                                    Reset Required
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                              {m.joinedAt}
                            </td>

                            <td className="py-3.5 px-4 text-right text-neutral-400 text-[11px]">
                              {m.lastActive}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </ContentTransition>
        </main>
      </div>

      {/* =========================================================================
          Direct Provisioning Modal (Deep Obsidian luxury palette)
         ========================================================================= */}
      {isProvisionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="relative w-full max-w-lg bg-[#0E0E0E] border border-[#1A1A1A] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A] border-b border-[#1A1A1A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#DFB277]/10 border border-[#DFB277]/30 flex items-center justify-center text-[#DFB277]">
                  <UserPlus className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">Direct Member Provisioning</h3>
                  <div className="text-[10px] font-mono text-neutral-500">
                    Instantly create workspace account with temporary credentials
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProvisionOpen(false)}
                className="p-1 rounded-lg hover:bg-[#161616] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProvisionMember} className="p-6 space-y-4 text-xs font-mono">
              {provisionError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{provisionError}</span>
                </div>
              )}

              {/* Work Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-neutral-400 uppercase font-semibold">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@company.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#161616] focus:border-[#DFB277] text-white text-xs placeholder:text-neutral-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-neutral-400 uppercase font-semibold">
                  Assigned Workspace Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ADMIN", "DEVELOPER", "VIEWER"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                        role === r
                          ? "bg-[#DFB277]/15 border-[#DFB277] text-[#DFB277]"
                          : "bg-[#0A0A0A] border-[#161616] text-neutral-400 hover:text-white hover:border-[#262626]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temporary Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-neutral-400 uppercase font-semibold">
                    Temporary Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateNewPassword}
                    className="text-[10px] text-[#DFB277] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Auto-Generate
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    placeholder="Enter or auto-generate password"
                    className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#161616] focus:border-[#DFB277] text-white text-xs placeholder:text-neutral-600 focus:outline-none transition-colors select-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[10px] text-neutral-500 pt-0.5">
                  User will be forced to change this password upon first login.
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#161616]">
                <button
                  type="button"
                  onClick={() => setIsProvisionOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#222222] text-neutral-300 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisioning}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#DFB277] hover:bg-[#E5C38E] text-[#0E0E0E] font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {provisioning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <span>Provision &amp; View Credentials</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          One-Time Copyable Credentials Modal
         ========================================================================= */}
      <ProvisionCredentialsModal
        isOpen={isCredentialsModalOpen}
        credentials={createdCredentials}
        onClose={() => {
          setIsCredentialsModalOpen(false);
          setCreatedCredentials(null);
        }}
      />

      {/* =========================================================================
          First-Time Login Security Guard Modal
         ========================================================================= */}
      <ForcePasswordChangeModal
        isOpen={mustResetSelf}
        onSuccess={() => fetchMembers()}
      />
    </div>
  );
}

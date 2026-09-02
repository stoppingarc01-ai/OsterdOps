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
  MoreVertical,
  CheckCircle2,
  Clock,
  Trash2,
  Lock,
  Zap,
  RefreshCw,
  Sparkles,
  Info,
  ArrowRight,
  X,
  Loader2,
  Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RbacGuard } from "@/components/auth/RbacGuard";
import { can } from "@/lib/auth/client-permissions";
import { apiRequest } from "@/lib/api/client";
import type { OrganizationRole } from "@/types";

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: OrganizationRole;
  status: "ACTIVE" | "INVITED";
  joinedAt: string;
  lastActive: string;
}

export default function MembersPage() {
  const { currentMembership, currentOrg, user, getIdToken } = useAuth();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrganizationRole>("DEVELOPER");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const callerRole: OrganizationRole = currentMembership?.role || "OWNER";
  const canManage = can("members:manage", callerRole);

  const fetchMembers = useCallback(async () => {
    if (!currentOrg?.id) return;
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/members`, {
        token,
      });

      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: MemberItem[] = res.data.map((m: any) => ({
          id: m.id || m.userId,
          name: m.user?.name || m.user?.displayName || m.email?.split("@")[0] || "Team Member",
          email: m.user?.email || m.email || "user@workspace",
          role: (m.role || "MEMBER").toUpperCase() as OrganizationRole,
          status: m.status === "INVITED" ? "INVITED" : "ACTIVE",
          joinedAt: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "Active",
          lastActive: m.lastActive ? new Date(m.lastActive).toLocaleDateString() : "Recently",
        }));
        setMembers(mapped);
      } else {
        // Self membership fallback for authenticated user
        const selfMember: MemberItem = {
          id: user?.uid || "usr_self",
          name: user?.displayName || (user?.email ? user.email.split("@")[0] : "Workspace Owner"),
          email: user?.email || "admin@workspace.com",
          role: callerRole,
          status: "ACTIVE",
          joinedAt: "Today",
          lastActive: "Just now",
        };
        setMembers([selfMember]);
      }
    } catch (e) {
      if (user?.email) {
        setMembers([
          {
            id: user.uid,
            name: user.displayName || user.email.split("@")[0],
            email: user.email,
            role: callerRole,
            status: "ACTIVE",
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
  }, [currentOrg, getIdToken, user, callerRole]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !inviteEmail.trim()) return;

    setInviting(true);
    setInviteError(null);

    try {
      const token = await getIdToken();
      const res = await apiRequest(`/api/v1/organizations/${currentOrg.id}/members`, {
        method: "POST",
        token,
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (res.error) {
        throw new Error(res.error || "Failed to invite member.");
      }

      setIsInviteOpen(false);
      setInviteEmail("");
      await fetchMembers();
    } catch (err: any) {
      setInviteError(err.message || "An unexpected error occurred.");
    } finally {
      setInviting(false);
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
  const devCount = members.filter((m) => (m.role as string) === "DEVELOPER" || (m.role as string) === "MEMBER").length;
  const viewerCount = members.filter((m) => m.role === "VIEWER").length;

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#dfba82] tracking-wider uppercase mb-1">
                  <Zap className="w-3 h-3 text-[#dfba82]" />
                  <span>ORGANIZATION & ACCESS</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">MEMBERS</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Team & Workspace Access
                  </h1>
                  <div className="w-5 h-5 rounded-md border border-[#dfba82]/40 bg-[#dfba82]/10 flex items-center justify-center text-[#dfba82]">
                    <Users className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Manage organization roles, team permissions, and workspace access invitations.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchMembers}
                  className="p-2 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-[#8e93a6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer"
                  title="Refresh members"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#dfba82]" : ""}`} />
                </button>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[#6b7082] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-44 sm:w-56 pl-8 pr-3 py-1.5 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]/50"
                  />
                </div>

                <RbacGuard permission="members:manage">
                  <button
                    onClick={() => setIsInviteOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd4aa] text-black text-xs font-bold rounded-xl shadow-[0_2px_12px_rgba(223,186,130,0.25)] transition-all cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    <span>Invite Member</span>
                  </button>
                </RbacGuard>
              </div>
            </div>

            {/* 5 Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Total Members */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium flex items-center gap-1">
                      Total Members
                      <Info className="w-3 h-3 text-[#555a6d]" />
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{members.length}</div>
                  <div className="text-[10.5px] text-[#8e93a6]">Workspace collaborators</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 45 28, 65 32 C 80 34, 88 12, 100 6"
                      fill="none"
                      stroke="#dfba82"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 2: Owners */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-amber-950/40 border border-amber-800/30 flex items-center justify-center text-[#dfba82]">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Owners</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{ownersCount}</div>
                  <div className="text-[10.5px] text-[#dfba82] font-medium">Full governance</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 36 C 25 35, 50 38, 70 20 C 85 10, 92 16, 100 8"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 3: Admins */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Administrators</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{adminsCount}</div>
                  <div className="text-[10.5px] text-blue-400 font-medium">Policy management</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 34 C 20 30, 40 18, 60 26 C 75 30, 85 12, 100 6"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 4: Developers */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Developers</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{devCount}</div>
                  <div className="text-[10.5px] text-purple-400 font-medium">Gateway & SDK access</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 35 C 20 38, 40 32, 60 22 C 75 14, 85 18, 100 8"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 5: Viewers */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Viewers</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{viewerCount}</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Read-only observability</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 32 C 25 30, 45 22, 65 24 C 80 26, 88 12, 100 6"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Members Table */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] overflow-hidden shadow-xl">
              <div className="p-4 border-b border-[#161824] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Team Directory</h2>
                  <span className="text-[11px] text-[#6b7082]">({filteredMembers.length} listed)</span>
                </div>

                {/* Role Filter Tabs */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#141624] border border-[#23273a] text-xs">
                  {["ALL", "OWNER", "ADMIN", "DEVELOPER", "VIEWER"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                        selectedRole === role
                          ? "bg-[#dfba82] text-black font-bold shadow-[0_0_10px_rgba(223,186,130,0.25)]"
                          : "text-[#8e93a6] hover:text-white"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-[#6b7082] space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
                  <div>Loading workspace members...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#161824] text-[10.5px] uppercase tracking-wider text-[#555a6d] font-semibold">
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4 text-right">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141724]">
                      {filteredMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#161828] border border-[#262a3e] flex items-center justify-center text-xs font-bold text-[#dfba82] uppercase">
                                {m.name.charAt(0)}
                              </div>
                              <span className="font-bold text-white text-xs">{m.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#c5c9d6] text-[11.5px]">{m.email}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                                m.role === "OWNER"
                                  ? "bg-amber-950/50 text-[#dfba82] border border-amber-800/40"
                                  : m.role === "ADMIN"
                                  ? "bg-blue-950/50 text-blue-300 border border-blue-800/40"
                                  : m.role === "DEVELOPER"
                                  ? "bg-purple-950/50 text-purple-300 border border-purple-800/40"
                                  : "bg-zinc-900 text-zinc-300 border border-zinc-700/40"
                              }`}
                            >
                              {m.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {m.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#8e93a6] font-mono text-[11px]">{m.joinedAt}</td>
                          <td className="py-3.5 px-4 text-right text-[#8e93a6] font-mono text-[11px]">
                            {m.lastActive}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom RBAC Banner */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Fine-Grained RBAC Governance</div>
                  <div className="text-[11.5px] text-[#8e93a6]">
                    Roles strictly enforce least-privilege principles across budgets, API keys, and model deployments.
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfba82] hover:text-[#ebd4aa] transition-colors shrink-0"
              >
                <span>Workspace Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ContentTransition>
      </main>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1017] border border-[#232738] rounded-2xl p-6 shadow-2xl text-white relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c1f2e]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#dfba82]" />
                <h3 className="text-base font-bold text-[#f4efe6]">Invite Team Member</h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-[#787d91] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {inviteError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/40 text-red-300 text-xs">
                {inviteError}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                  Assigned Workspace Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["ADMIN", "DEVELOPER", "VIEWER"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole(r)}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                        inviteRole === r
                          ? "bg-[#dfba82]/15 border-[#dfba82] text-[#dfba82]"
                          : "bg-[#141622] border-[#232738] text-[#8e93a6]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1c1f2e]">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  disabled={inviting}
                  className="px-3.5 py-2 text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl hover:bg-[#ebd4aa] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Send Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

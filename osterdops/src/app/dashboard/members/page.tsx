"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RbacGuard } from "@/components/auth/RbacGuard";
import { can } from "@/lib/auth/client-permissions";
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

const INITIAL_MEMBERS: MemberItem[] = [
  {
    id: "mem_01",
    name: "Shaan Naveed",
    email: "shaan@osterdops.com",
    role: "OWNER",
    status: "ACTIVE",
    joinedAt: "2026-01-10",
    lastActive: "Just now",
  },
  {
    id: "mem_02",
    name: "Alex Thorne",
    email: "alex.t@osterdops.com",
    role: "ADMIN",
    status: "ACTIVE",
    joinedAt: "2026-02-14",
    lastActive: "12m ago",
  },
  {
    id: "mem_03",
    name: "Elena Rostova",
    email: "elena.r@osterdops.com",
    role: "DEVELOPER",
    status: "ACTIVE",
    joinedAt: "2026-03-01",
    lastActive: "1h ago",
  },
  {
    id: "mem_04",
    name: "Marcus Vance",
    email: "marcus.v@osterdops.com",
    role: "DEVELOPER",
    status: "ACTIVE",
    joinedAt: "2026-04-18",
    lastActive: "3d ago",
  },
  {
    id: "mem_05",
    name: "Sarah Chen",
    email: "sarah.c@partner.io",
    role: "VIEWER",
    status: "INVITED",
    joinedAt: "2026-08-28",
    lastActive: "Pending",
  },
];

export default function MembersPage() {
  const { currentMembership, currentOrg } = useAuth();
  const [members, setMembers] = useState<MemberItem[]>(INITIAL_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrganizationRole>("DEVELOPER");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const callerRole: OrganizationRole = currentMembership?.role || "OWNER";
  const canManage = can("members:manage", callerRole);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "ALL" || m.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: MemberItem = {
      id: `mem_${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: "INVITED",
      joinedAt: new Date().toISOString().split("T")[0],
      lastActive: "Pending",
    };

    setMembers([newMember, ...members]);
    setInviteEmail("");
    setIsInviteOpen(false);
  };

  const handleRoleChange = (memberId: string, newRole: OrganizationRole) => {
    setMembers(
      members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    setActiveMenuId(null);
  };

  const handleRemove = (memberId: string) => {
    setMembers(members.filter((m) => m.id !== memberId));
    setActiveMenuId(null);
  };

  const getRoleBadge = (role: OrganizationRole) => {
    switch (role) {
      case "OWNER":
        return "bg-[#dfba82]/10 border-[#dfba82]/40 text-[#dfba82]";
      case "ADMIN":
        return "bg-purple-500/10 border-purple-500/30 text-purple-400";
      case "DEVELOPER":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "VIEWER":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      default:
        return "bg-gray-500/10 border-gray-500/30 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <ContentTransition>
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#dfba82] tracking-wider uppercase mb-1">
                  <Users className="w-3.5 h-3.5" />
                  Organization Team
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4efe6] font-serif">
                  Members & Access Control
                </h1>
                <p className="text-xs text-[#8e93a6] mt-1">
                  Manage member roles, RBAC permissions, and access privileges for {currentOrg?.name || "the organization"}.
                </p>
              </div>

              <RbacGuard permission="members:manage">
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba82] to-[#c79d60] text-black font-semibold text-xs shadow-[0_0_20px_rgba(223,186,130,0.2)] hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Member
                </button>
              </RbacGuard>
            </div>

            {/* Role Hierarchy Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { role: "OWNER", desc: "Full root authority & billing ownership", count: members.filter(m => m.role === "OWNER").length },
                { role: "ADMIN", desc: "Manage members, budgets & keys", count: members.filter(m => m.role === "ADMIN").length },
                { role: "DEVELOPER", desc: "Issue API keys & run gateway completions", count: members.filter(m => m.role === "DEVELOPER").length },
                { role: "VIEWER", desc: "Read-only access to analytics & logs", count: members.filter(m => m.role === "VIEWER").length },
              ].map((card) => (
                <div key={card.role} className="p-4 rounded-xl bg-[#0c0e17] border border-[#1d2030] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border uppercase ${getRoleBadge(card.role as OrganizationRole)}`}>
                      {card.role}
                    </span>
                    <span className="text-lg font-bold font-mono text-white">{card.count}</span>
                  </div>
                  <p className="text-[11px] text-[#71768a]">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#0c0e17] border border-[#1b1e2c]">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#71768a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141724] border border-[#24283b] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#5d6278] focus:outline-none focus:border-[#dfba82]/50"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-[#71768a]">Role:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-[#141724] border border-[#24283b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]/50 cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="OWNER">Owner</option>
                  <option value="ADMIN">Admin</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
            </div>

            {/* Members Table */}
            <div className="rounded-xl bg-[#0c0e17] border border-[#1d2030] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#10121d] text-[#8e93a6] border-b border-[#1d2030] uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">User</th>
                      <th className="py-3.5 px-4 font-semibold">Role</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Joined</th>
                      <th className="py-3.5 px-4 font-semibold">Last Active</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a27]">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-[#71768a]">
                          No members matching &quot;{searchQuery}&quot;
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-[#121422] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#181b2a] border border-[#262a3f] flex items-center justify-center font-bold text-xs text-[#dfba82]">
                                {member.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{member.name}</div>
                                <div className="text-[11px] text-[#71768a] font-mono">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${getRoleBadge(member.role)}`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {member.status === "ACTIVE" ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-amber-400 text-[11px]">
                                <Clock className="w-3.5 h-3.5" />
                                Invited
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[#8e93a6] font-mono">{member.joinedAt}</td>
                          <td className="py-3.5 px-4 text-[#8e93a6]">{member.lastActive}</td>
                          <td className="py-3.5 px-4 text-right relative">
                            {canManage && member.role !== "OWNER" ? (
                              <div>
                                <button
                                  onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                                  className="p-1 text-[#71768a] hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {activeMenuId === member.id && (
                                  <div className="absolute right-4 top-10 w-44 bg-[#141724] border border-[#252a3f] rounded-xl shadow-xl z-20 py-1 text-left text-xs">
                                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[#71768a] border-b border-[#202436]">
                                      Change Role
                                    </div>
                                    {(["ADMIN", "DEVELOPER", "VIEWER"] as OrganizationRole[]).map((r) => (
                                      <button
                                        key={r}
                                        onClick={() => handleRoleChange(member.id, r)}
                                        className={`w-full px-3 py-2 text-left hover:bg-[#1d2133] transition-colors flex items-center justify-between ${
                                          member.role === r ? "text-[#dfba82] font-semibold" : "text-[#c0c5d8]"
                                        }`}
                                      >
                                        {r}
                                        {member.role === r && <CheckCircle2 className="w-3.5 h-3.5" />}
                                      </button>
                                    ))}
                                    <div className="border-t border-[#202436] my-1" />
                                    <button
                                      onClick={() => handleRemove(member.id)}
                                      className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Remove Member
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#555a6d] text-[11px] font-mono">Protected</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ContentTransition>
      </main>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c0e17] border border-[#23273a] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1f30]">
              <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#dfba82]" />
                Invite Team Member
              </h2>
              <button onClick={() => setIsInviteOpen(false)} className="text-[#71768a] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3 py-2 text-xs text-white placeholder-[#5d6278] focus:outline-none focus:border-[#dfba82]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as OrganizationRole)}
                  className="w-full bg-[#141724] border border-[#24283b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]/50"
                >
                  <option value="ADMIN">ADMIN — Manage members, budgets, keys</option>
                  <option value="DEVELOPER">DEVELOPER — Issue keys, invoke gateway</option>
                  <option value="VIEWER">VIEWER — Read-only telemetry</option>
                </select>
              </div>

              <div className="p-3 bg-[#121524] rounded-xl border border-[#1f2338] text-[11px] text-[#8e93a6] space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#dfba82]" />
                  Least Privilege Assurance
                </div>
                <p>An invitation link with single-use verification token will be dispatched. Members inherit only the explicit role permissions assigned.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#8e93a6] hover:text-white hover:bg-white/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#dfba82] text-black font-semibold text-xs hover:opacity-95"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

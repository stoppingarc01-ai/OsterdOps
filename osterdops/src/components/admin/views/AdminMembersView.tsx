"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Shield,
  X,
  AlertTriangle,
  Mail,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";
  status: "ACTIVE" | "INVITED";
  lastActive: string;
  joinedDate: string;
}

const ROLE_DESCRIPTIONS: Record<string, { label: string; desc: string; color: string }> = {
  OWNER: {
    label: "Organization Owner",
    desc: "Full unrestricted administrative access to organization, billing, and all member roles.",
    color: "bg-amber-950/60 text-amber-300 border-amber-800/40",
  },
  ADMIN: {
    label: "Administrator",
    desc: "Manage projects, members, API keys, budgets, and security policies.",
    color: "bg-purple-950/60 text-purple-300 border-purple-800/40",
  },
  DEVELOPER: {
    label: "Developer",
    desc: "Access playground, view request logs, generate development API keys, and test endpoints.",
    color: "bg-blue-950/60 text-blue-300 border-blue-800/40",
  },
  VIEWER: {
    label: "Viewer / Read-Only",
    desc: "Read-only access to usage, analytics, and non-sensitive dashboards.",
    color: "bg-zinc-800 text-zinc-300 border-zinc-700",
  },
};

export function AdminMembersView() {
  const { currentOrg, user, getIdToken } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "DEVELOPER" | "VIEWER">("DEVELOPER");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMembers() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/members`, {
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Member[] = res.data.map((m: any) => ({
            id: m.userId || m.id,
            name: m.name || m.displayName || "Teammate",
            email: m.email || "member@workspace.com",
            role: (m.role?.toUpperCase() || "DEVELOPER") as any,
            status: m.status === "pending" ? "INVITED" : "ACTIVE",
            lastActive: m.lastActive ? new Date(m.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Active",
            joinedDate: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent",
          }));
          setMembers(mapped);
        } else if (user) {
          setMembers([
            {
              id: user.uid,
              name: user.displayName || "Workspace Owner",
              email: user.email || "",
              role: "OWNER",
              status: "ACTIVE",
              lastActive: "Just now",
              joinedDate: "Owner",
            },
          ]);
        } else {
          setMembers([]);
        }
      } catch (err) {
        if (isMounted) {
          if (user) {
            setMembers([
              {
                id: user.uid,
                name: user.displayName || "Workspace Owner",
                email: user.email || "",
                role: "OWNER",
                status: "ACTIVE",
                lastActive: "Just now",
                joinedDate: "Owner",
              },
            ]);
          } else {
            setMembers([]);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, user, getIdToken]);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMem: Member = {
      id: `usr_${Date.now()}`,
      name: inviteName || inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "INVITED",
      lastActive: "Pending invitation",
      joinedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setMembers([newMem, ...members]);
    setInviteEmail("");
    setInviteName("");
    setIsInviteModalOpen(false);
  };

  const handleRoleChange = (memberId: string, newRole: Member["role"]) => {
    setMembers(
      members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    setEditingMember(null);
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter((m) => m.id !== memberId));
    setMemberToRemove(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0c0f16] border border-[#171b26] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0c0f16] border border-[#171b26] rounded-xl px-3 py-2 text-xs text-[#8e93a6] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="DEVELOPER">Developer</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Members Table */}
      <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Loading organization members...</div>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07080c] border-b border-[#171b26] text-[#717688] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Role &amp; Permissions</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Activity</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171b26] text-white">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                      No organization members found
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white">{member.name}</div>
                        <div className="text-[#8e93a6] font-mono text-[11px]">{member.email}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                            ROLE_DESCRIPTIONS[member.role]?.color || "bg-zinc-800 text-zinc-300 border-zinc-700"
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {member.status === "ACTIVE" ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Invited
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-[#8e93a6]">{member.lastActive}</td>
                      <td className="p-4 text-right">
                        {member.role !== "OWNER" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingMember(member)}
                              className="p-1.5 hover:bg-[#1b202e] rounded-lg text-[#8e93a6] hover:text-[#dfba82] transition-colors cursor-pointer"
                              title="Change Role"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setMemberToRemove(member)}
                              className="p-1.5 hover:bg-[#1b202e] rounded-lg text-[#8e93a6] hover:text-rose-400 transition-colors cursor-pointer"
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#717688] font-mono">Owner</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal 1: Invite Member */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#171b26]">
              <h3 className="text-base font-bold text-white">Invite New Teammate</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-[#717688] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. teammate@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Role Assignment
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "ADMIN" | "DEVELOPER" | "VIEWER")
                  }
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="DEVELOPER">Developer (Playground & API Keys)</option>
                  <option value="ADMIN">Administrator (Projects, Budgets, Policies)</option>
                  <option value="VIEWER">Viewer (Read-Only Analytics)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#171b26]">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8e93a6] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] text-black font-semibold text-xs rounded-xl hover:bg-[#ebd2a9]"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Change Role */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#171b26]">
              <h3 className="text-base font-bold text-white">
                Modify Role for {editingMember.name}
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-[#717688] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {(["ADMIN", "DEVELOPER", "VIEWER"] as const).map((roleKey) => (
                <button
                  key={roleKey}
                  onClick={() => handleRoleChange(editingMember.id, roleKey)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    editingMember.role === roleKey
                      ? "border-[#dfba82] bg-[#dfba82]/10"
                      : "border-[#171b26] bg-[#111422] hover:border-[#dfba82]/40"
                  }`}
                >
                  <div className="font-bold text-xs text-white">
                    {ROLE_DESCRIPTIONS[roleKey].label}
                  </div>
                  <div className="text-[11px] text-[#8e93a6] mt-0.5 leading-relaxed">
                    {ROLE_DESCRIPTIONS[roleKey].desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Remove Member Confirmation */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Remove Member</h3>
            </div>

            <p className="text-xs text-[#8e93a6] leading-relaxed">
              Are you sure you want to revoke workspace access for{" "}
              <strong className="text-white">{memberToRemove.name}</strong> ({memberToRemove.email})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="px-3.5 py-2 text-xs text-[#8e93a6] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRemoveMember(memberToRemove.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl"
              >
                Remove Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

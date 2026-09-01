"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  CheckCircle2,
  Mail,
  Clock,
  X,
  Search,
  Lock,
  AlertTriangle,
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";
  status: "ACTIVE" | "INVITED";
  lastActive: string;
  joinedDate: string;
}

const INITIAL_MEMBERS: Member[] = [
  {
    id: "usr_01",
    name: "Sarah Jenkins",
    email: "sarah@acme.com",
    role: "OWNER",
    status: "ACTIVE",
    lastActive: "Just now",
    joinedDate: "Jan 12, 2025",
  },
  {
    id: "usr_02",
    name: "Alex Rivera",
    email: "alex@acme.com",
    role: "ADMIN",
    status: "ACTIVE",
    lastActive: "14 mins ago",
    joinedDate: "Jan 15, 2025",
  },
  {
    id: "usr_03",
    name: "David Kim",
    email: "david@acme.com",
    role: "DEVELOPER",
    status: "ACTIVE",
    lastActive: "2 hours ago",
    joinedDate: "Feb 01, 2025",
  },
  {
    id: "usr_04",
    name: "Elena Rostova",
    email: "elena@acme.com",
    role: "DEVELOPER",
    status: "ACTIVE",
    lastActive: "Yesterday",
    joinedDate: "Feb 10, 2025",
  },
  {
    id: "usr_05",
    name: "Marcus Vance",
    email: "marcus@acme.com",
    role: "VIEWER",
    status: "INVITED",
    lastActive: "Pending invitation",
    joinedDate: "May 10, 2025",
  },
];

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
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "DEVELOPER" | "VIEWER">("DEVELOPER");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

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

    const newMember: Member = {
      id: `usr_${Date.now()}`,
      name: inviteName || inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "INVITED",
      lastActive: "Pending invitation",
      joinedDate: "Just now",
    };

    setMembers([newMember, ...members]);
    setInviteEmail("");
    setInviteName("");
    setIsInviteModalOpen(false);
  };

  const handleUpdateRole = (newRole: "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER") => {
    if (!editingMember) return;
    setMembers(
      members.map((m) => (m.id === editingMember.id ? { ...m, role: newRole } : m))
    );
    setEditingMember(null);
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;
    setMembers(members.filter((m) => m.id !== memberToRemove.id));
    setMemberToRemove(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-[#0c0f16] border border-[#171b26] rounded-xl text-xs text-white placeholder:text-[#555a6d] focus:outline-none focus:border-[#dfba82] w-64"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0c0f16] border border-[#171b26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
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
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-[#8e93a6] font-mono text-[11px]">{member.email}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                        ROLE_DESCRIPTIONS[member.role].color
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
                          className="p-1.5 hover:bg-rose-950/40 rounded-lg text-[#8e93a6] hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#555a6d] italic">Protected Owner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#171b26] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#dfba82]" />
                Invite Team Member
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-[#717688] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="developer@acme.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "DEVELOPER" | "VIEWER")}
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                >
                  <option value="DEVELOPER">DEVELOPER — Build, integrate &amp; view logs</option>
                  <option value="ADMIN">ADMIN — Manage members, keys &amp; budgets</option>
                  <option value="VIEWER">VIEWER — Read-only analytics</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#07080c] border border-[#171b26] text-[11px] text-[#8e93a6]">
                An invitation email will be generated with secure single-use authentication.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold cursor-pointer shadow-md"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#171b26] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#dfba82]" />
                Change Role: {editingMember.name}
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-[#717688] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {(["ADMIN", "DEVELOPER", "VIEWER"] as const).map((roleKey) => (
                <div
                  key={roleKey}
                  onClick={() => handleUpdateRole(roleKey)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    editingMember.role === roleKey
                      ? "bg-[#dfba82]/10 border-[#dfba82] text-white"
                      : "bg-[#07080c] border-[#1b202e] hover:border-[#dfba82]/40 text-[#8e93a6]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{roleKey}</span>
                    {editingMember.role === roleKey && (
                      <CheckCircle2 className="w-4 h-4 text-[#dfba82]" />
                    )}
                  </div>
                  <div className="text-[11px] mt-1 text-[#8e93a6]">
                    {ROLE_DESCRIPTIONS[roleKey].desc}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f16] border border-rose-900/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-sm font-bold text-white">Revoke Member Access</h3>
            </div>
            <p className="text-xs text-[#8e93a6]">
              Are you sure you want to remove <strong className="text-white">{memberToRemove.name}</strong> ({memberToRemove.email}) from this organization? Their API tokens and workspace permissions will be immediately invalidated.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs cursor-pointer shadow-md"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

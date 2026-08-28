"use client";

import React, { useState } from "react";
import { Check, MoreHorizontal, Plus, ShieldCheck, UserCheck, Users, X } from "lucide-react";

interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "LEAD_ARCHITECT" | "FINANCE_ADMIN" | "SUPPORT_LEAD";
  access: string;
  status: "ACTIVE" | "INVITED";
  lastActive: string;
  twoFactorEnabled: boolean;
}

const INITIAL_ADMINS: AdminMember[] = [
  {
    id: "adm_1",
    name: "Admin Prasad",
    email: "admin@osterdops.com",
    role: "SUPERADMIN",
    access: "Full System & Gateway Override",
    status: "ACTIVE",
    lastActive: "Now",
    twoFactorEnabled: true,
  },
  {
    id: "adm_2",
    name: "Shaan Prasad",
    email: "shaan@osterdops.com",
    role: "LEAD_ARCHITECT",
    access: "Model Registry & Adapters",
    status: "ACTIVE",
    lastActive: "15 mins ago",
    twoFactorEnabled: true,
  },
  {
    id: "adm_3",
    name: "Elena Rostova",
    email: "elena@osterdops.com",
    role: "FINANCE_ADMIN",
    access: "Billing, Subscriptions & Invoicing",
    status: "ACTIVE",
    lastActive: "2 hours ago",
    twoFactorEnabled: true,
  },
  {
    id: "adm_4",
    name: "David Kim",
    email: "david@osterdops.com",
    role: "SUPPORT_LEAD",
    access: "Support Inbox & Customer Accounts",
    status: "ACTIVE",
    lastActive: "1 day ago",
    twoFactorEnabled: false,
  },
];

export function AdminUsersView() {
  const [admins, setAdmins] = useState<AdminMember[]>(INITIAL_ADMINS);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminMember["role"]>("SUPPORT_LEAD");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const newMember: AdminMember = {
      id: `adm_${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      access:
        inviteRole === "SUPERADMIN"
          ? "Full System & Gateway Override"
          : inviteRole === "FINANCE_ADMIN"
          ? "Billing & Subscriptions"
          : "Support Inbox & Accounts",
      status: "INVITED",
      lastActive: "Pending Accept",
      twoFactorEnabled: false,
    };

    setAdmins([...admins, newMember]);
    setIsInviteModalOpen(false);
    setInviteName("");
    setInviteEmail("");
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">Platform Administrators</h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            RBAC permissions, two-factor authentication enforcement, and access grants for internal staff.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12.5px] rounded-xl transition-all shadow-[0_2px_12px_rgba(223,186,130,0.25)] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Invite Administrator</span>
        </button>
      </div>

      <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="text-[10.5px] uppercase font-bold tracking-[0.1em] text-[#555a6d] border-b border-[#171b26] pb-3">
              <tr>
                <th className="pb-3">Admin</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Access Level</th>
                <th className="pb-3">2FA Security</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Active</th>
                <th className="pb-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151924] text-[#c5c8d4]">
              {admins.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="font-bold text-[#f4efe6]">{a.name}</div>
                    <div className="text-[11px] text-[#717688]">{a.email}</div>
                  </td>
                  <td className="py-4">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#dfba82]/10 text-[#dfba82] border border-[#dfba82]/25">
                      {a.role}
                    </span>
                  </td>
                  <td className="py-4 text-[#c5c8d4]">{a.access}</td>
                  <td className="py-4">
                    {a.twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#22c55e]">
                        <Check className="h-3.5 w-3.5" /> Enabled
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#f59e0b]">Pending Setup</span>
                    )}
                  </td>
                  <td className="py-4">
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        a.status === "ACTIVE"
                          ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30"
                          : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-4 text-[#717688] text-[11.5px]">{a.lastActive}</td>
                  <td className="py-4 text-right">
                    <button className="p-1 rounded text-[#555a6d] hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Administrator Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0c0f16] border border-[#232a3d] rounded-2xl shadow-2xl p-6 font-sans space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1c2232] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-[16px]">
                <ShieldCheck className="h-4 w-4 text-[#dfba82]" />
                <span>Invite Team Administrator</span>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 text-[#6c7285] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. jordan@osterdops.com"
                  className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1">
                  Administrative Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminMember["role"])}
                  className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
                >
                  <option value="SUPPORT_LEAD">SUPPORT_LEAD (Customer Tickets &amp; Accounts)</option>
                  <option value="FINANCE_ADMIN">FINANCE_ADMIN (Subscriptions &amp; Invoicing)</option>
                  <option value="LEAD_ARCHITECT">LEAD_ARCHITECT (Model Registry &amp; Sentinel)</option>
                  <option value="SUPERADMIN">SUPERADMIN (Full Platform Authority)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1c2232]">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-[12.5px] text-[#8e94a8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12.5px] rounded-xl transition-all shadow-md cursor-pointer"
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

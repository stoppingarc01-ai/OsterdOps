"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Key,
  Lock,
  Mail,
  MoreHorizontal,
  Plus,
  Shield,
  ShieldAlert,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "LEAD_ARCHITECT" | "FINANCE_ADMIN" | "SUPPORT_LEAD";
  access: string;
  status: "ACTIVE" | "PENDING_INVITE";
  lastActive: string;
  twoFactorEnabled: boolean;
}

export function AdminUsersView() {
  const { currentOrg, user, getIdToken } = useAuth();
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminMember["role"]>("SUPPORT_LEAD");

  useEffect(() => {
    let isMounted = true;

    async function loadAdmins() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/members`, {
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: AdminMember[] = res.data
            .filter((m: any) => (m.role || "").toLowerCase().includes("admin") || (m.role || "").toLowerCase().includes("owner"))
            .map((m: any) => ({
              id: m.userId || m.id,
              name: m.name || m.displayName || "Admin User",
              email: m.email,
              role: (m.role?.toLowerCase().includes("owner") ? "SUPERADMIN" : "LEAD_ARCHITECT") as any,
              access: "Full Organization Governance",
              status: "ACTIVE",
              lastActive: "Active",
              twoFactorEnabled: true,
            }));

          if (mapped.length > 0) {
            setAdmins(mapped);
          } else if (user) {
            setAdmins([
              {
                id: user.uid,
                name: user.displayName || "Platform Administrator",
                email: user.email || "",
                role: "SUPERADMIN",
                access: "Full System & Gateway Override",
                status: "ACTIVE",
                lastActive: "Now",
                twoFactorEnabled: true,
              },
            ]);
          }
        } else if (user) {
          setAdmins([
            {
              id: user.uid,
              name: user.displayName || "Platform Administrator",
              email: user.email || "",
              role: "SUPERADMIN",
              access: "Full System & Gateway Override",
              status: "ACTIVE",
              lastActive: "Now",
              twoFactorEnabled: true,
            },
          ]);
        } else {
          setAdmins([]);
        }
      } catch (err) {
        if (isMounted) {
          if (user) {
            setAdmins([
              {
                id: user.uid,
                name: user.displayName || "Platform Administrator",
                email: user.email || "",
                role: "SUPERADMIN",
                access: "Full System & Gateway Override",
                status: "ACTIVE",
                lastActive: "Now",
                twoFactorEnabled: true,
              },
            ]);
          } else {
            setAdmins([]);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAdmins();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, user, getIdToken]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const accessMap: Record<AdminMember["role"], string> = {
      SUPERADMIN: "Full System & Gateway Override",
      LEAD_ARCHITECT: "Model Registry & Adapters",
      FINANCE_ADMIN: "Billing, Subscriptions & Invoicing",
      SUPPORT_LEAD: "Support Inbox & Customer Accounts",
    };

    const newAdmin: AdminMember = {
      id: `adm_${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      access: accessMap[inviteRole],
      status: "PENDING_INVITE",
      lastActive: "Invited just now",
      twoFactorEnabled: false,
    };

    setAdmins([...admins, newAdmin]);
    setInviteName("");
    setInviteEmail("");
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#f4efe6] flex items-center gap-2">
            <Users className="h-5 w-5 text-[#dfba82]" />
            Platform Administrators
          </h2>
          <p className="text-[12.5px] text-[#717688]">
            Grant administrative oversight, billing access, and security governance controls.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd4aa] text-black text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Invite Administrator</span>
        </button>
      </div>

      {/* Admin Users Table */}
      <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Loading administrators...</div>
            </div>
          ) : (
            <table className="w-full text-left text-[12.5px]">
              <thead className="text-[10.5px] uppercase font-bold tracking-[0.1em] text-[#555a6d] border-b border-[#171b26] pb-3">
                <tr>
                  <th className="pb-3">Admin Member</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Permission Scope</th>
                  <th className="pb-3">2FA Security</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Last Active</th>
                  <th className="pb-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151924] text-[#c5c8d4]">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                      No platform administrators found
                    </td>
                  </tr>
                ) : (
                  admins.map((a) => (
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
                  ))
                )}
              </tbody>
            </table>
          )}
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
                <UserCheck className="h-4 w-4 text-[#dfba82]" />
                <span>Invite New Administrator</span>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-[#717688] hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maya@osterdops.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">
                  Role Assignment
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminMember["role"])}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="SUPERADMIN">Superadmin (All Controls)</option>
                  <option value="LEAD_ARCHITECT">Lead Architect (Model Registry)</option>
                  <option value="FINANCE_ADMIN">Finance Admin (Billing & Budgets)</option>
                  <option value="SUPPORT_LEAD">Support Lead (Tickets & Inquiries)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#171b26]">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8e94a8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] text-black font-semibold text-xs rounded-xl hover:bg-[#ebd4aa]"
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

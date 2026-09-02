"use client";

import React, { useEffect, useState } from "react";
import { Search, ChevronDown, Plus, MoreVertical, Key, ChevronLeft, ChevronRight, Shield, Loader2, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface Member {
  id: string;
  name: string;
  email: string;
  initials: string;
  team: string;
  role: string;
  roleBadgeColor: string;
  spend: string;
  tokens: string;
  keys: string;
  status: "Active" | "Pending";
}

interface TeamsTableCardProps {
  onOpenInvite: () => void;
}

export function TeamsTableCard({ onOpenInvite }: TeamsTableCardProps) {
  const { currentOrg, user, getIdToken } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  useEffect(() => {
    let isMounted = true;

    async function loadMembers() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/members`, { token });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Member[] = res.data.map((m: any, idx: number) => {
            const role = m.role ? m.role.toUpperCase() : "DEVELOPER";
            const name = m.name || m.displayName || m.email?.split("@")[0] || `Member ${idx + 1}`;
            const initials = name.slice(0, 2).toUpperCase();

            let color = "bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30";
            if (role.includes("OWNER") || role.includes("ADMIN")) {
              color = "bg-[#dfba82]/15 text-[#dfba82] border-[#dfba82]/30";
            }

            return {
              id: m.userId || m.id || `mem_${idx}`,
              name,
              email: m.email || "",
              initials,
              team: m.team || "Core Engineering",
              role,
              roleBadgeColor: color,
              spend: "$0.00",
              tokens: "0",
              keys: "1 Key",
              status: m.status === "pending" ? "Pending" : "Active",
            };
          });
          setMembers(mapped);
        } else if (user) {
          setMembers([
            {
              id: user.uid,
              name: user.displayName || user.email?.split("@")[0] || "Workspace Owner",
              email: user.email || "",
              initials: (user.displayName || user.email || "WO").slice(0, 2).toUpperCase(),
              team: "Core Engineering",
              role: "OWNER",
              roleBadgeColor: "bg-[#dfba82]/15 text-[#dfba82] border-[#dfba82]/30",
              spend: "$0.00",
              tokens: "0",
              keys: "1 Key",
              status: "Active",
            },
          ]);
        } else {
          setMembers([]);
        }
      } catch (err) {
        if (isMounted) setMembers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, user, getIdToken]);

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = teamFilter === "All Teams" || m.team === teamFilter;
    const matchesRole = roleFilter === "All Roles" || m.role === roleFilter;
    return matchesSearch && matchesTeam && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#787d91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members or teams..."
              className="w-full bg-[#0d0f18] border border-[#1d202e] focus:border-[#dfba82] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#52576b] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Invite Member Primary CTA */}
        <button
          type="button"
          onClick={onOpenInvite}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Invite Teammate</span>
        </button>
      </div>

      {/* Table Container Card */}
      <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#f4efe6]">
            Workspace Team Members ({filtered.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
              <div>Loading team members...</div>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#171a27] text-[#6e7387] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-medium">Developer</th>
                  <th className="pb-3 font-medium">Team</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium text-right">Spend</th>
                  <th className="pb-3 font-medium text-right">Keys</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151826]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                      No team members found
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#141724] border border-[#23273c] text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                            {item.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-white tracking-tight">
                              {item.name}
                            </div>
                            <div className="text-[10.5px] text-[#73788c] font-mono">
                              {item.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#141724] border border-[#1f2335] text-[#c5c9d6] font-medium text-[11px]">
                          {item.team}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border ${item.roleBadgeColor}`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right font-mono font-bold text-white">
                        {item.spend}
                      </td>
                      <td className="py-3.5 pr-4 text-right font-mono text-[#c5c9d6]">
                        <div className="inline-flex items-center gap-1">
                          <Key className="w-3 h-3 text-[#dfba82]" />
                          <span>{item.keys}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            item.status === "Active" ? "text-[#4ade80]" : "text-[#f59e0b]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "Active" ? "bg-[#4ade80]" : "bg-[#f59e0b]"
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#171a27] text-xs text-[#73788c]">
          <div>Showing {filtered.length} team members</div>
        </div>
      </div>
    </div>
  );
}

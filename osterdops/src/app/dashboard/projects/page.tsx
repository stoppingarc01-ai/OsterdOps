"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  FolderKanban,
  Plus,
  ArrowUpRight,
  KeyRound,
  Activity,
  BadgeDollarSign,
  Zap,
  RefreshCw,
  Search,
  Sparkles,
  Info,
  Layers,
  ShieldCheck,
  Globe,
  X,
  Loader2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";
import { RbacGuard } from "@/components/auth/RbacGuard";

interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  environment?: string;
  status: "ACTIVE" | "ARCHIVED";
  spend30d: string;
  requests30d: string;
  activeKeys: number;
  description?: string;
}

export default function ProjectsPage() {
  const { currentOrg, getIdToken } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal Form State
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectSpendLimit, setNewProjectSpendLimit] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await apiRequest<any[]>("/api/v1/projects", {
        token,
      });

      if (res.data && Array.isArray(res.data)) {
        const mapped: ProjectItem[] = res.data.map((p: any) => ({
          id: p.id,
          name: p.name || "Untitled Project",
          slug: p.slug || p.id,
          environment: p.environment || "production",
          status: p.status || "ACTIVE",
          spend30d: p.spend30d ? `$${p.spend30d}` : "$0.00",
          requests30d: p.requests30d ? Number(p.requests30d).toLocaleString() : "0",
          activeKeys: p.activeKeys || (p.apiKeyCount ?? 1),
          description: p.description,
        }));
        setProjects(mapped);
      } else {
        setProjects([]);
      }
    } catch (e) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);

    try {
      const token = await getIdToken();
      const res = await apiRequest<any>("/api/v1/projects", {
        method: "POST",
        token,
        body: JSON.stringify({
          organizationId: currentOrg?.id,
          name: newProjectName.trim(),
          slug: newProjectSlug.trim() || undefined,
          description: newProjectDesc.trim() || undefined,
          spendLimitMonthly: newProjectSpendLimit ? parseFloat(newProjectSpendLimit) : undefined,
        }),
      });

      if (res.error) {
        throw new Error(res.error || "Failed to create project workspace.");
      }

      setIsCreateOpen(false);
      setNewProjectName("");
      setNewProjectSlug("");
      setNewProjectDesc("");
      setNewProjectSpendLimit("");
      await fetchProjects();
    } catch (err: any) {
      setCreateError(err.message || "An unexpected error occurred.");
    } finally {
      setCreating(false);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const totalProjects = projects.length;
  const totalActiveKeys = projects.reduce((acc, p) => acc + (p.activeKeys || 0), 0);

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
                  <span>WORKSPACE & ISOLATION</span>
                  <span className="text-[#555a6d]">/</span>
                  <span className="text-[#c5c9d6]">PROJECTS</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4efe6]"
                    style={{ fontFamily: "var(--font-serif-luxury), Georgia, serif" }}
                  >
                    Projects & Applications
                  </h1>
                  <div className="w-5 h-5 rounded-md border border-[#dfba82]/40 bg-[#dfba82]/10 flex items-center justify-center text-[#dfba82]">
                    <FolderKanban className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-xs text-[#8e93a6] mt-0.5">
                  Granular multi-tenant workspaces, spend caps, and scoped API key boundaries.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchProjects}
                  className="p-2 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-[#8e93a6] hover:text-white hover:border-[#2a2f45] transition-all cursor-pointer"
                  title="Refresh projects"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#dfba82]" : ""}`} />
                </button>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[#6b7082] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-44 sm:w-56 pl-8 pr-3 py-1.5 rounded-xl bg-[#0c0e16] border border-[#1b1e2c] text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]/50"
                  />
                </div>

                <RbacGuard permission="projects:manage">
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd4aa] text-black text-xs font-bold rounded-xl shadow-[0_2px_12px_rgba(223,186,130,0.25)] transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Project</span>
                  </button>
                </RbacGuard>
              </div>
            </div>

            {/* 5 Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Active Projects */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#dfba82]/10 border border-[#dfba82]/20 flex items-center justify-center text-[#dfba82]">
                      <FolderKanban className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium flex items-center gap-1">
                      Active Projects
                      <Info className="w-3 h-3 text-[#555a6d]" />
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{totalProjects}</div>
                  <div className="text-[10.5px] text-[#8e93a6]">Isolated namespaces</div>
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

              {/* Card 2: Scoped API Keys */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Scoped API Keys</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">{totalActiveKeys}</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Fine-grained permissions</div>
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

              {/* Card 3: Multi-Tenant Boundary */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Tenant Boundary</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">Strict</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Zero cross-project leakage</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 36 C 25 35, 50 38, 70 20 C 85 10, 92 16, 100 8"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 4: Gateway Telemetry */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Gateway Ingestion</span>
                  </div>
                  <div className="text-xl font-bold text-white pt-0.5">Enabled</div>
                  <div className="text-[10.5px] text-purple-400 font-medium">Live telemetry routing</div>
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

              {/* Card 5: Attributed Spend */}
              <div className="p-3.5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] flex items-center justify-between relative overflow-hidden group hover:border-[#2a2f45] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-orange-950/40 border border-orange-800/30 flex items-center justify-center text-orange-400">
                      <BadgeDollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11.5px] text-[#8e93a6] font-medium">Spend Tracking</span>
                  </div>
                  <div className="text-xl font-bold text-[#dfba82] pt-0.5">100%</div>
                  <div className="text-[10.5px] text-emerald-400 font-medium">Attributed to projects</div>
                </div>
                <div className="w-20 h-10 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 32 C 25 30, 45 22, 65 24 C 80 26, 88 12, 100 6"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="p-12 text-center text-xs text-[#6b7082] space-y-2 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
                <div>Loading workspace projects...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center space-y-3 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b]">
                <div className="w-10 h-10 rounded-xl bg-[#dfba82]/10 border border-[#dfba82]/20 text-[#dfba82] flex items-center justify-center mx-auto">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white">No Projects Found</div>
                <p className="text-xs text-[#8e93a6] max-w-sm mx-auto">
                  Get started by creating a project workspace to scope API keys, budgets, and AI traffic.
                </p>
                <RbacGuard permission="projects:manage">
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl text-xs hover:bg-[#ebd4aa] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create First Project</span>
                  </button>
                </RbacGuard>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-2xl bg-[#0c0e16] border border-[#1a1d2b] hover:border-[#dfba82]/40 transition-all space-y-4 group shadow-xl relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-sm text-white group-hover:text-[#dfba82] transition-colors">
                          {proj.name}
                        </h3>
                        <div className="text-[11px] font-mono text-[#73788c]">{proj.slug}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#141624] text-[#c5c9d6] border border-[#23273a]">
                        {proj.environment}
                      </span>
                    </div>

                    {proj.description && (
                      <p className="text-xs text-[#8e93a6] line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#161824] text-xs">
                      <div>
                        <div className="text-[10px] text-[#6b7082] uppercase">30D Spend</div>
                        <div className="font-bold text-[#dfba82] font-mono mt-0.5">{proj.spend30d}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#6b7082] uppercase">Requests</div>
                        <div className="font-mono text-white font-medium mt-0.5">{proj.requests30d}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#6b7082] uppercase">API Keys</div>
                        <div className="font-mono text-emerald-400 font-semibold mt-0.5">
                          {proj.activeKeys} Active
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Insight Banner */}
            <div className="rounded-2xl border border-[#1a1d2b] bg-[#0c0e16] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Project Isolation Architecture</div>
                  <div className="text-[11.5px] text-[#8e93a6]">
                    Each project workspace isolates API keys and spend attribution, ensuring clean chargebacks and zero cross-tenant interference.
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/api-keys"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfba82] hover:text-[#ebd4aa] transition-colors shrink-0"
              >
                <span>Manage API Keys</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ContentTransition>
      </main>

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1017] border border-[#232738] rounded-2xl p-6 shadow-2xl text-white relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c1f2e]">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#dfba82]" />
                <h3 className="text-base font-bold text-[#f4efe6]">Create Project Workspace</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[#787d91] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/40 text-red-300 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    if (!newProjectSlug) {
                      setNewProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  placeholder="e.g. Mobile App AI Backend"
                  className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                  Project Slug (Unique Identifier)
                </label>
                <input
                  type="text"
                  value={newProjectSlug}
                  onChange={(e) => setNewProjectSlug(e.target.value)}
                  placeholder="e.g. mobile-app-ai-backend"
                  className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82] font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Short summary of the application or workload..."
                  className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#c5c9d6]">
                  Monthly Spend Limit ($ USD, Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newProjectSpendLimit}
                  onChange={(e) => setNewProjectSpendLimit(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2 bg-[#141622] border border-[#232738] rounded-xl text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82] font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1c1f2e]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={creating}
                  className="px-3.5 py-2 text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[#dfba82] text-black font-bold rounded-xl hover:bg-[#ebd4aa] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

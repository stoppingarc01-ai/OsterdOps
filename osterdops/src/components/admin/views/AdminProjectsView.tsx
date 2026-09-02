"use client";

import React, { useEffect, useState } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Archive,
  Edit2,
  CheckCircle2,
  Users,
  Coins,
  X,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/client";

interface Project {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "ARCHIVED";
  spendUsd: number;
  spendLimitUsd: number;
  memberCount: number;
  keysCount: number;
  createdDate: string;
}

export function AdminProjectsView() {
  const { currentOrg, getIdToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [newProjectLimit, setNewProjectLimit] = useState(500);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      if (!currentOrg?.id) return;
      setLoading(true);

      try {
        const token = await getIdToken();
        const res = await apiRequest<any[]>("/api/v1/projects", {
          params: { organizationId: currentOrg.id },
          token,
        });

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data)) {
          const mapped: Project[] = res.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug || "workspace",
            status: p.status === "archived" ? "ARCHIVED" : "ACTIVE",
            spendUsd: p.currentMonthSpend ?? 0,
            spendLimitUsd: p.monthlySpendLimit ?? 500,
            memberCount: p.memberCount ?? 1,
            keysCount: p.keysCount ?? 0,
            createdDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
          }));
          setProjects(mapped);
        } else {
          setProjects([]);
        }
      } catch (err) {
        if (isMounted) setProjects([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id, getIdToken]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    const slug =
      newProjectSlug ||
      newProjectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: newProjectName,
      slug,
      status: "ACTIVE",
      spendUsd: 0,
      spendLimitUsd: newProjectLimit,
      memberCount: 1,
      keysCount: 0,
      createdDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setProjects([newProj, ...projects]);
    setNewProjectName("");
    setNewProjectSlug("");
    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setProjects(
      projects.map((p) => (p.id === editingProject.id ? editingProject : p))
    );
    setEditingProject(null);
  };

  const toggleArchive = (projectId: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            status: p.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE",
          };
        }
        return p;
      })
    );
    setProjectToArchive(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0c0f16] border border-[#171b26] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c0f16] border border-[#171b26] rounded-xl px-3 py-2 text-xs text-[#8e93a6] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Projects</option>
            <option value="ARCHIVED">Archived Projects</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid / Empty State */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#8e93a6] space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#dfba82]" />
          <div>Loading projects...</div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#73788c] bg-[#0c0f16] rounded-2xl border border-[#171b26] space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold text-white">No projects found</div>
          <p className="text-[11px] text-[#73788c] max-w-sm mx-auto">
            Create an isolated project workspace to manage API keys, team access, and spend ceilings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const spendPct = Math.min(100, Math.round((project.spendUsd / (project.spendLimitUsd || 1)) * 100));

            return (
              <div
                key={project.id}
                className={`bg-[#0c0f16] border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                  project.status === "ACTIVE"
                    ? "border-[#171b26] hover:border-[#dfba82]/40"
                    : "border-[#171b26]/50 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white font-serif">{project.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            project.status === "ACTIVE"
                              ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#717688] font-mono mt-0.5">{project.slug}</div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingProject(project)}
                        className="p-1.5 hover:bg-[#1b202e] rounded-lg text-[#8e93a6] hover:text-[#dfba82] transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setProjectToArchive(project)}
                        className="p-1.5 hover:bg-[#1b202e] rounded-lg text-[#8e93a6] hover:text-amber-400 transition-colors cursor-pointer"
                        title={project.status === "ACTIVE" ? "Archive Project" : "Unarchive Project"}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Spend Ceiling Progress */}
                  <div className="mt-4 p-3 rounded-xl bg-[#07080c] border border-[#171b26]">
                    <div className="flex items-center justify-between text-[11px] text-[#8e93a6]">
                      <span>Monthly Spend</span>
                      <span className="font-mono text-white">
                        ${project.spendUsd.toFixed(2)} / ${project.spendLimitUsd}
                      </span>
                    </div>
                    <div className="w-full bg-[#1b202e] h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full ${
                          spendPct > 90 ? "bg-rose-500" : spendPct > 70 ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                        style={{ width: `${spendPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#171b26] flex items-center justify-between text-[11px] text-[#8e93a6]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {project.memberCount} members
                    </span>
                    <span>{project.keysCount} keys</span>
                  </div>
                  <span>Created {project.createdDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Create Project */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#171b26]">
              <h3 className="text-base font-bold text-white">Create New Project</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#717688] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code Intelligence Assistant"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Project Slug (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. code-intelligence"
                  value={newProjectSlug}
                  onChange={(e) => setNewProjectSlug(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Monthly Spend Limit (USD)
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={newProjectLimit}
                  onChange={(e) => setNewProjectLimit(Number(e.target.value))}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#171b26]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8e93a6] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] text-black font-semibold text-xs rounded-xl hover:bg-[#ebd2a9]"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Project */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#171b26]">
              <h3 className="text-base font-bold text-white">Edit Project Settings</h3>
              <button
                onClick={() => setEditingProject(null)}
                className="text-[#717688] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, name: e.target.value })
                  }
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e93a6] mb-1">
                  Monthly Spend Limit (USD)
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={editingProject.spendLimitUsd}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      spendLimitUsd: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#171b26]">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-xs text-[#8e93a6] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] text-black font-semibold text-xs rounded-xl hover:bg-[#ebd2a9]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Archive Confirmation */}
      {projectToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {projectToArchive.status === "ACTIVE" ? "Archive Project" : "Unarchive Project"}
              </h3>
            </div>

            <p className="text-xs text-[#8e93a6] leading-relaxed">
              Are you sure you want to{" "}
              {projectToArchive.status === "ACTIVE" ? "archive" : "restore"}{" "}
              <strong className="text-white">{projectToArchive.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProjectToArchive(null)}
                className="px-3.5 py-2 text-xs text-[#8e93a6] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => toggleArchive(projectToArchive.id)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

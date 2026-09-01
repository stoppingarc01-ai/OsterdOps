"use client";

import React, { useState } from "react";
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
} from "lucide-react";

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

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj_prod_gw",
    name: "Production Gateway",
    slug: "production-gateway",
    status: "ACTIVE",
    spendUsd: 1140.5,
    spendLimitUsd: 1500,
    memberCount: 8,
    keysCount: 3,
    createdDate: "Jan 12, 2025",
  },
  {
    id: "proj_stg_llm",
    name: "Staging LLM Pipeline",
    slug: "staging-llm",
    status: "ACTIVE",
    spendUsd: 412.2,
    spendLimitUsd: 600,
    memberCount: 6,
    keysCount: 2,
    createdDate: "Jan 18, 2025",
  },
  {
    id: "proj_rag_pipeline",
    name: "RAG Knowledge Indexer",
    slug: "rag-pipeline",
    status: "ACTIVE",
    spendUsd: 289.5,
    spendLimitUsd: 400,
    memberCount: 4,
    keysCount: 1,
    createdDate: "Feb 02, 2025",
  },
  {
    id: "proj_legacy_v0",
    name: "Legacy Summarizer V0",
    slug: "legacy-summarizer",
    status: "ARCHIVED",
    spendUsd: 0.0,
    spendLimitUsd: 100,
    memberCount: 2,
    keysCount: 0,
    createdDate: "Dec 01, 2024",
  },
];

export function AdminProjectsView() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [newProjectLimit, setNewProjectLimit] = useState(500);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null);

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
      createdDate: "Just now",
    };

    setProjects([newProj, ...projects]);
    setNewProjectName("");
    setNewProjectSlug("");
    setIsCreateModalOpen(false);
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setProjects(
      projects.map((p) => (p.id === editingProject.id ? editingProject : p))
    );
    setEditingProject(null);
  };

  const handleArchiveConfirm = () => {
    if (!projectToArchive) return;
    setProjects(
      projects.map((p) =>
        p.id === projectToArchive.id
          ? { ...p, status: p.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE" }
          : p
      )
    );
    setProjectToArchive(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#717688] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-[#0c0f16] border border-[#171b26] rounded-xl text-xs text-white placeholder:text-[#555a6d] focus:outline-none focus:border-[#dfba82] w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c0f16] border border-[#171b26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba82]"
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const spendPct = Math.min(100, Math.round((project.spendUsd / project.spendLimitUsd) * 100));

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

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#171b26] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#dfba82]" />
                Create New Project
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#717688] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Real-Time Chat Assistant"
                  value={newProjectName}
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    if (!newProjectSlug) {
                      setNewProjectSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      );
                    }
                  }}
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Project Slug</label>
                <input
                  type="text"
                  value={newProjectSlug}
                  onChange={(e) => setNewProjectSlug(e.target.value)}
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Monthly Spend Cap ($USD)</label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={newProjectLimit}
                  onChange={(e) => setNewProjectLimit(Number(e.target.value))}
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold cursor-pointer shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f16] border border-[#171b26] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#171b26] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#dfba82]" />
                Edit Project
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="text-[#717688] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8e93a6] mb-1">Monthly Spend Cap ($USD)</label>
                <input
                  type="number"
                  value={editingProject.spendLimitUsd}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, spendLimitUsd: Number(e.target.value) })
                  }
                  className="w-full bg-[#07080c] border border-[#1b202e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#dfba82] hover:bg-[#ebd2a9] text-black font-semibold cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {projectToArchive && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f16] border border-amber-900/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-sm font-bold text-white">
                {projectToArchive.status === "ACTIVE" ? "Archive Project" : "Restore Project"}
              </h3>
            </div>
            <p className="text-xs text-[#8e93a6]">
              {projectToArchive.status === "ACTIVE"
                ? `Are you sure you want to archive "${projectToArchive.name}"? Active API calls using keys belonging to this project will be temporarily paused.`
                : `Restore "${projectToArchive.name}" to active status?`}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProjectToArchive(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveConfirm}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs cursor-pointer shadow-md"
              >
                Confirm {projectToArchive.status === "ACTIVE" ? "Archive" : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

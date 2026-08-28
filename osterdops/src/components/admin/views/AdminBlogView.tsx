"use client";

import React, { useState } from "react";
import { Edit3, Eye, MoreHorizontal, Plus, Sparkles, Trash2, X } from "lucide-react";

interface AdminBlogViewProps {
  onOpenCreateModal?: () => void;
}

interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  views: string;
  status: "PUBLISHED" | "DRAFT";
  date: string;
  content: string;
}

const INITIAL_POSTS: BlogPost[] = [
  {
    id: "post_1",
    title: "Cutting LLM Costs by 40% with Intelligent Routing",
    category: "FinOps & Engineering",
    author: "Admin Prasad",
    views: "14,280",
    status: "PUBLISHED",
    date: "May 12, 2025",
    content:
      "Enterprise AI architectures often experience runaway costs because all prompt workloads are unconditionally dispatched to top-tier reasoning models like Claude 3.5 Sonnet or OpenAI o1. By implementing an edge-level intelligent router with OsterdOps, workloads can be analyzed for intent complexity and mapped dynamically to high-efficiency small models like GPT-4o-mini or Gemini 2.0 Flash, cutting monthly compute bills by up to 40%.",
  },
  {
    id: "post_2",
    title: "Understanding Micro-Cent Token Pricing in Claude 3.5 & GPT-4o",
    category: "Cost Governance",
    author: "Shaan Prasad",
    views: "8,940",
    status: "PUBLISHED",
    date: "May 08, 2025",
    content:
      "Token pricing has evolved from integer cent values into 8-decimal micro-cent formulas, particularly with prompt caching discounts. This article walks through exact calculation formulas used by the OsterdOps pricing registry.",
  },
  {
    id: "post_3",
    title: "How to Configure Pre-Flight Hard Limits and Circuit Breakers",
    category: "Tutorials",
    author: "Admin Prasad",
    views: "3,110",
    status: "DRAFT",
    date: "May 01, 2025",
    content:
      "A complete guide on configuring organization budgets, project allowances, and automated 429 Too Many Requests circuit breakers to protect company runway.",
  },
];

export function AdminBlogView({ onOpenCreateModal }: AdminBlogViewProps) {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  const [tab, setTab] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this article?")) {
      setPosts(posts.filter((p) => p.id !== id));
      if (previewPost?.id === id) setPreviewPost(null);
    }
  };

  const filteredPosts = posts.filter((p) => tab === "ALL" || p.status === tab);

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">
            Blog &amp; Knowledge Base
          </h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            Manage technical articles, case studies, and FinOps thought leadership content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Filter */}
          <div className="flex items-center bg-[#0c0f16] border border-[#1b202e] p-1 rounded-xl">
            {(["ALL", "PUBLISHED", "DRAFT"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 text-[11.5px] font-bold rounded-lg transition-colors cursor-pointer ${
                  tab === t ? "bg-[#dfba82] text-[#07080c]" : "text-[#717688] hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12.5px] rounded-xl transition-all shadow-[0_2px_12px_rgba(223,186,130,0.25)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Blog Post</span>
          </button>
        </div>
      </div>

      <div className="bg-[#0c0f16] border border-[#1b202e] rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="text-[10.5px] uppercase font-bold tracking-[0.1em] text-[#555a6d] border-b border-[#171b26] pb-3">
              <tr>
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Author</th>
                <th className="pb-3">Views</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151924] text-[#c5c8d4]">
              {filteredPosts.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setPreviewPost(p)}
                  className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                >
                  <td className="py-4 font-bold text-[#f4efe6] group-hover:text-[#dfba82] transition-colors max-w-xs truncate">
                    {p.title}
                  </td>
                  <td className="py-4 text-[#8e94a8]">{p.category}</td>
                  <td className="py-4 text-white">{p.author}</td>
                  <td className="py-4 font-mono text-[#38bdf8]">{p.views}</td>
                  <td className="py-4">
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        p.status === "PUBLISHED"
                          ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30"
                          : "bg-[#717688]/10 text-[#717688] border-[#717688]/30"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 text-[#717688] text-[11.5px]">{p.date}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-[#717688]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewPost(p);
                        }}
                        className="p-1 hover:text-white"
                        title="Preview article"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id);
                        }}
                        className="p-1 hover:text-red-400"
                        title="Delete article"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article Live Preview Drawer */}
      {previewPost && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-lg bg-[#0c0f16] border-l border-[#1f2638] h-full p-6 flex flex-col justify-between overflow-y-auto font-sans shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#1c2232]">
                <span className="text-[11px] uppercase font-bold text-[#dfba82] bg-[#dfba82]/10 border border-[#dfba82]/20 px-2.5 py-1 rounded">
                  {previewPost.category}
                </span>
                <button
                  onClick={() => setPreviewPost(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-[#6c7285] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h3 className="text-[20px] font-bold text-white leading-snug">{previewPost.title}</h3>
                <div className="flex items-center gap-3 text-[12px] text-[#717688] mt-2">
                  <span>By {previewPost.author}</span>
                  <span>&bull;</span>
                  <span>{previewPost.date}</span>
                  <span>&bull;</span>
                  <span className="text-[#38bdf8]">{previewPost.views} views</span>
                </div>
              </div>

              <div className="p-4 bg-[#121622] rounded-2xl border border-[#1d2334] text-[13px] text-[#c5c8d4] leading-relaxed">
                {previewPost.content}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1c2232]">
              <button
                onClick={() => setPreviewPost(null)}
                className="w-full py-2.5 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] rounded-xl text-[12.5px] font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

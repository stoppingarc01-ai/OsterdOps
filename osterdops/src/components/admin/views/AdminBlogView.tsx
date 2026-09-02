"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Eye,
  FileEdit,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";

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

interface AdminBlogViewProps {
  onOpenCreateModal: () => void;
}

export function AdminBlogView({ onOpenCreateModal }: AdminBlogViewProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">
            Blog &amp; Knowledge Base
          </h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            Publish thought leadership articles, LLM cost engineering guides, and platform updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0c0f16] border border-[#1b202e] p-1 rounded-xl">
            {(["ALL", "PUBLISHED", "DRAFT"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 text-[11.5px] font-bold rounded-lg transition-colors cursor-pointer ${
                  tab === t
                    ? "bg-[#dfba82] text-[#07080c]"
                    : "text-[#717688] hover:text-white"
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
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#73788c] bg-[#090b12]">
                    No blog posts published or drafted yet
                  </td>
                </tr>
              ) : (
                filteredPosts.map((p) => (
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
                          className="p-1 hover:text-[#ef4444]"
                          title="Delete article"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article Detail Drawer */}
      {previewPost && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-lg bg-[#0c0f16] border-l border-[#1f2638] h-full p-6 flex flex-col justify-between overflow-y-auto font-sans shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#171b26]">
                <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#dfba82]">
                  {previewPost.category}
                </span>
                <button
                  onClick={() => setPreviewPost(null)}
                  className="p-1 text-[#717688] hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#f4efe6] leading-snug">
                  {previewPost.title}
                </h2>
                <div className="flex items-center gap-4 text-[11.5px] text-[#717688] mt-2">
                  <span>Author: {previewPost.author}</span>
                  <span>Published: {previewPost.date}</span>
                </div>
              </div>

              <div className="border-t border-[#171b26] pt-4">
                <p className="text-[13px] text-[#c5c8d4] leading-relaxed whitespace-pre-line">
                  {previewPost.content}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#171b26]">
              <button
                onClick={() => setPreviewPost(null)}
                className="w-full py-2.5 bg-[#141824] hover:bg-[#1c2233] text-white text-xs font-semibold rounded-xl"
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

"use client";

import React, { useState } from "react";
import { Check, Edit3, Image as ImageIcon, Sparkles, X } from "lucide-react";

interface AdminCreateBlogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: { title: string; category: string }) => void;
}

export function AdminCreateBlogPostModal({
  isOpen,
  onClose,
  onPostCreated,
}: AdminCreateBlogPostModalProps) {
  const [title, setTitle] = useState("Cutting LLM Costs by 40% with Intelligent Routing");
  const [category, setCategory] = useState("FinOps & Engineering");
  const [readTime, setReadTime] = useState("5 min read");
  const [content, setContent] = useState(
    "How modern engineering teams use OsterdOps to dynamically route fallback traffic and optimize prompt caching."
  );
  const [isPublished, setIsPublished] = useState(false);

  if (!isOpen) return null;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublished(true);
    setTimeout(() => {
      if (onPostCreated) {
        onPostCreated({ title, category });
      }
      setIsPublished(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0c0f16] border border-[#232a3d] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c2232]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 text-[#dfba82] flex items-center justify-center">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">Create New Blog Post</h2>
              <p className="text-[11.5px] text-[#717688]">Publish technical guides and product updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#6c7285] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handlePublish} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1.5">
              Post Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
              >
                <option value="FinOps & Engineering">FinOps &amp; Engineering</option>
                <option value="Product Updates">Product Updates</option>
                <option value="Case Studies">Case Studies</option>
                <option value="Security & Compliance">Security &amp; Compliance</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1.5">
                Estimated Read Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full bg-[#131722] border border-[#22283a] text-white text-[13px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#8e94a8] mb-1.5">
              Post Excerpt &amp; Content (Markdown)
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#131722] border border-[#22283a] text-white text-[12.5px] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#dfba82]"
            />
          </div>

          <div className="p-3.5 bg-[#090b11] border border-[#1d2334] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-[#717688]">
              <ImageIcon className="h-4 w-4 text-[#dfba82]" />
              <span>Cover image: <strong className="text-white">finops-routing-guide.png</strong></span>
            </div>
            <button
              type="button"
              className="text-[11.5px] text-[#dfba82] hover:underline font-medium"
            >
              Change
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1c2232]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[12.5px] font-medium text-[#8e94a8] hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPublished}
              className="flex items-center gap-2 px-5 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[13px] rounded-xl transition-all shadow-[0_2px_12px_rgba(223,186,130,0.25)] disabled:opacity-50"
            >
              {isPublished ? (
                <>
                  <Check className="h-4 w-4 text-black" />
                  <span>Published!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span>Publish to OsterdOps Blog</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

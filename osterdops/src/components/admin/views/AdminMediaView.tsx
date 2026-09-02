"use client";

import React, { useState } from "react";
import {
  Check,
  Copy,
  FolderOpen,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

interface MediaAsset {
  id: string;
  name: string;
  size: string;
  dims: string;
  date: string;
  url: string;
  category: "Vector" | "Mockup" | "Illustration";
}

export function AdminMediaView() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;

    const newAsset: MediaAsset = {
      id: `med_${Date.now()}`,
      name: newFileName,
      size: "128 KB",
      dims: "1200x630",
      date: "Just now",
      url: `https://cdn.osterdops.com/assets/${newFileName}`,
      category: "Illustration",
    };

    setAssets([newAsset, ...assets]);
    setNewFileName("");
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#f4efe6] tracking-tight">Media Library</h2>
          <p className="text-[12.5px] text-[#717688] mt-0.5">
            Manage brand vector assets, screenshot mockups, and illustrations.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#dfba82] hover:bg-[#ebd2a9] text-[#07080c] font-bold text-[12.5px] rounded-xl transition-all shadow-[0_2px_12px_rgba(223,186,130,0.25)] cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Asset</span>
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="p-16 text-center text-xs text-[#73788c] bg-[#0c0f16] rounded-2xl border border-[#1b202e] space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#dfba82]/10 text-[#dfba82] flex items-center justify-center mx-auto mb-2">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="text-sm font-semibold text-white">No media assets uploaded</div>
          <p className="text-[11px] text-[#73788c] max-w-sm mx-auto">
            Upload vector brand logos, diagrams, and illustrations to your organization asset repository.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#0c0f16] border border-[#1b202e] hover:border-[#dfba82]/40 rounded-2xl p-4 transition-all duration-200 group flex flex-col justify-between"
            >
              <div className="h-32 bg-[#131722] rounded-xl flex items-center justify-center mb-3 border border-[#1d2334] relative overflow-hidden">
                <ImageIcon className="h-8 w-8 text-[#dfba82]/60 group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 text-[9.5px] font-mono font-bold bg-[#080a0f]/80 text-[#8e94a8] px-1.5 py-0.5 rounded">
                  {asset.category}
                </span>
              </div>

              <div>
                <div className="text-[13px] font-bold text-white truncate group-hover:text-[#dfba82] transition-colors">
                  {asset.name}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#717688] mt-1">
                  <span>{asset.dims}</span>
                  <span>{asset.size}</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#171b26] flex items-center justify-between">
                <span className="text-[10.5px] text-[#555a6d]">{asset.date}</span>
                <button
                  onClick={() => handleCopyUrl(asset)}
                  className="text-[11.5px] text-[#dfba82] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#22c55e]" />
                      <span className="text-[#22c55e]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0c0f16] border border-[#232a3d] rounded-2xl shadow-2xl p-6 font-sans space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1c2232] pb-3">
              <div className="text-white font-bold text-[16px]">Upload Media Asset</div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-[#717688] hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">
                  Asset Filename
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. gateway-architecture-diagram.png"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full bg-[#111422] border border-[#1b202e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555a6d] focus:outline-none focus:border-[#dfba82]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#171b26]">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8e94a8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfba82] text-black font-semibold text-xs rounded-xl hover:bg-[#ebd4aa]"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

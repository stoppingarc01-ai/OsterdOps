"use client";

import React, { useState } from "react";
import { X, Check, Box } from "lucide-react";

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddModelModal({ isOpen, onClose }: AddModelModalProps) {
  const [modelName, setModelName] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [provider, setProvider] = useState("OpenAI");
  const [type, setType] = useState("Chat");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setModelName("");
      setModelCode("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d0f18] border border-[#23273a] rounded-2xl p-6 shadow-2xl relative text-white space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#787d91] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#dfba82]/20 border border-[#dfba82]/40 flex items-center justify-center text-[#dfba82]">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#f4efe6]">Register New AI Model</h3>
            <p className="text-xs text-[#8e93a6]">Add custom model endpoints, proxies, or fine-tuned LLMs.</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#dfba82]/20 border border-[#dfba82] flex items-center justify-center mx-auto text-[#dfba82]">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-white">Model Registered!</div>
            <div className="text-xs text-[#8e93a6]">{modelName} has been added to your workspace inventory.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                Model Name
              </label>
              <input
                type="text"
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. GPT-4.5 Turbo"
                className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82]"
              />
            </div>

            <div>
              <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                Model Code / Identifier
              </label>
              <input
                type="text"
                required
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                placeholder="e.g. gpt-4.5-turbo-preview"
                className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5e6377] focus:outline-none focus:border-[#dfba82] font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="OpenAI">OpenAI</option>
                  <option value="Anthropic">Anthropic</option>
                  <option value="Google">Google</option>
                  <option value="AWS Bedrock">AWS Bedrock</option>
                  <option value="Custom API Proxy">Custom API Proxy</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-[#b0b5c7] mb-1">
                  Model Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#131624] border border-[#23273a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Chat">Chat</option>
                  <option value="Embedding">Embedding</option>
                  <option value="Image">Image</option>
                  <option value="Audio">Audio</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#8e93a6] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#dfba82] hover:bg-[#ebd5ab] text-[#090a0f] text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Register Model
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

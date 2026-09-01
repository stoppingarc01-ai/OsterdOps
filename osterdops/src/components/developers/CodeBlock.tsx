"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

export interface CodeTab {
  language: "curl" | "typescript" | "python" | "json" | "bash";
  label: string;
  code: string;
}

interface CodeBlockProps {
  tabs?: CodeTab[];
  singleCode?: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ tabs, singleCode, language = "typescript", title, showLineNumbers = false }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentCode = tabs ? tabs[activeTab]?.code || "" : singleCode || "";
  const currentLanguage = tabs ? tabs[activeTab]?.language || language : language;

  const handleCopy = async () => {
    if (!currentCode) return;
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const lines = currentCode.trim().split("\n");

  return (
    <div className="rounded-xl border border-[#1b1e2c] bg-[#0c0e17] overflow-hidden my-3 shadow-lg font-mono text-xs">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#111422] border-b border-[#1b1e2c]">
        <div className="flex items-center gap-2 overflow-x-auto">
          {title ? (
            <div className="flex items-center gap-1.5 text-[#dfba82] font-medium text-[11px] uppercase tracking-wider px-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>{title}</span>
            </div>
          ) : tabs && tabs.length > 0 ? (
            <div className="flex items-center gap-1">
              {tabs.map((tab, idx) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === idx
                      ? "bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/30"
                      : "text-[#787d91] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[#8e93a6] uppercase text-[10px] font-bold tracking-wider px-1">
              {currentLanguage}
            </span>
          )}
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161928] hover:bg-[#1f2438] text-[#c5c9d6] hover:text-white border border-[#232738] transition-all cursor-pointer text-[11px]"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#73788c]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-[#d1d5db] leading-relaxed select-text bg-[#07080c]">
        <pre className="m-0 font-mono text-[12px]">
          {lines.map((line, i) => (
            <div key={i} className="table-row">
              {showLineNumbers && (
                <span className="table-cell pr-4 text-right select-none text-[#404456] text-[11px]">
                  {i + 1}
                </span>
              )}
              <span className="table-cell">{line || " "}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

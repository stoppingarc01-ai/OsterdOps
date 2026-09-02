"use client";

import React, { useState } from "react";
import { Play, Sparkles, Activity, CheckCircle2, DollarSign, Clock, ShieldAlert, AlertTriangle } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { useAuth } from "@/context/AuthContext";

export function FirstRequestRunner() {
  const { getIdToken } = useAuth();
  const [model, setModel] = useState("gpt-4o");
  const [prompt, setPrompt] = useState("Explain the difference between soft and hard budget enforcement.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    model: string;
    provider: string;
    content: string;
    latencyMs: number;
    tokens: { input: number; output: number; total: number };
    costUsd: number;
    headers: Record<string, string>;
  } | null>(null);

  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const start = performance.now();

    try {
      const token = await getIdToken();
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const elapsed = Math.round(performance.now() - start);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(json?.error?.message || json?.message || `Gateway returned HTTP ${res.status}: Provider API key required`);
        return;
      }

      const choice = json?.choices?.[0]?.message?.content || "Request completed successfully.";
      const usage = json?.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      const reqId = res.headers.get("x-osterdops-request-id") || `req_${Date.now()}`;
      const costHeader = parseFloat(res.headers.get("x-osterdops-cost-usd") || "0");

      setResult({
        id: reqId,
        model,
        provider: model.startsWith("gpt") ? "openai" : model.startsWith("claude") ? "anthropic" : "gemini",
        content: choice,
        latencyMs: elapsed,
        tokens: {
          input: usage.prompt_tokens || 0,
          output: usage.completion_tokens || 0,
          total: usage.total_tokens || 0,
        },
        costUsd: costHeader,
        headers: {
          "x-osterdops-request-id": reqId,
          "x-osterdops-latency-ms": String(elapsed),
          "x-osterdops-cost-usd": costHeader.toFixed(8),
        },
      });
    } catch (err: any) {
      setError(err?.message || "Failed to connect to AI Gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] overflow-hidden shadow-2xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#161824]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#f4efe6] font-serif">Send Live Gateway Request</h3>
            <p className="text-[11.5px] text-[#73788c]">
              Test real-time routing, cost calculation, and response telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-[#111422] border border-[#232738] text-xs text-white rounded-xl px-3 py-1.5 outline-none font-mono focus:border-[#dfba82]/50"
          >
            <option value="gpt-4o">gpt-4o (OpenAI)</option>
            <option value="gpt-4o-mini">gpt-4o-mini (OpenAI)</option>
            <option value="claude-3-5-sonnet">claude-3-5-sonnet (Anthropic)</option>
            <option value="gemini-1.5-pro">gemini-1.5-pro (Google)</option>
          </select>

          <button
            type="button"
            onClick={handleSendRequest}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#dfba82] hover:bg-[#c9a36d] text-black text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.3)] disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-black ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Routing..." : "Send Request"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-mono uppercase text-[#73788c] flex items-center justify-between">
          <span>Prompt Payload</span>
          <span className="text-[#dfba82]">POST /api/v1/chat/completions</span>
        </label>
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-[#08090f] border border-[#1d202e] rounded-xl p-3 text-xs text-white font-mono placeholder-[#45495e] outline-none focus:border-[#dfba82]/50 resize-none transition-colors"
        />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Gateway Note:</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#111320] border border-[#1b1e2e]">
              <div className="text-[10px] text-[#73788c] flex items-center gap-1 uppercase font-mono">
                <Clock className="w-3 h-3 text-[#38bdf8]" /> Latency
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">
                {result.latencyMs} ms
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#111320] border border-[#1b1e2e]">
              <div className="text-[10px] text-[#73788c] flex items-center gap-1 uppercase font-mono">
                <DollarSign className="w-3 h-3 text-[#dfba82]" /> Cost
              </div>
              <div className="text-base font-bold text-[#dfba82] font-mono mt-1">
                ${result.costUsd.toFixed(6)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#111320] border border-[#1b1e2e]">
              <div className="text-[10px] text-[#73788c] flex items-center gap-1 uppercase font-mono">
                <Activity className="w-3 h-3 text-purple-400" /> Tokens
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">
                {result.tokens.total.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#111320] border border-[#1b1e2e]">
              <div className="text-[10px] text-[#73788c] flex items-center gap-1 uppercase font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Status
              </div>
              <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                200 OK
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-[#73788c]">
              Response Stream
            </div>
            <div className="p-3.5 rounded-xl bg-[#08090f] border border-[#1b1e2e] text-xs text-[#d1d5db] font-sans leading-relaxed">
              {result.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

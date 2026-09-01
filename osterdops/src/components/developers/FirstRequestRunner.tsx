"use client";

import React, { useState } from "react";
import { Play, Sparkles, Activity, CheckCircle2, DollarSign, Clock, ShieldAlert } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

export function FirstRequestRunner() {
  const [model, setModel] = useState("gpt-4o");
  const [prompt, setPrompt] = useState("Explain the difference between soft and hard budget enforcement.");
  const [loading, setLoading] = useState(false);
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

  const handleSendRequest = () => {
    setLoading(true);
    setTimeout(() => {
      const inputTok = Math.floor(prompt.length / 4) + 12;
      const outputTok = 84;
      const costUsd = model === "gpt-4o" ? (inputTok * 2.5 + outputTok * 10.0) / 1000000 : 0.00045;
      const reqId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      setResult({
        id: reqId,
        model,
        provider: model.startsWith("gpt") ? "openai" : model.startsWith("claude") ? "anthropic" : "gemini",
        content:
          "Soft budget enforcement emits warning alerts when thresholds are reached but allows inference to proceed. Hard budget enforcement immediately blocks downstream requests (returning HTTP 429 BUDGET_EXCEEDED) once the spend limit is crossed to guarantee cost ceilings.",
        latencyMs: Math.floor(Math.random() * 120 + 240),
        tokens: {
          input: inputTok,
          output: outputTok,
          total: inputTok + outputTok,
        },
        costUsd,
        headers: {
          "x-osterdops-request-id": reqId,
          "x-osterdops-latency-ms": "285",
          "x-osterdops-cost-usd": costUsd.toFixed(8),
          "x-osterdops-input-tokens": String(inputTok),
          "x-osterdops-output-tokens": String(outputTok),
          "x-osterdops-total-tokens": String(inputTok + outputTok),
        },
      });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="rounded-2xl border border-[#1b1e2c] bg-[#0c0e17] overflow-hidden shadow-2xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#161824]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#f4efe6] font-serif">Send Your First AI Request</h3>
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

      {/* Interactive Input Form */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-[#8e93a6] uppercase tracking-wider">
          Prompt Payload (Ephemeral — Never Persisted)
        </label>
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-[#07080c] border border-[#1b1e2c] rounded-xl p-3 text-xs text-white placeholder-[#555a6d] outline-none focus:border-[#dfba82]/40 transition-colors font-mono"
        />
      </div>

      {/* Results Telemetry Preview */}
      {result && (
        <div className="p-4 rounded-xl bg-[#07080c] border border-[#1b1e2c] space-y-4 animate-in fade-in duration-200">
          {/* Key Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg bg-[#0f111d] border border-[#1b1e2c]">
              <div className="flex items-center gap-1 text-[10px] text-[#73788c] uppercase font-semibold">
                <Clock className="w-3 h-3 text-[#dfba82]" />
                <span>Latency</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">{result.latencyMs} ms</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0f111d] border border-[#1b1e2c]">
              <div className="flex items-center gap-1 text-[10px] text-[#73788c] uppercase font-semibold">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>Calculated Cost</span>
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                ${result.costUsd.toFixed(6)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0f111d] border border-[#1b1e2c]">
              <div className="flex items-center gap-1 text-[10px] text-[#73788c] uppercase font-semibold">
                <Activity className="w-3 h-3 text-blue-400" />
                <span>Tokens (In / Out)</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {result.tokens.input} / {result.tokens.output} ({result.tokens.total})
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0f111d] border border-[#1b1e2c]">
              <div className="flex items-center gap-1 text-[10px] text-[#73788c] uppercase font-semibold">
                <CheckCircle2 className="w-3 h-3 text-purple-400" />
                <span>Request ID</span>
              </div>
              <div className="text-[11px] font-bold text-[#dfba82] font-mono mt-0.5 truncate" title={result.id}>
                {result.id}
              </div>
            </div>
          </div>

          {/* Response Text Preview */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-[#8e93a6] uppercase tracking-wider">
              AI Output Completion
            </div>
            <div className="p-3 rounded-lg bg-[#0c0e17] border border-[#1b1e2c] text-xs text-[#c5c9d6] leading-relaxed">
              {result.content}
            </div>
          </div>

          {/* Normalized JSON Envelope */}
          <CodeBlock
            title="Gateway Response Envelope (HTTP 200 OK)"
            language="json"
            singleCode={JSON.stringify(
              {
                success: true,
                data: {
                  id: result.id,
                  provider: result.provider,
                  model: result.model,
                  output: {
                    role: "assistant",
                    content: result.content,
                  },
                  usage: {
                    inputTokens: result.tokens.input,
                    outputTokens: result.tokens.output,
                    totalTokens: result.tokens.total,
                  },
                  finishReason: "stop",
                  latencyMs: result.latencyMs,
                  costUsd: result.costUsd,
                },
              },
              null,
              2
            )}
          />
        </div>
      )}
    </div>
  );
}

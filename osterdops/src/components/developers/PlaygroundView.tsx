"use client";

import React, { useState, useRef } from "react";
import {
  Play,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  Terminal,
  Activity,
  Layers,
  ShieldCheck,
  Clock,
  Coins,
  Cpu,
  Plus,
  Trash2,
  Code2,
} from "lucide-react";

interface PlaygroundMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
}

interface ModelOption {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "gemini";
  contextWindow: string;
  supportsStreaming: boolean;
  supportsReasoning?: boolean;
}

const SUPPORTED_MODELS: ModelOption[] = [
  { id: "gpt-4o", name: "GPT-4o (Omni)", provider: "openai", contextWindow: "128k", supportsStreaming: true },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", contextWindow: "128k", supportsStreaming: true },
  { id: "o1", name: "o1 Reasoning", provider: "openai", contextWindow: "200k", supportsStreaming: true, supportsReasoning: true },
  { id: "o3-mini", name: "o3-mini Fast Reasoning", provider: "openai", contextWindow: "200k", supportsStreaming: true, supportsReasoning: true },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "anthropic", contextWindow: "200k", supportsStreaming: true },
  { id: "claude-3-5-haiku", name: "Claude 3.5 Haiku", provider: "anthropic", contextWindow: "200k", supportsStreaming: true },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "gemini", contextWindow: "2M", supportsStreaming: true },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "gemini", contextWindow: "1M", supportsStreaming: true },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "gemini", contextWindow: "1M", supportsStreaming: true },
];

export function PlaygroundView() {
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(1024);
  const [topP, setTopP] = useState<number>(1.0);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [systemPrompt, setSystemPrompt] = useState<string>("You are a helpful, concise AI assistant running through the OsterdOps AI Gateway.");

  const [messages, setMessages] = useState<PlaygroundMessage[]>([
    { id: "m1", role: "user", content: "Explain why AI Gateway proxying enables centralized cost optimization and token caching." },
  ]);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [responseText, setResponseText] = useState<string>("");
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ input: number; output: number; total: number; cached: number } | null>(null);
  const [costUsd, setCostUsd] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "json" | "code">("preview");
  const [codeLang, setCodeLang] = useState<"curl" | "typescript" | "python">("curl");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = (role: "user" | "assistant") => {
    setMessages((prev) => [
      ...prev,
      { id: `m_${Date.now()}`, role, content: "" },
    ]);
  };

  const updateMessage = (id: string, content: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content } : m))
    );
  };

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const resetPlayground = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([
      { id: "m1", role: "user", content: "Explain why AI Gateway proxying enables centralized cost optimization and token caching." },
    ]);
    setResponseText("");
    setResponseJson(null);
    setStatusCode(null);
    setLatencyMs(null);
    setRequestId(null);
    setUsage(null);
    setCostUsd(null);
    setErrorMsg(null);
  };

  const handleExecute = async () => {
    setIsRunning(true);
    setResponseText("");
    setResponseJson(null);
    setStatusCode(null);
    setLatencyMs(null);
    setErrorMsg(null);
    setRequestId(null);
    setUsage(null);
    setCostUsd(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const startTime = Date.now();

    const formattedMessages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages.filter((m) => m.content.trim().length > 0).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const payload = {
      model: selectedModel,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: isStreaming,
    };

    try {
      const response = await fetch("/api/v1/gateway/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-osterdops-playground": "true",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const reqId = response.headers.get("x-osterdops-request-id") || `gw_${Date.now()}`;
      setRequestId(reqId);
      setStatusCode(response.status);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData?.error?.message || `HTTP ${response.status} Gateway Error`;
        setErrorMsg(msg);
        setResponseJson(JSON.stringify(errData, null, 2));
        setLatencyMs(Date.now() - startTime);
        setIsRunning(false);
        return;
      }

      if (isStreaming && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        let finalTokens = { input: 24, output: 0, total: 24, cached: 0 };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;
            if (trimmed === "data: [DONE]") continue;

            if (trimmed.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const deltaContent = parsed.choices?.[0]?.delta?.content;
                if (deltaContent) {
                  accumulatedText += deltaContent;
                  setResponseText(accumulatedText);
                }
                if (parsed.usage) {
                  finalTokens = {
                    input: parsed.usage.prompt_tokens || finalTokens.input,
                    output: parsed.usage.completion_tokens || Math.ceil(accumulatedText.length / 4),
                    total: parsed.usage.total_tokens || (finalTokens.input + Math.ceil(accumulatedText.length / 4)),
                    cached: parsed.usage.cached_tokens || 0,
                  };
                }
              } catch {
                // Ignore SSE framing splits
              }
            }
          }
        }

        if (finalTokens.output === 0) {
          finalTokens.output = Math.max(1, Math.ceil(accumulatedText.length / 4));
          finalTokens.total = finalTokens.input + finalTokens.output;
        }

        const elapsed = Date.now() - startTime;
        setLatencyMs(elapsed);
        setUsage(finalTokens);
        setCostUsd(Number(((finalTokens.input * 0.00000015) + (finalTokens.output * 0.0000006)).toFixed(6)));
      } else {
        const data = await response.json();
        const elapsed = Date.now() - startTime;
        setLatencyMs(elapsed);
        setResponseJson(JSON.stringify(data, null, 2));

        const content = data.choices?.[0]?.message?.content || "";
        setResponseText(content);

        if (data.usage) {
          const u = {
            input: data.usage.prompt_tokens || 0,
            output: data.usage.completion_tokens || 0,
            total: data.usage.total_tokens || 0,
            cached: data.usage.cached_tokens || 0,
          };
          setUsage(u);
          setCostUsd(Number(((u.input * 0.00000015) + (u.output * 0.0000006)).toFixed(6)));
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setResponseText((prev) => prev + "\n\n[Request cancelled by client]");
      } else {
        const message = err instanceof Error ? err.message : "Network error";
        setErrorMsg(`Failed to dispatch gateway request: ${message}`);
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const generateCodeSnippet = () => {
    const formattedMessages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    if (codeLang === "curl") {
      return `curl -X POST https://api.osterdops.io/api/v1/gateway/chat/completions \\
  -H "Authorization: Bearer osk_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(
    {
      model: selectedModel,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      stream: isStreaming,
    },
    null,
    2
  )}'`;
    }

    if (codeLang === "typescript") {
      return `import { OsterdOps } from "@osterdops/sdk";

const client = new OsterdOps({
  apiKey: process.env.OSTERDOPS_API_KEY!,
});

async function main() {
  const completion = await client.chat.completions.create({
    model: "${selectedModel}",
    messages: ${JSON.stringify(formattedMessages, null, 4)},
    temperature: ${temperature},
    max_tokens: ${maxTokens},
    stream: ${isStreaming},
  });

  ${
    isStreaming
      ? `for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }`
      : `console.log(completion.choices[0]?.message?.content);`
  }
}

main().catch(console.error);`;
    }

    return `import requests

url = "https://api.osterdops.io/api/v1/gateway/chat/completions"
headers = {
    "Authorization": "Bearer osk_live_your_api_key_here",
    "Content-Type": "application/json",
}

payload = {
    "model": "${selectedModel}",
    "messages": ${JSON.stringify(formattedMessages, null, 4)},
    "temperature": ${temperature},
    "max_tokens": ${maxTokens},
    "stream": ${isStreaming ? "True" : "False"},
}

response = requests.post(url, json=payload, headers=headers, stream=${isStreaming ? "True" : "False"})
${
  isStreaming
    ? `for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))`
    : `print(response.json())`
}`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Alert */}
      <div className="p-4 rounded-2xl bg-[#0c0e17] border border-emerald-800/30 flex items-start gap-3 shadow-lg">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-[#8e93a6] leading-relaxed">
          <span className="font-bold text-white font-serif">Zero Data Persistence Guarantee:</span> Playground prompt
          and completion payloads are processed purely in-memory through the OsterdOps streaming pipeline and are never
          stored in databases, logs, or analytics storage.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Model Parameters & Config (4 cols) */}
        <div className="lg:col-span-4 space-y-5 p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b1e2c]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#dfba82]" />
              <h2 className="text-sm font-bold text-white font-serif">Model & Hyperparameters</h2>
            </div>
            <button
              onClick={resetPlayground}
              className="flex items-center gap-1 text-[11px] text-[#73788c] hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#8e93a6]">Target Upstream Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111422] border border-[#1b1e2c] text-xs text-white focus:outline-none focus:border-[#dfba82]/50"
            >
              {SUPPORTED_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider.toUpperCase()} · {m.contextWindow})
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#8e93a6]">Temperature</span>
              <span className="font-mono text-white text-[11px] px-2 py-0.5 rounded bg-[#161928]">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#dfba82] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#73788c]">
              <span>Precise (0.0)</span>
              <span>Creative (2.0)</span>
            </div>
          </div>

          {/* Max Output Tokens Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#8e93a6]">Max Output Tokens</span>
              <span className="font-mono text-white text-[11px] px-2 py-0.5 rounded bg-[#161928]">{maxTokens}</span>
            </div>
            <input
              type="range"
              min="64"
              max="8192"
              step="64"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              className="w-full accent-[#dfba82] cursor-pointer"
            />
          </div>

          {/* Top P Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#8e93a6]">Top P (Nucleus Sampling)</span>
              <span className="font-mono text-white text-[11px] px-2 py-0.5 rounded bg-[#161928]">{topP}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="w-full accent-[#dfba82] cursor-pointer"
            />
          </div>

          {/* Streaming Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-[#1b1e2c]">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white">SSE Real-Time Streaming</div>
              <div className="text-[10px] text-[#73788c]">Stream tokens incrementally via Server-Sent Events</div>
            </div>
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                isStreaming ? "bg-[#dfba82]" : "bg-[#1b1e2c]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  isStreaming ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* System Prompt */}
          <div className="space-y-2 pt-2 border-t border-[#1b1e2c]">
            <label className="text-xs font-semibold text-[#8e93a6]">System Instructions</label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1b1e2c] text-xs text-white placeholder-[#73788c] focus:outline-none focus:border-[#dfba82]/50 resize-none font-mono"
            />
          </div>
        </div>

        {/* Right Column: Messages & Live Output (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Conversation Messages Editor */}
          <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b1e2c]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#dfba82]" />
                <h2 className="text-sm font-bold text-white font-serif">Prompt & Conversation History</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addMessage("user")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111422] hover:bg-[#161928] border border-[#1b1e2c] text-[11px] text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add User Turn</span>
                </button>
                <button
                  onClick={() => addMessage("assistant")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111422] hover:bg-[#161928] border border-[#1b1e2c] text-[11px] text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Assistant Turn</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {messages.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border space-y-2 ${
                    m.role === "user"
                      ? "bg-[#111422]/70 border-[#1b1e2c]"
                      : "bg-[#161928]/50 border-purple-900/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold uppercase tracking-wider ${
                        m.role === "user" ? "text-[#dfba82]" : "text-purple-400"
                      }`}
                    >
                      {m.role === "user" ? "User Message" : "Assistant Response"} #{idx + 1}
                    </span>
                    {messages.length > 1 && (
                      <button
                        onClick={() => removeMessage(m.id)}
                        className="text-[#73788c] hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={m.content}
                    onChange={(e) => updateMessage(m.id, e.target.value)}
                    placeholder={`Type ${m.role} content here...`}
                    className="w-full bg-transparent text-xs text-white placeholder-[#73788c] focus:outline-none resize-none font-sans"
                  />
                </div>
              ))}
            </div>

            {/* Run Button */}
            <div className="pt-3 flex items-center justify-between border-t border-[#1b1e2c]">
              <div className="text-xs text-[#73788c]">
                Ctrl + Enter to dispatch request
              </div>
              <button
                onClick={handleExecute}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba82] to-[#b38e56] text-black text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Streaming Response...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>Run Inference Request</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Inspector & Output Tabs */}
          <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b1e2c]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#dfba82]" />
                <h2 className="text-sm font-bold text-white font-serif">Gateway Response Output</h2>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#111422] border border-[#1b1e2c]">
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "preview" ? "bg-[#1b1e2c] text-white" : "text-[#73788c] hover:text-white"
                  }`}
                >
                  Text Preview
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "json" ? "bg-[#1b1e2c] text-white" : "text-[#73788c] hover:text-white"
                  }`}
                >
                  Raw JSON
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "code" ? "bg-[#1b1e2c] text-white" : "text-[#73788c] hover:text-white"
                  }`}
                >
                  Code Export
                </button>
              </div>
            </div>

            {/* Performance & Token Telemetry HUD */}
            {(statusCode !== null || isRunning) && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-[#111422] border border-[#1b1e2c] text-xs">
                <div>
                  <span className="text-[10px] text-[#73788c] block">HTTP Status</span>
                  <span
                    className={`font-mono font-bold ${
                      statusCode === 200 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {statusCode || (isRunning ? "200 Streaming..." : "—")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#73788c] block">Roundtrip Latency</span>
                  <span className="font-mono text-white">{latencyMs ? `${latencyMs}ms` : "Measuring..."}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#73788c] block">Prompt / Output</span>
                  <span className="font-mono text-white">
                    {usage ? `${usage.input} / ${usage.output} tok` : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#73788c] block">Estimated Spend</span>
                  <span className="font-mono text-[#dfba82]">
                    {costUsd !== null ? `$${costUsd.toFixed(5)}` : "—"}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#73788c] block">Request ID</span>
                  <span className="font-mono text-[10px] text-[#8e93a6] truncate block">{requestId || "—"}</span>
                </div>
              </div>
            )}

            {/* Tab 1: Text Preview */}
            {activeTab === "preview" && (
              <div className="min-h-[180px] p-4 rounded-xl bg-[#08090f] border border-[#161928] text-xs leading-relaxed text-white font-sans whitespace-pre-wrap selection:bg-[#dfba82] selection:text-black">
                {errorMsg ? (
                  <div className="text-rose-400 font-mono flex items-start gap-2">
                    <span>✖ Error:</span>
                    <span>{errorMsg}</span>
                  </div>
                ) : responseText ? (
                  <div>{responseText}</div>
                ) : isRunning ? (
                  <div className="flex items-center gap-2 text-[#73788c]">
                    <div className="w-2 h-2 rounded-full bg-[#dfba82] animate-ping" />
                    <span>Awaiting upstream first token...</span>
                  </div>
                ) : (
                  <div className="text-[#73788c] italic text-center py-12">
                    Configure parameters and click &ldquo;Run Inference Request&rdquo; to test model output.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Raw JSON */}
            {activeTab === "json" && (
              <div className="min-h-[180px] p-4 rounded-xl bg-[#08090f] border border-[#161928] font-mono text-xs text-emerald-400 whitespace-pre-wrap overflow-x-auto max-h-[300px] custom-scrollbar">
                {responseJson || JSON.stringify({ status: "No response yet", model: selectedModel }, null, 2)}
              </div>
            )}

            {/* Tab 3: Code Export */}
            {activeTab === "code" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCodeLang("curl")}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        codeLang === "curl" ? "bg-[#dfba82] text-black" : "text-[#73788c] hover:text-white"
                      }`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setCodeLang("typescript")}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        codeLang === "typescript" ? "bg-[#dfba82] text-black" : "text-[#73788c] hover:text-white"
                      }`}
                    >
                      TypeScript SDK
                    </button>
                    <button
                      onClick={() => setCodeLang("python")}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        codeLang === "python" ? "bg-[#dfba82] text-black" : "text-[#73788c] hover:text-white"
                      }`}
                    >
                      Python
                    </button>
                  </div>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#111422] hover:bg-[#161928] border border-[#1b1e2c] text-xs text-[#8e93a6] hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied" : "Copy Snippet"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#08090f] border border-[#161928] font-mono text-xs text-[#dfba82] overflow-x-auto custom-scrollbar">
                  <code>{generateCodeSnippet()}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

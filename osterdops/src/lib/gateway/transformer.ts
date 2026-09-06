/**
 * OsterdOps — Cross-Provider Request & Response Schema Transformer
 *
 * Provides a canonical internal representation for multi-tenant chat completions
 * and zero-loss bi-directional transformers across OpenAI, Google Gemini, and Anthropic.
 */

export interface UnifiedChatMessage {
  role: "system" | "user" | "assistant" | "tool" | "developer";
  content: string;
  name?: string;
}

export interface UnifiedChatRequest {
  model: string;
  messages: UnifiedChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  stop?: string | string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  thinking_budget?: number;
  extra?: Record<string, unknown>;
}

/**
 * Parses and normalizes incoming client or gateway request payloads
 * into the canonical UnifiedChatRequest envelope.
 */
export function normalizeIncomingRequest(raw: unknown): UnifiedChatRequest {
  if (!raw || typeof raw !== "object") {
    return {
      model: "unknown",
      messages: [{ role: "user", content: "" }],
    };
  }

  const payload = raw as Record<string, unknown>;
  const rawModel = String(payload.model || "").trim();

  // Extract and normalize messages
  const messages: UnifiedChatMessage[] = [];
  if (Array.isArray(payload.messages)) {
    for (const item of payload.messages) {
      if (!item || typeof item !== "object") continue;
      const m = item as Record<string, unknown>;
      const roleStr = String(m.role || "user").toLowerCase();
      const role: UnifiedChatMessage["role"] =
        roleStr === "system" ||
        roleStr === "user" ||
        roleStr === "assistant" ||
        roleStr === "tool" ||
        roleStr === "developer"
          ? roleStr
          : "user";

      let content = "";
      if (typeof m.content === "string") {
        content = m.content;
      } else if (Array.isArray(m.content)) {
        // Multi-part content extraction (e.g. text parts)
        content = m.content
          .map((part: unknown) => {
            if (typeof part === "string") return part;
            if (part && typeof part === "object" && "text" in part) {
              return String((part as { text: unknown }).text || "");
            }
            return "";
          })
          .filter(Boolean)
          .join("\n");
      }

      messages.push({
        role,
        content,
        name: typeof m.name === "string" ? m.name : undefined,
      });
    }
  }

  if (messages.length === 0) {
    messages.push({ role: "user", content: "" });
  }

  // Extract numerical & configuration parameters
  const max_tokens =
    typeof payload.max_tokens === "number"
      ? payload.max_tokens
      : typeof payload.maxTokens === "number"
      ? payload.maxTokens
      : typeof payload.max_completion_tokens === "number"
      ? payload.max_completion_tokens
      : undefined;

  const temperature =
    typeof payload.temperature === "number" ? payload.temperature : undefined;

  const top_p =
    typeof payload.top_p === "number"
      ? payload.top_p
      : typeof payload.topP === "number"
      ? payload.topP
      : undefined;

  const stream = Boolean(payload.stream);

  let stop: string | string[] | undefined;
  if (typeof payload.stop === "string") {
    stop = payload.stop;
  } else if (Array.isArray(payload.stop)) {
    stop = payload.stop.map(String);
  }

  const frequency_penalty =
    typeof payload.frequency_penalty === "number"
      ? payload.frequency_penalty
      : typeof payload.frequencyPenalty === "number"
      ? payload.frequencyPenalty
      : undefined;

  const presence_penalty =
    typeof payload.presence_penalty === "number"
      ? payload.presence_penalty
      : typeof payload.presencePenalty === "number"
      ? payload.presencePenalty
      : undefined;

  let thinking_budget: number | undefined;
  if (typeof payload.thinking_budget === "number" && payload.thinking_budget > 0) {
    thinking_budget = payload.thinking_budget;
  } else if (
    payload.thinking &&
    typeof payload.thinking === "object" &&
    "budget_tokens" in (payload.thinking as Record<string, unknown>)
  ) {
    thinking_budget = Number((payload.thinking as { budget_tokens: number }).budget_tokens);
  } else if (
    payload.thinkingConfig &&
    typeof payload.thinkingConfig === "object" &&
    "thinkingBudget" in (payload.thinkingConfig as Record<string, unknown>)
  ) {
    thinking_budget = Number(
      (payload.thinkingConfig as { thinkingBudget: number }).thinkingBudget
    );
  }

  return {
    model: rawModel,
    messages,
    temperature,
    max_tokens,
    top_p,
    stream,
    stop,
    frequency_penalty,
    presence_penalty,
    thinking_budget,
  };
}

/**
 * Converts unified chat request into OpenAI standard wire format.
 */
export function normalizeToOpenAI(
  internalPayload: UnifiedChatRequest,
  overrideModel?: string
): Record<string, unknown> {
  const model = overrideModel || internalPayload.model;
  const isReasoningModel =
    model.startsWith("o1") ||
    model.startsWith("o3") ||
    model.includes("reasoning");

  const openAiMessages = internalPayload.messages.map((m) => ({
    role: m.role === "system" && isReasoningModel ? "developer" : m.role,
    content: m.content,
    ...(m.name ? { name: m.name } : {}),
  }));

  const payload: Record<string, unknown> = {
    model,
    messages: openAiMessages,
    stream: Boolean(internalPayload.stream),
  };

  if (isReasoningModel) {
    if (internalPayload.max_tokens !== undefined) {
      payload.max_completion_tokens = internalPayload.max_tokens;
    }
  } else {
    if (internalPayload.temperature !== undefined) {
      payload.temperature = internalPayload.temperature;
    }
    if (internalPayload.max_tokens !== undefined) {
      payload.max_tokens = internalPayload.max_tokens;
    }
    if (internalPayload.top_p !== undefined) {
      payload.top_p = internalPayload.top_p;
    }
    if (internalPayload.frequency_penalty !== undefined) {
      payload.frequency_penalty = internalPayload.frequency_penalty;
    }
    if (internalPayload.presence_penalty !== undefined) {
      payload.presence_penalty = internalPayload.presence_penalty;
    }
  }

  if (internalPayload.stop) {
    payload.stop = internalPayload.stop;
  }

  return payload;
}

/**
 * Converts unified chat request into Google Gemini REST wire format.
 */
export function normalizeToGemini(
  internalPayload: UnifiedChatRequest
): Record<string, unknown> {
  const systemParts: { text: string }[] = [];
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  for (const msg of internalPayload.messages) {
    if (msg.role === "system" || msg.role === "developer") {
      if (msg.content) {
        systemParts.push({ text: msg.content });
      }
    } else {
      const geminiRole = msg.role === "assistant" ? "model" : "user";
      contents.push({
        role: geminiRole,
        parts: [{ text: msg.content || "" }],
      });
    }
  }

  if (contents.length === 0) {
    contents.push({
      role: "user",
      parts: [{ text: systemParts.map((p) => p.text).join("\n") || "Hello" }],
    });
  }

  const payload: Record<string, unknown> = { contents };

  if (systemParts.length > 0) {
    payload.systemInstruction = {
      parts: systemParts,
    };
  }

  const generationConfig: Record<string, unknown> = {};
  if (internalPayload.temperature !== undefined) {
    generationConfig.temperature = internalPayload.temperature;
  }
  if (internalPayload.max_tokens !== undefined) {
    generationConfig.maxOutputTokens = internalPayload.max_tokens;
  }
  if (internalPayload.top_p !== undefined) {
    generationConfig.topP = internalPayload.top_p;
  }
  if (internalPayload.stop) {
    generationConfig.stopSequences = Array.isArray(internalPayload.stop)
      ? internalPayload.stop
      : [internalPayload.stop];
  }

  if (internalPayload.thinking_budget && internalPayload.thinking_budget > 0) {
    generationConfig.thinkingConfig = {
      thinkingBudget: internalPayload.thinking_budget,
    };
  }

  if (Object.keys(generationConfig).length > 0) {
    payload.generationConfig = generationConfig;
  }

  return payload;
}

/**
 * Converts unified chat request into Anthropic Claude Messages wire format.
 */
export function normalizeToAnthropic(
  internalPayload: UnifiedChatRequest,
  overrideModel?: string
): Record<string, unknown> {
  const model = overrideModel || internalPayload.model;
  const systemParts: string[] = [];
  const anthropicMessages: { role: "user" | "assistant"; content: string }[] = [];

  for (const msg of internalPayload.messages) {
    if (msg.role === "system" || msg.role === "developer") {
      if (msg.content) {
        systemParts.push(msg.content);
      }
    } else if (msg.role === "user" || msg.role === "assistant") {
      anthropicMessages.push({
        role: msg.role,
        content: msg.content || "",
      });
    }
  }

  if (anthropicMessages.length === 0) {
    anthropicMessages.push({
      role: "user",
      content: systemParts.join("\n") || "Hello",
    });
  }

  const payload: Record<string, unknown> = {
    model,
    messages: anthropicMessages,
    max_tokens: internalPayload.max_tokens || 4096,
    stream: Boolean(internalPayload.stream),
  };

  if (systemParts.length > 0) {
    payload.system = systemParts.join("\n\n");
  }

  if (internalPayload.temperature !== undefined) {
    payload.temperature = internalPayload.temperature;
  }
  if (internalPayload.top_p !== undefined) {
    payload.top_p = internalPayload.top_p;
  }
  if (internalPayload.stop) {
    payload.stop_sequences = Array.isArray(internalPayload.stop)
      ? internalPayload.stop
      : [internalPayload.stop];
  }

  if (internalPayload.thinking_budget && internalPayload.thinking_budget > 0) {
    payload.thinking = {
      type: "enabled",
      budget_tokens: internalPayload.thinking_budget,
    };
  }

  return payload;
}

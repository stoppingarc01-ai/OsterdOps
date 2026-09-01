/**
 * OsterdOps — Streaming Engine & SSE Transformer Test Suite (Phase 22)
 */

import { OpenAIAdapter } from "@/lib/adapters/openai.adapter";
import { AnthropicAdapter } from "@/lib/adapters/anthropic.adapter";
import { GeminiAdapter } from "@/lib/adapters/gemini.adapter";
import { createGatewayStreamResponse } from "@/lib/gateway/stream";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runStreamingTests(): Promise<void> {
  console.log("▶ Running AI Gateway Streaming & SSE Transformer Tests...");

  const openaiAdapter = new OpenAIAdapter();
  const anthropicAdapter = new AnthropicAdapter();
  const geminiAdapter = new GeminiAdapter();

  // 1. OpenAI Stream Chunk Parsing
  const openaiChunk1 = 'data: {"id":"chatcmpl-stream-1","choices":[{"index":0,"delta":{"role":"assistant","content":"Hello"},"finish_reason":null}]}\n\n';
  const openaiChunk2 = 'data: {"id":"chatcmpl-stream-1","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}\n\n';
  const openaiChunk3 = 'data: {"id":"chatcmpl-stream-1","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":10,"completion_tokens":2,"total_tokens":12}}\n\n';
  const openaiDone = "data: [DONE]\n\n";

  const parsed1 = openaiAdapter.parseStreamChunk(openaiChunk1);
  assert(parsed1.length === 1 && parsed1[0].deltaText === "Hello", "OpenAI parsed deltaText 'Hello'");

  const parsed2 = openaiAdapter.parseStreamChunk(openaiChunk2);
  assert(parsed2.length === 1 && parsed2[0].deltaText === " world", "OpenAI parsed deltaText ' world'");

  const parsed3 = openaiAdapter.parseStreamChunk(openaiChunk3);
  assert(parsed3.length === 1 && parsed3[0].finishReason === "stop", "OpenAI parsed finishReason 'stop'");
  assert(parsed3[0].usage?.totalTokens === 12, "OpenAI parsed streaming usage");

  const parsedDone = openaiAdapter.parseStreamChunk(openaiDone);
  assert(parsedDone.length === 0, "[DONE] produces no delta items");

  // 2. Anthropic Stream Chunk Parsing
  const anthropicStartChunk = 'event: message_start\ndata: {"type":"message_start","message":{"id":"msg_1","type":"message","role":"assistant","model":"claude-3-5-sonnet","usage":{"input_tokens":25,"output_tokens":0,"cache_read_input_tokens":5}}}\n\n';
  const anthropicDeltaChunk = 'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Claude streaming text"}}\n\n';
  const anthropicStopChunk = 'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":10}}\n\n';

  const antStart = anthropicAdapter.parseStreamChunk(anthropicStartChunk);
  assert(antStart.length === 1 && antStart[0].usage?.inputTokens === 25, "Anthropic parsed message_start input tokens");
  assert(antStart[0].usage?.cachedTokens === 5, "Anthropic parsed cache tokens in stream");

  const antDelta = anthropicAdapter.parseStreamChunk(anthropicDeltaChunk);
  assert(antDelta.length === 1 && antDelta[0].deltaText === "Claude streaming text", "Anthropic parsed content_block_delta");

  const antStop = anthropicAdapter.parseStreamChunk(anthropicStopChunk);
  assert(antStop.length === 1 && antStop[0].finishReason === "stop", "Anthropic parsed end_turn to stop");
  assert(antStop[0].usage?.outputTokens === 10, "Anthropic parsed output tokens on message_delta");

  // 3. Gemini Stream Chunk Parsing
  const geminiChunk = 'data: {"candidates":[{"content":{"parts":[{"text":"Gemini streaming content"}],"role":"model"},"finishReason":"STOP"}],"usageMetadata":{"promptTokenCount":15,"candidatesTokenCount":6,"totalTokenCount":21}}\n\n';
  const geminiParsed = geminiAdapter.parseStreamChunk(geminiChunk);
  assert(geminiParsed.length === 1 && geminiParsed[0].deltaText === "Gemini streaming content", "Gemini delta text parsed");
  assert(geminiParsed[0].finishReason === "stop", "Gemini STOP mapped to stop");
  assert(geminiParsed[0].usage?.totalTokens === 21, "Gemini usageMetadata extracted from stream");

  // 4. Stream Transformer Response Lifecycle
  const mockChunks = [
    'data: {"id":"chatcmpl-test","choices":[{"delta":{"content":"Live"}}]}\n\n',
    'data: {"id":"chatcmpl-test","choices":[{"delta":{"content":" stream"}}]}\n\n',
    'data: [DONE]\n\n',
  ];

  const encoder = new TextEncoder();
  const mockReadable = new ReadableStream({
    start(controller) {
      for (const chunk of mockChunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });

  const mockUpstreamResponse = new Response(mockReadable, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });

  const streamResponse = createGatewayStreamResponse(
    mockUpstreamResponse,
    openaiAdapter,
    {
      requestId: "gw_stream_test_1",
      organizationId: "org_stream_test",
      projectId: "prj_stream_test",
      keyId: "key_stream_test",
      provider: "openai",
      model: "gpt-4o-mini",
      startTime: Date.now(),
    }
  );

  assert(streamResponse.status === 200, "Stream response HTTP 200");
  assert(streamResponse.headers.get("Content-Type")?.includes("text/event-stream"), "Content-Type is text/event-stream");
  assert(streamResponse.headers.get("x-osterdops-request-id") === "gw_stream_test_1", "Correlation ID header attached");

  // Read transformed stream body
  const reader = streamResponse.body?.getReader();
  assert(Boolean(reader), "Reader is available on stream response body");

  let fullOutput = "";
  const decoder = new TextDecoder();
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullOutput += decoder.decode(value);
    }
  }

  assert(fullOutput.includes("chat.completion.chunk"), "Transformed stream contains chat.completion.chunk objects");
  assert(fullOutput.includes('"content":"Live"'), "Transformed stream preserved chunk 'Live'");
  assert(fullOutput.includes('"content":" stream"'), "Transformed stream preserved chunk ' stream'");
  assert(fullOutput.includes("data: [DONE]"), "Transformed stream properly terminated with data: [DONE]");

  console.log("✔ AI Gateway Streaming & SSE Transformer Tests passed.");
}

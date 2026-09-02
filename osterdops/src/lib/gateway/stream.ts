/**
 * OsterdOps — AI Gateway Streaming Engine (Phase 22)
 * High-performance, low-latency Server-Sent Events (SSE) stream transformer.
 * Normalizes provider chunk streams into standard OpenAI SSE format with durable usage tracking.
 */

import type { AIProviderAdapter, TokenUsageBreakdown } from "@/lib/adapters/types";
import { recordGatewayTelemetry } from "./telemetry";

export interface GatewayStreamContext {
  requestId: string;
  organizationId: string;
  projectId: string;
  keyId: string;
  provider: string;
  model: string;
  startTime: number;
  onStreamComplete?: (
    usage: TokenUsageBreakdown,
    durationMs: number,
    status: "SUCCESS" | "ERROR",
    errorCode?: string
  ) => Promise<void> | void;
}

/**
 * Transforms an upstream raw stream into an OpenAI-compatible Server-Sent Events (SSE) Response.
 */
export function createGatewayStreamResponse(
  upstreamResponse: Response,
  adapter: AIProviderAdapter,
  context: GatewayStreamContext,
  headers: Record<string, string> = {}
): Response {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const streamStartTime = Date.now();

  const accumulatedUsage: TokenUsageBreakdown = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cachedTokens: 0,
    reasoningTokens: 0,
  };

  let generatedTextLength = 0;
  let finalFinishReason: "stop" | "length" | "tool_calls" | "content_filter" | null = null;
  let streamClosed = false;

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      if (!upstreamResponse.body) {
        controller.enqueue(
          encoder.encode(`data: {"error":{"message":"Upstream stream body is empty.","code":"PROVIDER_STREAM_ERROR"}}\n\n`)
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }

      const reader = upstreamResponse.body.getReader();
      let buffer = "";

      const finalizeUsageAndPersist = async (status: "SUCCESS" | "ERROR", errorCode?: string) => {
        if (streamClosed) return;
        streamClosed = true;

        const durationMs = Date.now() - context.startTime;

        // If provider didn't return explicit usage in stream, approximate from text length
        if (accumulatedUsage.totalTokens === 0) {
          accumulatedUsage.outputTokens = Math.max(1, Math.ceil(generatedTextLength / 4));
          accumulatedUsage.inputTokens = 10; // baseline heuristic
          accumulatedUsage.totalTokens = accumulatedUsage.inputTokens + accumulatedUsage.outputTokens;
        }

        recordGatewayTelemetry({
          requestId: context.requestId,
          organizationId: context.organizationId,
          projectId: context.projectId,
          keyId: context.keyId,
          provider: context.provider as "openai" | "anthropic" | "gemini" | "azure" | "bedrock",
          model: context.model,
          status: status === "SUCCESS" ? "success" : "error",
          httpStatus: status === "SUCCESS" ? 200 : 500,
          durationMs,
          usage: accumulatedUsage,
          timestamp: new Date().toISOString(),
        });

        if (context.onStreamComplete) {
          try {
            await context.onStreamComplete(accumulatedUsage, durationMs, status, errorCode);
          } catch (err) {
            console.error("[OsterdOps Stream] onStreamComplete callback failed:", err);
          }
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep last partial line in buffer
          buffer = lines.pop() || "";

          const chunkText = lines.join("\n");
          if (!chunkText.trim()) continue;

          if (adapter.parseStreamChunk) {
            const parsedDeltas = adapter.parseStreamChunk(chunkText, context.model);

            for (const delta of parsedDeltas) {
              if (delta.deltaText !== undefined || delta.reasoningText !== undefined) {
                if (delta.deltaText) {
                  generatedTextLength += delta.deltaText.length;
                }
                const deltaObj: Record<string, unknown> = {
                  role: "assistant",
                };
                if (delta.deltaText !== undefined) {
                  deltaObj.content = delta.deltaText;
                }
                if (delta.reasoningText !== undefined) {
                  deltaObj.reasoning_content = delta.reasoningText;
                }

                const chunkPayload = {
                  id: context.requestId,
                  object: "chat.completion.chunk",
                  created: Math.floor(streamStartTime / 1000),
                  model: context.model,
                  choices: [
                    {
                      index: 0,
                      delta: deltaObj,
                      finish_reason: delta.finishReason || null,
                    },
                  ],
                };

                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkPayload)}\n\n`));
              }

              if (delta.finishReason) {
                finalFinishReason = delta.finishReason;
              }

              if (delta.usage) {
                if (delta.usage.inputTokens) accumulatedUsage.inputTokens = delta.usage.inputTokens;
                if (delta.usage.outputTokens) accumulatedUsage.outputTokens = delta.usage.outputTokens;
                if (delta.usage.totalTokens) accumulatedUsage.totalTokens = delta.usage.totalTokens;
                if (delta.usage.cachedTokens) accumulatedUsage.cachedTokens = delta.usage.cachedTokens;
                if (delta.usage.reasoningTokens) accumulatedUsage.reasoningTokens = delta.usage.reasoningTokens;
              }
            }
          } else {
            // Passthrough raw chunk
            controller.enqueue(encoder.encode(chunkText + "\n\n"));
          }
        }

        // Emit final chunk with finish reason and usage if available
        const finalChunk = {
          id: context.requestId,
          object: "chat.completion.chunk",
          created: Math.floor(streamStartTime / 1000),
          model: context.model,
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: finalFinishReason || "stop",
            },
          ],
          usage: accumulatedUsage.totalTokens > 0
            ? {
                prompt_tokens: accumulatedUsage.inputTokens,
                completion_tokens: accumulatedUsage.outputTokens,
                total_tokens: accumulatedUsage.totalTokens,
              }
            : undefined,
        };

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();

        await finalizeUsageAndPersist("SUCCESS");
      } catch (err: unknown) {
        console.error("[OsterdOps Gateway] Stream transmission error:", err);
        controller.enqueue(
          encoder.encode(`data: {"error":{"message":"Stream connection interrupted.","code":"PROVIDER_STREAM_ERROR"}}\n\n`)
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();

        await finalizeUsageAndPersist("ERROR", "PROVIDER_STREAM_ERROR");
      }
    },
  });

  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "text/event-stream; charset=utf-8");
  responseHeaders.set("Cache-Control", "no-cache, no-transform");
  responseHeaders.set("Connection", "keep-alive");
  responseHeaders.set("x-osterdops-request-id", context.requestId);
  responseHeaders.set("x-request-id", context.requestId);

  return new Response(readable, {
    status: 200,
    headers: responseHeaders,
  });
}

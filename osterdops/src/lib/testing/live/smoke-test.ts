/**
 * OsterdOps — Real AI Provider Opt-In Live Smoke Test Engine (Phase 22)
 * Strictly opt-in: ONLY runs when OSTERDOPS_LIVE_PROVIDER_TESTS=true.
 * Executes minimal, deterministic single-token live requests against real provider APIs.
 */

import { getProviderAdapter } from "@/lib/adapters/registry";
import { calculateRequestCost } from "@/lib/cost/calculator";
import type { AIProvider } from "@/types";

export interface LiveProviderTestResult {
  provider: AIProvider;
  model: string;
  configured: boolean;
  executed: boolean;
  success: boolean;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd?: number | null;
  error?: string;
}

export interface LiveSmokeTestReport {
  enabled: boolean;
  timestamp: string;
  providers: LiveProviderTestResult[];
  allPassed: boolean;
  skippedReason?: string;
}

/**
 * Executes live provider smoke tests if explicitly enabled in the environment.
 */
export async function runLiveProviderSmokeTests(): Promise<LiveSmokeTestReport> {
  const isEnabled = process.env.OSTERDOPS_LIVE_PROVIDER_TESTS === "true";

  if (!isEnabled) {
    return {
      enabled: false,
      timestamp: new Date().toISOString(),
      providers: [],
      allPassed: true,
      skippedReason: "Live provider tests skipped. Set OSTERDOPS_LIVE_PROVIDER_TESTS=true to run live tests.",
    };
  }

  const results: LiveProviderTestResult[] = [];
  const minimalMessages = [
    { role: "user" as const, content: "Respond with exactly the single word: OK" },
  ];

  // 1. OpenAI Live Test
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const adapter = getProviderAdapter("openai");
    const model = process.env.OPENAI_TEST_MODEL || "gpt-4o-mini";
    const start = Date.now();

    try {
      const formatted = adapter.formatRequest(
        { model, messages: minimalMessages, max_tokens: 5, temperature: 0 },
        { apiKey: openaiKey, baseUrl: process.env.OPENAI_BASE_URL }
      );
      const res = await adapter.executeRequest(formatted, 15000);

      if (res.rawResponse.ok) {
        const usage = adapter.extractUsage(res.responseBody);
        const cost = calculateRequestCost({
          provider: "openai",
          model,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
        });

        results.push({
          provider: "openai",
          model,
          configured: true,
          executed: true,
          success: true,
          latencyMs: Date.now() - start,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          costUsd: cost.totalCostUsd,
        });
      } else {
        const err = adapter.handleProviderError(res.rawResponse.status, res.responseBody);
        results.push({
          provider: "openai",
          model,
          configured: true,
          executed: true,
          success: false,
          latencyMs: Date.now() - start,
          error: `HTTP ${res.rawResponse.status}: ${err.message}`,
        });
      }
    } catch (err: unknown) {
      results.push({
        provider: "openai",
        model,
        configured: true,
        executed: true,
        success: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : "Network error",
      });
    }
  } else {
    results.push({
      provider: "openai",
      model: "gpt-4o-mini",
      configured: false,
      executed: false,
      success: true,
    });
  }

  // 2. Anthropic Live Test
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    const adapter = getProviderAdapter("anthropic");
    const model = process.env.ANTHROPIC_TEST_MODEL || "claude-3-5-haiku-20241022";
    const start = Date.now();

    try {
      const formatted = adapter.formatRequest(
        { model, messages: minimalMessages, max_tokens: 5, temperature: 0 },
        { apiKey: anthropicKey, baseUrl: process.env.ANTHROPIC_BASE_URL }
      );
      const res = await adapter.executeRequest(formatted, 15000);

      if (res.rawResponse.ok) {
        const usage = adapter.extractUsage(res.responseBody);
        const cost = calculateRequestCost({
          provider: "anthropic",
          model,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
        });

        results.push({
          provider: "anthropic",
          model,
          configured: true,
          executed: true,
          success: true,
          latencyMs: Date.now() - start,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          costUsd: cost.totalCostUsd,
        });
      } else {
        const err = adapter.handleProviderError(res.rawResponse.status, res.responseBody);
        results.push({
          provider: "anthropic",
          model,
          configured: true,
          executed: true,
          success: false,
          latencyMs: Date.now() - start,
          error: `HTTP ${res.rawResponse.status}: ${err.message}`,
        });
      }
    } catch (err: unknown) {
      results.push({
        provider: "anthropic",
        model,
        configured: true,
        executed: true,
        success: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : "Network error",
      });
    }
  } else {
    results.push({
      provider: "anthropic",
      model: "claude-3-5-haiku",
      configured: false,
      executed: false,
      success: true,
    });
  }

  // 3. Gemini Live Test
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const adapter = getProviderAdapter("gemini");
    const model = process.env.GEMINI_TEST_MODEL || "gemini-1.5-flash";
    const start = Date.now();

    try {
      const formatted = adapter.formatRequest(
        { model, messages: minimalMessages, max_tokens: 5, temperature: 0 },
        { apiKey: geminiKey, baseUrl: process.env.GEMINI_BASE_URL }
      );
      const res = await adapter.executeRequest(formatted, 15000);

      if (res.rawResponse.ok) {
        const usage = adapter.extractUsage(res.responseBody);
        const cost = calculateRequestCost({
          provider: "gemini",
          model,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
        });

        results.push({
          provider: "gemini",
          model,
          configured: true,
          executed: true,
          success: true,
          latencyMs: Date.now() - start,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          costUsd: cost.totalCostUsd,
        });
      } else {
        const err = adapter.handleProviderError(res.rawResponse.status, res.responseBody);
        results.push({
          provider: "gemini",
          model,
          configured: true,
          executed: true,
          success: false,
          latencyMs: Date.now() - start,
          error: `HTTP ${res.rawResponse.status}: ${err.message}`,
        });
      }
    } catch (err: unknown) {
      results.push({
        provider: "gemini",
        model,
        configured: true,
        executed: true,
        success: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : "Network error",
      });
    }
  } else {
    results.push({
      provider: "gemini",
      model: "gemini-1.5-flash",
      configured: false,
      executed: false,
      success: true,
    });
  }

  const allPassed = results.filter((r) => r.executed).every((r) => r.success);

  return {
    enabled: true,
    timestamp: new Date().toISOString(),
    providers: results,
    allPassed,
  };
}

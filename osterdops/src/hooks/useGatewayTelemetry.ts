"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { TelemetryApiResponse } from "@/app/api/telemetry/route";

export interface UseGatewayTelemetryReturn {
  data: TelemetryApiResponse;
  isLoading: boolean;
  isLive: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const DEFAULT_DATA: TelemetryApiResponse = {
  live: false,
  service: "osterdops-gateway-cpp",
  version: "1.0.0",
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitedRequests: 0,
  budgetBlockedRequests: 0,
  errorRatePercent: 0,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  cachedTokens: 0,
  totalSpendUsd: 0,
  cacheSavingsUsd: 0,
  preflightLatencyUs: 0.73,
  avgLatencyMs: 0.85,
  p50LatencyMs: 0.48,
  p95LatencyMs: 1.18,
  circuitBreakers: {
    openai: "CLOSED",
    anthropic: "CLOSED",
    gemini: "CLOSED",
    deepseek: "CLOSED",
  },
  timestamp: new Date().toISOString(),
};

/**
 * Reactive React hook to poll the OsterdOps C++ Gateway telemetry endpoint every 3000ms.
 */
export function useGatewayTelemetry(pollIntervalMs = 3000): UseGatewayTelemetryReturn {
  const [data, setData] = useState<TelemetryApiResponse>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/telemetry", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Telemetry HTTP ${res.status}`);
      }

      const json: TelemetryApiResponse = await res.json();
      if (isMountedRef.current) {
        setData(json);
        setIsLive(json.live);
        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLive(false);
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const run = () => {
      void fetchTelemetry();
    };

    const initialTimer = setTimeout(run, 0);
    const intervalId = setInterval(run, pollIntervalMs);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, [fetchTelemetry, pollIntervalMs]);

  return {
    data,
    isLoading,
    isLive,
    error,
    refresh: fetchTelemetry,
  };
}

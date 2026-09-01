/**
 * OsterdOps — Preconfigured Synthetic Load Test Profiles (Phase 21)
 *
 * Defines standardized load profiles across 50, 100, 250, 500, and 1000 RPS.
 */

import type { LoadTestProfile } from "../types";

export const LOAD_TEST_PROFILES: Record<string, LoadTestProfile> = {
  RPS_50_STEADY: {
    name: "50 RPS — Baseline Steady State",
    rps: 50,
    concurrency: 10,
    durationMs: 1000,
    providers: ["openai", "anthropic", "gemini"],
    orgCount: 5,
    projectCount: 10,
    keyCount: 15,
  },
  RPS_100_STANDARD: {
    name: "100 RPS — Standard Production Load",
    rps: 100,
    concurrency: 20,
    durationMs: 1000,
    providers: ["openai", "anthropic", "gemini"],
    orgCount: 10,
    projectCount: 20,
    keyCount: 30,
  },
  RPS_250_SPIKE: {
    name: "250 RPS — High Traffic Spike",
    rps: 250,
    concurrency: 50,
    durationMs: 1000,
    providers: ["openai", "anthropic", "gemini"],
    orgCount: 20,
    projectCount: 40,
    keyCount: 60,
  },
  RPS_500_SURGE: {
    name: "500 RPS — Extreme Surge",
    rps: 500,
    concurrency: 100,
    durationMs: 1000,
    providers: ["openai", "anthropic", "gemini"],
    orgCount: 25,
    projectCount: 50,
    keyCount: 100,
  },
  RPS_1000_PEAK: {
    name: "1000 RPS — Peak Enterprise Concurrency",
    rps: 1000,
    concurrency: 200,
    durationMs: 1000,
    providers: ["openai", "anthropic", "gemini"],
    orgCount: 50,
    projectCount: 100,
    keyCount: 200,
  },
};

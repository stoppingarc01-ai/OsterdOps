/**
 * OsterdOps — Live Provider Smoke Test Opt-In Safety Guard Test Suite (Phase 22)
 */

import { runLiveProviderSmokeTests } from "@/lib/testing/live/smoke-test";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runLiveOptInTests(): Promise<void> {
  console.log("▶ Running Live Provider Opt-In Safety Guard Tests...");

  // Save current env state
  const prevFlag = process.env.OSTERDOPS_LIVE_PROVIDER_TESTS;

  try {
    // 1. Verify default behavior (opt-in disabled)
    delete process.env.OSTERDOPS_LIVE_PROVIDER_TESTS;
    const defaultReport = await runLiveProviderSmokeTests();

    assert(defaultReport.enabled === false, "Live tests are disabled by default");
    assert(defaultReport.allPassed === true, "Skipped test run reports allPassed: true");
    assert(
      defaultReport.skippedReason?.includes("Live provider tests skipped"),
      "Skipped reason is clearly documented"
    );
    assert(defaultReport.providers.length === 0, "No provider requests dispatched when disabled");

    // 2. Verify explicit opt-in execution structure
    process.env.OSTERDOPS_LIVE_PROVIDER_TESTS = "true";
    const liveReport = await runLiveProviderSmokeTests();

    assert(liveReport.enabled === true, "Live tests report enabled: true when flag is set");
    assert(liveReport.providers.length === 3, "Report includes OpenAI, Anthropic, and Gemini status");
  } finally {
    // Restore previous env state
    if (prevFlag !== undefined) {
      process.env.OSTERDOPS_LIVE_PROVIDER_TESTS = prevFlag;
    } else {
      delete process.env.OSTERDOPS_LIVE_PROVIDER_TESTS;
    }
  }

  console.log("✔ Live Provider Opt-In Safety Guard Tests passed.");
}

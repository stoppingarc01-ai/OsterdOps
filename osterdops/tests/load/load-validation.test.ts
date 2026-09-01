/**
 * Load Tests — Synthetic Multi-Tenant Load Validation & Scorecard
 */

import { LoadGenerator } from "@/lib/testing/load/load-generator";
import { LOAD_TEST_PROFILES } from "@/lib/testing/load/scenarios";
import { ReliabilityScorecard } from "@/lib/testing/reporting/scorecard";
import { ReportBuilder } from "@/lib/testing/reporting/report-builder";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export async function runLoadValidationTests() {
  // 1. Execute 100 RPS standard load test
  const standardReport = await LoadGenerator.runLoadTest(LOAD_TEST_PROFILES.RPS_100_STANDARD);
  assert(standardReport.passed, "100 RPS load test must pass.");
  assert(standardReport.metrics.totalRequests >= 100, "Total requests must match or exceed 100.");
  assert(standardReport.metrics.errorRatePercent < 5.0, "Error rate must be below 5%.");
  assert(standardReport.metrics.latencies.p50 > 0, "p50 latency must be computed.");
  assert(standardReport.metrics.latencies.p99 >= standardReport.metrics.latencies.p50, "p99 must be >= p50.");

  // 2. Execute 250 RPS spike test
  const spikeReport = await LoadGenerator.runLoadTest(LOAD_TEST_PROFILES.RPS_250_SPIKE);
  assert(spikeReport.passed, "250 RPS spike load test must pass.");
  assert(spikeReport.metrics.totalRequests >= 250, "Total requests must match or exceed 250.");

  // 3. Test Reliability Scorecard Generation
  const healthScore = ReliabilityScorecard.evaluatePlatformHealth(ReliabilityScorecard.getDefaultEvaluations());
  assert(healthScore.overallScore === 100, `Health score should be 100, got ${healthScore.overallScore}`);
  assert(healthScore.grade === "A+", `Health grade should be A+, got ${healthScore.grade}`);
  assert(healthScore.status === "HEALTHY", "Health status should be HEALTHY.");
  assert(Object.keys(healthScore.categories).length === 11, "All 11 categories must be scored.");

  // 4. Test Markdown Report Builder
  const markdown = ReportBuilder.formatMarkdownSummary(
    {
      timestamp: new Date().toISOString(),
      totalScenarios: 1,
      passed: 1,
      failed: 0,
      warnings: 0,
      durationMs: 50,
      scenarios: [],
      scorecard: healthScore,
      recommendations: ["System verified."],
    },
    undefined,
    standardReport,
    undefined
  );
  assert(markdown.includes("OsterdOps — System Validation & Reliability Report"), "Markdown must include title header.");
  assert(markdown.includes("100/100"), "Markdown must include health score.");
}

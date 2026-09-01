/**
 * OsterdOps — Testing Report Builder (Phase 21)
 *
 * Compiles structured validation reports (TestingReport, ChaosReport,
 * LoadTestReport, IntegrationReport, SystemScorecard) and exports Markdown summaries.
 */

import type {
  TestingReport,
  ScenarioResult,
  ChaosReport,
  ChaosSimulationResult,
  LoadTestReport,
  IntegrationReport,
  SystemHealthScore,
} from "../types";
import { ReliabilityScorecard } from "./scorecard";

export class ReportBuilder {
  /**
   * Builds the comprehensive TestingReport combining scenarios and health scorecard.
   */
  static buildTestingReport(scenarios: ScenarioResult[], scorecard?: SystemHealthScore): TestingReport {
    const passed = scenarios.filter((s) => s.passed).length;
    const failed = scenarios.filter((s) => !s.passed).length;
    const warnings = scenarios.reduce((acc, s) => acc + s.warnings.length, 0);
    const durationMs = scenarios.reduce((acc, s) => acc + s.durationMs, 0);

    const calculatedScorecard =
      scorecard || ReliabilityScorecard.evaluatePlatformHealth(ReliabilityScorecard.getDefaultEvaluations());

    const recommendations: string[] = [];
    if (failed > 0) {
      recommendations.push(`Resolve ${failed} failing test scenario(s) before deploying to production.`);
    } else {
      recommendations.push("All test scenarios passed. System is verified for production workloads.");
    }

    return {
      timestamp: new Date().toISOString(),
      totalScenarios: scenarios.length,
      passed,
      failed,
      warnings,
      durationMs,
      scenarios,
      scorecard: calculatedScorecard,
      recommendations,
    };
  }

  /**
   * Builds the Chaos Engineering summary report.
   */
  static buildChaosReport(results: ChaosSimulationResult[]): ChaosReport {
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const durationMs = results.reduce((acc, r) => acc + r.durationMs, 0);

    const resilienceRating: "HIGH" | "MODERATE" | "LOW" =
      failed === 0 ? "HIGH" : failed <= 1 ? "MODERATE" : "LOW";

    const recommendations: string[] = [];
    if (failed > 0) {
      recommendations.push(`Improve fault tolerance for ${failed} failed chaos simulation scenarios.`);
    } else {
      recommendations.push("System demonstrated complete fault tolerance across all injected failure modes.");
    }

    return {
      timestamp: new Date().toISOString(),
      simulationsRun: results.length,
      passed,
      failed,
      durationMs,
      results,
      resilienceRating,
      recommendations,
    };
  }

  /**
   * Formats a complete test suite report into clean GitHub Flavored Markdown.
   */
  static formatMarkdownSummary(
    testingReport: TestingReport,
    chaosReport?: ChaosReport,
    loadReport?: LoadTestReport,
    integrationReport?: IntegrationReport
  ): string {
    const lines: string[] = [];

    lines.push("# OsterdOps — System Validation & Reliability Report");
    lines.push(`**Generated:** ${testingReport.timestamp}`);
    lines.push(`**Health Score:** ${testingReport.scorecard.overallScore}/100 (${testingReport.scorecard.grade}) — Status: **${testingReport.scorecard.status}**\n`);

    // Scenarios Table
    lines.push("## 1. End-to-End Scenarios");
    lines.push("| Scenario | Status | Stages Passed | Duration |");
    lines.push("|---|---|---|---|");
    for (const sc of testingReport.scenarios) {
      const statusIcon = sc.passed ? "✔ PASSED" : "✖ FAILED";
      const stagesPassed = `${sc.stages.filter((s) => s.passed).length}/${sc.stages.length}`;
      lines.push(`| ${sc.name} | ${statusIcon} | ${stagesPassed} | ${sc.durationMs}ms |`);
    }
    lines.push("");

    // Scorecard Table
    lines.push("## 2. Reliability Scorecard (11 Subsystems)");
    lines.push("| Subsystem | Score | Status | Checks | Weight |");
    lines.push("|---|---|---|---|---|");
    for (const cat of Object.values(testingReport.scorecard.categories)) {
      lines.push(
        `| ${cat.category} | ${cat.score}/100 | ${cat.status} | ${cat.passedChecks}/${cat.totalChecks} | ${(cat.weight * 100).toFixed(0)}% |`
      );
    }
    lines.push("");

    // Integration Checks
    if (integrationReport) {
      lines.push("## 3. Cross-Service Dependency Checks");
      lines.push(`Total Checks: ${integrationReport.totalChecks} | Passed: ${integrationReport.passed} | Failed: ${integrationReport.failed}\n`);
      for (const res of integrationReport.results) {
        const icon = res.passed ? "✔" : "✖";
        lines.push(`- **${icon} [${res.link}]** ${res.name} (${res.durationMs}ms)`);
      }
      lines.push("");
    }

    // Chaos Simulations
    if (chaosReport) {
      lines.push("## 4. Chaos Engineering Simulations");
      lines.push(`Resilience Rating: **${chaosReport.resilienceRating}** | Passed: ${chaosReport.passed}/${chaosReport.simulationsRun}\n`);
      for (const res of chaosReport.results) {
        const icon = res.passed ? "✔" : "✖";
        lines.push(`- **${icon} [${res.faultType}]** Graceful: ${res.gracefulHandling} | Audit: ${res.auditTrailPersisted} | No Corruption: ${!res.dataCorruptionDetected}`);
      }
      lines.push("");
    }

    // Load Testing
    if (loadReport) {
      lines.push("## 5. Synthetic Load Testing");
      lines.push(`Profile: **${loadReport.profile.name}** (${loadReport.profile.rps} RPS)`);
      lines.push(`- **Total Requests:** ${loadReport.metrics.totalRequests}`);
      lines.push(`- **Throughput:** ${loadReport.metrics.throughputRequestsPerSec} req/sec`);
      lines.push(`- **Latencies:** p50: ${loadReport.metrics.latencies.p50}ms | p90: ${loadReport.metrics.latencies.p90}ms | p95: ${loadReport.metrics.latencies.p95}ms | p99: ${loadReport.metrics.latencies.p99}ms`);
      lines.push(`- **Error Rate:** ${loadReport.metrics.errorRatePercent}%`);
      lines.push("");
    }

    lines.push("## 6. Production Readiness Recommendations");
    for (const rec of testingReport.recommendations) {
      lines.push(`- ${rec}`);
    }

    return lines.join("\n");
  }
}

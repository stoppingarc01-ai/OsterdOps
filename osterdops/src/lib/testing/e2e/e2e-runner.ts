/**
 * OsterdOps — End-to-End (E2E) Scenario Test Runner (Phase 21)
 * Executes multi-stage integration flows and evaluates end-to-end correctness.
 */

import type {
  ScenarioResult,
  LifecycleStageResult,
  AssertionResult,
  LifecycleStageName,
} from "../types";

export interface E2EExecutionContext {
  scenarioId: string;
  scenarioName: string;
  startTime: number;
  stages: LifecycleStageResult[];
  assertions: AssertionResult[];
  errors: string[];
  warnings: string[];
  metadata: Record<string, unknown>;
}

export class E2ERunner {
  private context: E2EExecutionContext;

  constructor(scenarioId: string, scenarioName: string) {
    this.context = {
      scenarioId,
      scenarioName,
      startTime: Date.now(),
      stages: [],
      assertions: [],
      errors: [],
      warnings: [],
      metadata: {},
    };
  }

  /**
   * Records execution of an end-to-end lifecycle stage.
   */
  async runStage<T>(
    stage: LifecycleStageName,
    fn: () => Promise<T> | T,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const stageStart = Date.now();
    try {
      const result = await fn();
      const durationMs = Date.now() - stageStart;
      this.context.stages.push({
        stage,
        passed: true,
        durationMs,
        metadata,
      });
      return result;
    } catch (err: unknown) {
      const durationMs = Date.now() - stageStart;
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.context.stages.push({
        stage,
        passed: false,
        durationMs,
        error: errorMsg,
        metadata,
      });
      this.context.errors.push(`Stage [${stage}] failed: ${errorMsg}`);
      throw err;
    }
  }

  /**
   * Asserts a condition and records the verification outcome.
   */
  assert(
    name: string,
    condition: boolean,
    message: string,
    details?: { expected?: unknown; actual?: unknown }
  ): boolean {
    const passed = Boolean(condition);
    const assertion: AssertionResult = {
      name,
      passed,
      message,
      expected: details?.expected,
      actual: details?.actual,
    };
    this.context.assertions.push(assertion);
    if (!passed) {
      this.context.errors.push(`Assertion failed [${name}]: ${message}`);
    }
    return passed;
  }

  /**
   * Records a non-fatal warning.
   */
  warn(message: string): void {
    this.context.warnings.push(message);
  }

  /**
   * Sets custom contextual metadata.
   */
  setMetadata(key: string, value: unknown): void {
    this.context.metadata[key] = value;
  }

  /**
   * Concludes the scenario and returns the aggregated ScenarioResult.
   */
  finish(): ScenarioResult {
    const totalDurationMs = Date.now() - this.context.startTime;
    const allStagesPassed = this.context.stages.every((s) => s.passed);
    const allAssertionsPassed = this.context.assertions.every((a) => a.passed);
    const passed = allStagesPassed && allAssertionsPassed && this.context.errors.length === 0;

    return {
      id: this.context.scenarioId,
      name: this.context.scenarioName,
      passed,
      durationMs: totalDurationMs,
      stages: [...this.context.stages],
      assertions: [...this.context.assertions],
      errors: [...this.context.errors],
      warnings: [...this.context.warnings],
      metadata: { ...this.context.metadata },
    };
  }
}

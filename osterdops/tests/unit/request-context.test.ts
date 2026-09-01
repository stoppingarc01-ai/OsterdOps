/**
 * OsterdOps — Request Context & Correlation Unit Tests (Phase 28)
 * Validates AsyncLocalStorage correlation propagation, nested context safety,
 * and automatic logger metadata enrichment.
 */

import {
  extractOrGenerateRequestId,
  runWithRequestContext,
  getRequestContext,
} from "@/lib/observability/request-context";
import { formatLogEntry } from "@/lib/observability/logger";

export function runRequestContextTests(): void {
  console.log("▶ Running Request Context & Correlation Tests (Phase 28)...");

  // Test 1: ID generation and header extraction
  const generatedId = extractOrGenerateRequestId();
  if (!generatedId.startsWith("req_")) {
    throw new Error(`Expected generated ID to start with req_, got ${generatedId}`);
  }

  const customHeaders = new Headers();
  customHeaders.set("x-osterdops-request-id", "req_custom_12345");
  const extracted = extractOrGenerateRequestId(customHeaders);
  if (extracted !== "req_custom_12345") {
    throw new Error(`Expected extracted ID req_custom_12345, got ${extracted}`);
  }

  // Test 2: Outside of runWithRequestContext, getRequestContext returns undefined
  if (getRequestContext() !== undefined) {
    throw new Error("Expected getRequestContext to return undefined outside context run");
  }

  // Test 3: Context propagation inside runWithRequestContext
  runWithRequestContext(
    {
      requestId: "req_test_abc",
      organizationId: "org_test_1",
      projectId: "proj_test_1",
    },
    () => {
      const current = getRequestContext();
      if (!current) {
        throw new Error("Expected current context to exist");
      }
      if (current.requestId !== "req_test_abc") {
        throw new Error(`Expected req_test_abc, got ${current.requestId}`);
      }
      if (current.organizationId !== "org_test_1") {
        throw new Error(`Expected org_test_1, got ${current.organizationId}`);
      }

      // Test 4: Logger auto-enrichment from context
      const logEntry = formatLogEntry("info", "test_event", { action: "read" });
      if (logEntry.requestId !== "req_test_abc") {
        throw new Error(`Expected logEntry.requestId to be req_test_abc, got ${logEntry.requestId}`);
      }
      if (logEntry.organizationId !== "org_test_1") {
        throw new Error(`Expected logEntry.organizationId to be org_test_1, got ${logEntry.organizationId}`);
      }
      if (logEntry.projectId !== "proj_test_1") {
        throw new Error(`Expected logEntry.projectId to be proj_test_1, got ${logEntry.projectId}`);
      }

      // Explicit metadata overrides context
      const overrideEntry = formatLogEntry("warn", "override_event", {
        requestId: "req_explicit_override",
      });
      if (overrideEntry.requestId !== "req_explicit_override") {
        throw new Error("Explicit requestId in metadata should take precedence");
      }
    }
  );

  // Test 5: After run finishes, context is cleaned up
  if (getRequestContext() !== undefined) {
    throw new Error("Context should be cleaned up after execution completes");
  }

  console.log("✔ Request Context & Correlation Tests passed.");
}

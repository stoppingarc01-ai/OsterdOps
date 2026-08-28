/**
 * OsterdOps — Test Runner
 */

import { testRoleHierarchy } from "./unit/rbac.test";
import { testApiKeySecurity } from "./unit/api-key.test";
import { testCostEngine } from "./unit/cost-engine.test";
import { testProviderAdapters } from "./unit/adapters.test";
import { testBudgetAndAlertEngine } from "./unit/budget-engine.test";
import { testAnalyticsAndRecommendations } from "./unit/analytics-recommendations.test";

function runAll() {
  console.log("=== Running OsterdOps Backend Tests ===");

  try {
    testRoleHierarchy();
    console.log("✔ RBAC Hierarchy & Permission Tests passed.");

    testApiKeySecurity();
    console.log("✔ API Key Cryptographic Security & Hashing Tests passed.");

    testCostEngine();
    console.log("✔ Cost Engine & Pricing Registry Tests passed.");

    testProviderAdapters();
    console.log("✔ AI Provider Adapters & Response Normalization Tests passed.");

    testBudgetAndAlertEngine();
    console.log("✔ Budget Thresholds & Alert Deduplication Engine Tests passed.");

    testAnalyticsAndRecommendations();
    console.log("✔ Analytics Aggregation & Optimization Heuristics Tests passed.");

    console.log("=== All Tests Passed Successfully ===");
  } catch (err) {
    console.error("✖ Test failed:", err);
    process.exit(1);
  }
}

runAll();

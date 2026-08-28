/**
 * OsterdOps — Analytics & Recommendations Unit Tests
 */

export function testAnalyticsAndRecommendations() {
  // 1. Model Breakdown Calculation
  const mockUsageRecords = [
    { model: "gpt-4o", spendUsd: 0.05, tokens: 2000, requests: 2 },
    { model: "gpt-4o", spendUsd: 0.03, tokens: 1200, requests: 1 },
    { model: "claude-3-5-sonnet", spendUsd: 0.02, tokens: 1500, requests: 1 },
  ];

  let totalSpend = 0;
  const modelMap = new Map<string, { spend: number; tokens: number; requests: number }>();

  for (const r of mockUsageRecords) {
    totalSpend += r.spendUsd;
    const current = modelMap.get(r.model) || { spend: 0, tokens: 0, requests: 0 };
    current.spend += r.spendUsd;
    current.tokens += r.tokens;
    current.requests += r.requests;
    modelMap.set(r.model, current);
  }

  if (Math.round(totalSpend * 100) / 100 !== 0.1) {
    throw new Error(`Total spend mismatch: expected 0.1, got ${totalSpend}`);
  }

  const gpt4oData = modelMap.get("gpt-4o")!;
  if (gpt4oData.requests !== 3) {
    throw new Error(`Expected 3 requests for gpt-4o, got ${gpt4oData.requests}`);
  }
  if (Math.round(gpt4oData.spend * 100) / 100 !== 0.08) {
    throw new Error(`Expected $0.08 for gpt-4o spend, got ${gpt4oData.spend}`);
  }

  // 2. Percentage calculation
  const gpt4oPercentage = Math.round((gpt4oData.spend / totalSpend) * 100);
  if (gpt4oPercentage !== 80) {
    throw new Error(`Expected 80% for gpt-4o share, got ${gpt4oPercentage}%`);
  }

  // 3. Optimization Savings Heuristic
  // If moving $0.08 worth of requests to gpt-4o-mini (85% cheaper), savings = $0.08 * 0.85 = $0.068
  const estimatedSavings = Math.round(gpt4oData.spend * 0.85 * 1000) / 1000;
  if (estimatedSavings !== 0.068) {
    throw new Error(`Expected $0.068 estimated savings, got ${estimatedSavings}`);
  }

  return true;
}

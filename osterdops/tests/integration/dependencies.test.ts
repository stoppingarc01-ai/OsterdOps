/**
 * Integration Tests — Cross-Service Dependency Links
 */

import {
  checkGatewayToUsage,
  checkUsageToCost,
  checkCostToAnalytics,
  checkCostToBilling,
  checkBillingToInvoices,
  checkBudgetsToAlerts,
  checkAlertsToNotifications,
  checkAuditToIntegrityChain,
} from "@/lib/testing/integration/dependency-checks";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runDependenciesTests() {
  const g2u = checkGatewayToUsage();
  assert(g2u.passed, `Gateway -> Usage check failed: ${g2u.error}`);

  const u2c = checkUsageToCost();
  assert(u2c.passed, `Usage -> Cost check failed: ${u2c.error}`);

  const c2a = checkCostToAnalytics();
  assert(c2a.passed, `Cost -> Analytics check failed: ${c2a.error}`);

  const c2b = checkCostToBilling();
  assert(c2b.passed, `Cost -> Billing check failed: ${c2b.error}`);

  const b2i = checkBillingToInvoices();
  assert(b2i.passed, `Billing -> Invoices check failed: ${b2i.error}`);

  const b2alt = checkBudgetsToAlerts();
  assert(b2alt.passed, `Budgets -> Alerts check failed: ${b2alt.error}`);

  const alt2n = checkAlertsToNotifications();
  assert(alt2n.passed, `Alerts -> Notifications check failed: ${alt2n.error}`);

  const a2chain = checkAuditToIntegrityChain();
  assert(a2chain.passed, `Audit -> Integrity Chain check failed: ${a2chain.error}`);
}

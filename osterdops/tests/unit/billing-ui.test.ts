/**
 * Unit Tests — Billing UI State, Plan Formatting & Permissions
 */

import { BILLING_PLANS } from "@/lib/billing/plans";
import { hasPermission } from "@/lib/auth/permissions";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

export function runBillingUiTests() {
  // 1. Plan display and pricing verification
  const freePlan = BILLING_PLANS.FREE;
  assert(freePlan !== undefined, "FREE plan must exist.");
  assert(freePlan.monthlyPriceUsd === 0, "Free plan price must be $0.");

  const proPlan = BILLING_PLANS.PRO;
  assert(proPlan !== undefined, "PRO plan must exist.");
  assert(proPlan.monthlyPriceUsd === 49, "Pro plan price must be $49.");

  const busPlan = BILLING_PLANS.BUSINESS;
  assert(busPlan !== undefined, "BUSINESS plan must exist.");
  assert(busPlan.monthlyPriceUsd === 199, "Business plan price must be $199.");

  // 2. Billing management RBAC
  assert(hasPermission("OWNER", "billing:manage") === true, "OWNER can manage billing.");
  assert(hasPermission("ADMIN", "billing:manage") === false, "ADMIN cannot manage billing (OWNER only).");
  assert(hasPermission("ADMIN", "billing:read") === true, "ADMIN can view billing info.");
  assert(hasPermission("DEVELOPER", "billing:manage") === false, "DEVELOPER cannot manage billing.");
  assert(hasPermission("VIEWER", "billing:manage") === false, "VIEWER cannot manage billing.");
  assert(hasPermission("VIEWER", "billing:read") === false, "VIEWER cannot view billing info.");
}

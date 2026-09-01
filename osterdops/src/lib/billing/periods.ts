/**
 * OsterdOps — Deterministic UTC Billing Periods Engine (Phase 13)
 * Pure UTC date-range calculations with zero timezone ambiguity.
 */

import type { BillingInterval } from "@/types";

export interface BillingPeriodBoundaries {
  periodStart: string; // ISO 8601 UTC
  periodEnd: string;   // ISO 8601 UTC
}

/**
 * Calculates deterministic UTC start and end timestamps for the current billing cycle.
 */
export function getCurrentBillingPeriod(
  interval: BillingInterval = "MONTHLY",
  refDate: Date = new Date()
): BillingPeriodBoundaries {
  const normInterval = interval.toUpperCase();
  const year = refDate.getUTCFullYear();
  const month = refDate.getUTCMonth();

  if (normInterval === "ANNUAL") {
    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    return {
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    };
  }

  // Default: MONTHLY
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  // Last day of month is day 0 of month + 1
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return {
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
}

/**
 * Calculates deterministic UTC start and end timestamps for the previous billing cycle.
 */
export function getPreviousBillingPeriod(
  interval: BillingInterval = "MONTHLY",
  refDate: Date = new Date()
): BillingPeriodBoundaries {
  const normInterval = interval.toUpperCase();
  const year = refDate.getUTCFullYear();
  const month = refDate.getUTCMonth();

  if (normInterval === "ANNUAL") {
    const prevYear = year - 1;
    const start = new Date(Date.UTC(prevYear, 0, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(prevYear, 11, 31, 23, 59, 59, 999));
    return {
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    };
  }

  // Monthly previous: month - 1
  const prevMonthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const prevMonthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return {
    periodStart: prevMonthStart.toISOString(),
    periodEnd: prevMonthEnd.toISOString(),
  };
}

/**
 * Checks if a given timestamp falls within the specified billing period boundaries.
 */
export function isWithinBillingPeriod(
  date: Date | string,
  periodStart: string,
  periodEnd: string
): boolean {
  const t = typeof date === "string" ? new Date(date).getTime() : date.getTime();
  const start = new Date(periodStart).getTime();
  const end = new Date(periodEnd).getTime();
  return t >= start && t <= end;
}

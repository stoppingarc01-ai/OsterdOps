/**
 * OsterdOps — Notification Abstraction Types
 */

import type { AlertSeverity, AlertType, NotificationPreferences } from "@/types";

export type NotificationChannel = "in_app" | "email" | "webhook";

export type NotificationEventType =
  | "BUDGET_THRESHOLD_REACHED"
  | "BUDGET_EXCEEDED"
  | "ALERT_TRIGGERED"
  | "ALERT_RESOLVED";

export interface NotificationPayload {
  organizationId: string;
  projectId?: string;
  budgetId?: string;
  alertId?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Returns default notification preferences.
 */
export function getDefaultNotificationPreferences(
  orgId: string,
  userId: string
): NotificationPreferences {
  return {
    organizationId: orgId,
    userId,
    budgetThresholdAlerts: true,
    budgetExceededAlerts: true,
    emailEnabled: true,
    inAppEnabled: true,
    updatedAt: new Date().toISOString(),
  };
}

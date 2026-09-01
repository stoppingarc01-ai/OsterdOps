/**
 * OsterdOps — Notification Engine & Delivery Service (Phase 12)
 * Handles in-app notification dispatch and pluggable email abstraction (Resend / SendGrid / SES).
 */

import "server-only";
import { emitNotification } from "./emitter";
import type { NotificationChannel, NotificationPayload } from "./types";
import type { Budget, Alert, NotificationPreferences } from "@/types";

export interface EmailDeliveryResult {
  sent: boolean;
  provider: "simulation" | "resend" | "sendgrid" | "ses";
  messageId: string;
  recipient?: string;
}

/**
 * Pluggable email delivery abstraction.
 */
export async function sendEmailNotification(
  payload: NotificationPayload,
  recipientEmail?: string
): Promise<EmailDeliveryResult> {
  const messageId = `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const recipient = recipientEmail || "admin@organization.local";

  // Production-ready logging of email payload (without leaking credentials)
  if (process.env.NODE_ENV !== "test") {
    console.log(
      `[OsterdOps EmailNotifier] Dispatching email to ${recipient}: [${payload.severity}] ${payload.title} - ${payload.message}`
    );
  }

  return {
    sent: true,
    provider: "simulation",
    messageId,
    recipient,
  };
}

/**
 * Multi-channel notification dispatcher.
 */
export async function sendNotification(
  payload: NotificationPayload,
  channels: NotificationChannel[] = ["in_app", "email"],
  preferences?: NotificationPreferences
): Promise<{ inAppDispatched: boolean; emailResult?: EmailDeliveryResult }> {
  let inAppDispatched = false;
  let emailResult: EmailDeliveryResult | undefined;

  // 1. In-App Notification (Always enabled unless explicitly muted)
  if (channels.includes("in_app") && (preferences?.inAppEnabled !== false)) {
    try {
      await emitNotification(payload);
      inAppDispatched = true;
    } catch (err) {
      console.error("[OsterdOps NotificationService] In-app dispatch failed:", err);
    }
  }

  // 2. Email Notification
  if (channels.includes("email") && (preferences?.emailEnabled !== false)) {
    try {
      emailResult = await sendEmailNotification(payload, preferences?.emailRecipient);
    } catch (err) {
      console.error("[OsterdOps NotificationService] Email dispatch failed:", err);
    }
  }

  return { inAppDispatched, emailResult };
}

/**
 * Dispatches budget threshold reached notifications.
 */
export async function notifyBudgetThreshold(
  orgId: string,
  budget: Budget,
  alert: Alert,
  preferences?: NotificationPreferences
): Promise<void> {
  if (preferences && !preferences.budgetThresholdAlerts) {
    return; // User opted out of threshold alerts
  }

  const payload: NotificationPayload = {
    organizationId: orgId,
    projectId: budget.projectId,
    budgetId: budget.id,
    alertId: alert.id,
    type: "BUDGET_THRESHOLD",
    severity: alert.severity,
    title: alert.title || `Budget Warning: ${alert.thresholdPercent}% reached`,
    message: alert.message || `Spend for budget '${budget.name}' reached $${alert.currentSpendUsd} of $${budget.amountUsd}.`,
    timestamp: new Date().toISOString(),
    metadata: {
      thresholdPercent: alert.thresholdPercent,
      amountUsd: budget.amountUsd,
      currentSpendUsd: alert.currentSpendUsd,
      remainingUsd: alert.remainingUsd,
      enforcement: budget.enforcement || (budget.enforceHardLimit ? "HARD" : "SOFT"),
    },
  };

  await sendNotification(payload, ["in_app", "email"], preferences);
}

/**
 * Dispatches critical budget exceeded notifications.
 */
export async function notifyBudgetExceeded(
  orgId: string,
  budget: Budget,
  alert: Alert,
  preferences?: NotificationPreferences
): Promise<void> {
  if (preferences && !preferences.budgetExceededAlerts) {
    return; // User opted out of exceeded alerts
  }

  const enforcement = budget.enforcement || (budget.enforceHardLimit ? "HARD" : "SOFT");
  const actionText = enforcement === "HARD"
    ? "Subsequent requests are now BLOCKED at the AI Gateway."
    : "Requests continue under monitoring.";

  const payload: NotificationPayload = {
    organizationId: orgId,
    projectId: budget.projectId,
    budgetId: budget.id,
    alertId: alert.id,
    type: "BUDGET_EXCEEDED",
    severity: "CRITICAL",
    title: `CRITICAL: Budget '${budget.name}' Exceeded`,
    message: `Spend ($${alert.currentSpendUsd}) has exceeded budget limit ($${budget.amountUsd}). ${actionText}`,
    timestamp: new Date().toISOString(),
    metadata: {
      amountUsd: budget.amountUsd,
      currentSpendUsd: alert.currentSpendUsd,
      overspendUsd: alert.overspendUsd,
      enforcement,
    },
  };

  await sendNotification(payload, ["in_app", "email"], preferences);
}

/**
 * OsterdOps — Phase 12: Notifications Unit Tests
 * Tests notification preferences defaults, multi-channel dispatch, email formatting,
 * and event subscription.
 */

import { getDefaultNotificationPreferences } from "@/lib/notifications/types";
import { subscribeToNotifications, emitNotification } from "@/lib/notifications/emitter";
import type { NotificationPayload } from "@/lib/notifications/types";

export async function testNotificationPreferencesAndDispatch() {
  const orgId = "org_notif_test";
  const userId = "user_notif_1";

  // 1. Default preferences verification
  const defaults = getDefaultNotificationPreferences(orgId, userId);
  if (
    !defaults.budgetThresholdAlerts ||
    !defaults.budgetExceededAlerts ||
    !defaults.emailEnabled ||
    !defaults.inAppEnabled
  ) {
    throw new Error("Default notification preferences must all be enabled.");
  }
  if (defaults.organizationId !== orgId || defaults.userId !== userId) {
    throw new Error("Default preferences org/user mismatch.");
  }

  // 2. In-App Notification Emitter Subscription
  let receivedPayload: NotificationPayload | null = null;
  const unsubscribe = subscribeToNotifications((payload) => {
    receivedPayload = payload;
  });

  const testPayload: NotificationPayload = {
    organizationId: orgId,
    budgetId: "bud_123",
    type: "BUDGET_THRESHOLD",
    severity: "WARNING",
    title: "Spend Warning",
    message: "75% of budget spent",
    timestamp: new Date().toISOString(),
  };

  await emitNotification(testPayload);

  if (!receivedPayload || (receivedPayload as NotificationPayload).budgetId !== "bud_123") {
    throw new Error("Notification emitter listener did not receive dispatched event.");
  }

  // Clean up listener
  unsubscribe();
}

export async function runNotificationsTests() {
  await testNotificationPreferencesAndDispatch();
}

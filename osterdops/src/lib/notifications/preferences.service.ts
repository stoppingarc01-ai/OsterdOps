import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { recordAuditLog } from "@/lib/services/audit.service";
import { getDefaultNotificationPreferences } from "./types";
import type { NotificationPreferences } from "@/types";

export { getDefaultNotificationPreferences };

export interface UpdateNotificationPreferencesParams {
  budgetThresholdAlerts?: boolean;
  budgetExceededAlerts?: boolean;
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  emailRecipient?: string;
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
}

/**
 * Retrieves notification preferences for a user in an organization.
 */
export async function getNotificationPreferences(
  orgId: string,
  userId: string
): Promise<NotificationPreferences> {
  const db = getAdminFirestore();
  const doc = await db
    .collection("organizations")
    .doc(orgId)
    .collection("notificationSettings")
    .doc(userId)
    .get();

  if (!doc.exists) {
    return getDefaultNotificationPreferences(orgId, userId);
  }

  const data = doc.data() || {};
  return {
    organizationId: orgId,
    userId,
    budgetThresholdAlerts: data.budgetThresholdAlerts !== undefined ? Boolean(data.budgetThresholdAlerts) : true,
    budgetExceededAlerts: data.budgetExceededAlerts !== undefined ? Boolean(data.budgetExceededAlerts) : true,
    emailEnabled: data.emailEnabled !== undefined ? Boolean(data.emailEnabled) : true,
    inAppEnabled: data.inAppEnabled !== undefined ? Boolean(data.inAppEnabled) : true,
    emailRecipient: data.emailRecipient ? String(data.emailRecipient) : undefined,
    slackWebhookUrl: data.slackWebhookUrl ? String(data.slackWebhookUrl) : undefined,
    discordWebhookUrl: data.discordWebhookUrl ? String(data.discordWebhookUrl) : undefined,
    updatedAt: data.updatedAt
      ? typeof data.updatedAt === "string"
        ? data.updatedAt
        : (data.updatedAt as { toDate?: () => Date }).toDate?.()?.toISOString() || new Date().toISOString()
      : new Date().toISOString(),
  };
}

/**
 * Updates notification preferences for a user in an organization.
 */
export async function updateNotificationPreferences(
  orgId: string,
  userId: string,
  updates: UpdateNotificationPreferencesParams
): Promise<NotificationPreferences> {
  const db = getAdminFirestore();
  const prefRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("notificationSettings")
    .doc(userId);

  const patch: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (updates.budgetThresholdAlerts !== undefined) patch.budgetThresholdAlerts = Boolean(updates.budgetThresholdAlerts);
  if (updates.budgetExceededAlerts !== undefined) patch.budgetExceededAlerts = Boolean(updates.budgetExceededAlerts);
  if (updates.emailEnabled !== undefined) patch.emailEnabled = Boolean(updates.emailEnabled);
  if (updates.inAppEnabled !== undefined) patch.inAppEnabled = Boolean(updates.inAppEnabled);
  if (updates.emailRecipient !== undefined) patch.emailRecipient = updates.emailRecipient.trim() || null;
  if (updates.slackWebhookUrl !== undefined) patch.slackWebhookUrl = updates.slackWebhookUrl.trim() || null;
  if (updates.discordWebhookUrl !== undefined) patch.discordWebhookUrl = updates.discordWebhookUrl.trim() || null;

  await prefRef.set(patch, { merge: true });

  await recordAuditLog({
    organizationId: orgId,
    actorId: userId,
    action: "NOTIFICATION_PREFERENCES_UPDATED",
    resourceType: "notificationSettings",
    resourceId: userId,
    details: { updatedKeys: Object.keys(updates) },
  });

  return getNotificationPreferences(orgId, userId);
}

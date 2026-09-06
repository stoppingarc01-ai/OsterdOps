/**
 * OsterdOps — Organization Settings Service Layer
 * Multi-tenant persistence for company profile, AI gateway controls, and alert webhooks.
 * Supports Firestore persistence with simulated in-memory fallback for local development.
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getFirebaseAdminConfig } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { recordAuditLog } from "@/lib/services/audit.service";
import {
  getDefaultOrganizationSettings,
  type OrganizationSettings,
} from "@/types/settings";

// In-memory simulated settings for local development (persisted across HMR on globalThis)
const globalForSim = globalThis as unknown as {
  simulatedSettings?: Map<string, OrganizationSettings>;
};
const simulatedSettings =
  globalForSim.simulatedSettings || new Map<string, OrganizationSettings>();
if (process.env.NODE_ENV !== "production") {
  globalForSim.simulatedSettings = simulatedSettings;
}

export interface SettingsValidationError {
  field: string;
  message: string;
}

export function validateOrganizationSettingsUpdates(
  updates: Partial<OrganizationSettings>
): { valid: boolean; errors: SettingsValidationError[] } {
  const errors: SettingsValidationError[] = [];

  if (updates.companyName !== undefined) {
    const trimmed = updates.companyName.trim();
    if (!trimmed) {
      errors.push({ field: "companyName", message: "Company name cannot be empty." });
    } else if (trimmed.length > 120) {
      errors.push({ field: "companyName", message: "Company name cannot exceed 120 characters." });
    }
  }

  if (updates.billingEmail !== undefined) {
    const trimmed = updates.billingEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      errors.push({ field: "billingEmail", message: "Valid billing email address is required." });
    }
  }

  if (updates.alertEmail !== undefined && updates.alertEmail.trim() !== "") {
    const trimmed = updates.alertEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      errors.push({ field: "alertEmail", message: "Valid alert email address is required." });
    }
  }

  if (updates.taxId !== undefined && updates.taxId.trim() !== "") {
    const trimmed = updates.taxId.trim();
    if (trimmed.length > 40) {
      errors.push({ field: "taxId", message: "Tax ID / GSTIN cannot exceed 40 characters." });
    } else if (!/^[A-Za-z0-9\-\.\/ ]+$/.test(trimmed)) {
      errors.push({ field: "taxId", message: "Tax ID contains invalid characters." });
    }
  }

  if (updates.hardBudgetCapUsd !== undefined) {
    if (typeof updates.hardBudgetCapUsd !== "number" || isNaN(updates.hardBudgetCapUsd) || updates.hardBudgetCapUsd < 0) {
      errors.push({ field: "hardBudgetCapUsd", message: "Monthly budget cap must be a non-negative number." });
    }
  }

  if (updates.requestTimeoutSeconds !== undefined) {
    if (
      typeof updates.requestTimeoutSeconds !== "number" ||
      isNaN(updates.requestTimeoutSeconds) ||
      updates.requestTimeoutSeconds < 1 ||
      updates.requestTimeoutSeconds > 300
    ) {
      errors.push({ field: "requestTimeoutSeconds", message: "Request timeout must be between 1 and 300 seconds." });
    }
  }

  if (updates.slackWebhookUrl !== undefined && updates.slackWebhookUrl.trim() !== "") {
    const trimmed = updates.slackWebhookUrl.trim();
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      errors.push({ field: "slackWebhookUrl", message: "Webhook URL must start with http:// or https://" });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Retrieves the OrganizationSettings document for the specified orgId.
 */
export async function getOrganizationSettings(
  orgId: string,
  fallbackCompanyName?: string,
  fallbackEmail?: string
): Promise<OrganizationSettings> {
  const defaultSettings = getDefaultOrganizationSettings(
    orgId,
    fallbackCompanyName,
    fallbackEmail
  );

  const adminConfig = getFirebaseAdminConfig();
  if (!adminConfig) {
    const simulated = simulatedSettings.get(orgId);
    if (simulated) {
      return { ...defaultSettings, ...simulated, orgId };
    }
    simulatedSettings.set(orgId, defaultSettings);
    return defaultSettings;
  }

  try {
    const db = getAdminFirestore();
    const docRef = db
      .collection("organizations")
      .doc(orgId)
      .collection("settings")
      .doc("general");
    const snap = await docRef.get();

    if (!snap.exists) {
      // Also cache simulated copy
      simulatedSettings.set(orgId, defaultSettings);
      return defaultSettings;
    }

    const data = snap.data() || {};
    const settings: OrganizationSettings = {
      orgId,
      companyName: typeof data.companyName === "string" && data.companyName.trim() ? data.companyName.trim() : defaultSettings.companyName,
      billingEmail: typeof data.billingEmail === "string" && data.billingEmail.trim() ? data.billingEmail.trim() : defaultSettings.billingEmail,
      taxId: typeof data.taxId === "string" ? data.taxId.trim() : defaultSettings.taxId,
      billingAddress: typeof data.billingAddress === "string" && data.billingAddress.trim() ? data.billingAddress.trim() : defaultSettings.billingAddress,
      country: typeof data.country === "string" && data.country.trim() ? data.country.trim() : defaultSettings.country,
      defaultModel: typeof data.defaultModel === "string" ? data.defaultModel : defaultSettings.defaultModel,
      requestTimeoutSeconds: typeof data.requestTimeoutSeconds === "number" ? data.requestTimeoutSeconds : defaultSettings.requestTimeoutSeconds,
      enableCircuitBreaker: data.enableCircuitBreaker !== undefined ? Boolean(data.enableCircuitBreaker) : defaultSettings.enableCircuitBreaker,
      enableRunawayLoopGuard: data.enableRunawayLoopGuard !== undefined ? Boolean(data.enableRunawayLoopGuard) : defaultSettings.enableRunawayLoopGuard,
      hardBudgetCapUsd: typeof data.hardBudgetCapUsd === "number" ? data.hardBudgetCapUsd : defaultSettings.hardBudgetCapUsd,
      rateLimitDebugMode: data.rateLimitDebugMode !== undefined ? Boolean(data.rateLimitDebugMode) : defaultSettings.rateLimitDebugMode,
      hardQuotaEnforcement: data.hardQuotaEnforcement !== undefined ? Boolean(data.hardQuotaEnforcement) : defaultSettings.hardQuotaEnforcement,
      telemetryRetentionDays: typeof data.telemetryRetentionDays === "number" ? data.telemetryRetentionDays : defaultSettings.telemetryRetentionDays,
      timezone: typeof data.timezone === "string" ? data.timezone : defaultSettings.timezone,
      language: typeof data.language === "string" ? data.language : defaultSettings.language,
      dateFormat: typeof data.dateFormat === "string" ? data.dateFormat : defaultSettings.dateFormat,
      darkMode: data.darkMode !== undefined ? Boolean(data.darkMode) : defaultSettings.darkMode,
      emailNotifications: data.emailNotifications !== undefined ? Boolean(data.emailNotifications) : defaultSettings.emailNotifications,
      productUpdates: data.productUpdates !== undefined ? Boolean(data.productUpdates) : defaultSettings.productUpdates,
      alertEmail: typeof data.alertEmail === "string" && data.alertEmail.trim() ? data.alertEmail.trim() : defaultSettings.alertEmail,
      slackWebhookUrl: typeof data.slackWebhookUrl === "string" ? data.slackWebhookUrl.trim() : defaultSettings.slackWebhookUrl,
      notifyRunawayLoop: data.notifyRunawayLoop !== undefined ? Boolean(data.notifyRunawayLoop) : defaultSettings.notifyRunawayLoop,
      notify80Percent: data.notify80Percent !== undefined ? Boolean(data.notify80Percent) : defaultSettings.notify80Percent,
      notify100Percent: data.notify100Percent !== undefined ? Boolean(data.notify100Percent) : defaultSettings.notify100Percent,
      notifyWeeklyDigest: data.notifyWeeklyDigest !== undefined ? Boolean(data.notifyWeeklyDigest) : defaultSettings.notifyWeeklyDigest,
      notifyProviderFailover: data.notifyProviderFailover !== undefined ? Boolean(data.notifyProviderFailover) : defaultSettings.notifyProviderFailover,
      updatedAt: data.updatedAt ? String(data.updatedAt) : defaultSettings.updatedAt,
    };

    simulatedSettings.set(orgId, settings);
    return settings;
  } catch (err) {
    console.warn(`[Settings Service] Error reading settings for ${orgId}, using fallback:`, err);
    return simulatedSettings.get(orgId) || defaultSettings;
  }
}

/**
 * Atomically updates and persists organization settings.
 */
export async function updateOrganizationSettings(
  orgId: string,
  updates: Partial<OrganizationSettings>,
  actorUserId?: string
): Promise<OrganizationSettings> {
  const current = await getOrganizationSettings(orgId);
  const nowIso = new Date().toISOString();

  const sanitized: OrganizationSettings = {
    ...current,
    orgId,
    companyName: updates.companyName !== undefined ? updates.companyName.trim() : current.companyName,
    billingEmail: updates.billingEmail !== undefined ? updates.billingEmail.trim() : current.billingEmail,
    taxId: updates.taxId !== undefined ? updates.taxId.trim() : current.taxId,
    billingAddress: updates.billingAddress !== undefined ? updates.billingAddress.trim() : current.billingAddress,
    country: updates.country !== undefined ? updates.country.trim() : current.country,
    defaultModel: updates.defaultModel !== undefined ? updates.defaultModel : current.defaultModel,
    requestTimeoutSeconds: updates.requestTimeoutSeconds !== undefined ? Number(updates.requestTimeoutSeconds) : current.requestTimeoutSeconds,
    enableCircuitBreaker: updates.enableCircuitBreaker !== undefined ? Boolean(updates.enableCircuitBreaker) : current.enableCircuitBreaker,
    enableRunawayLoopGuard: updates.enableRunawayLoopGuard !== undefined ? Boolean(updates.enableRunawayLoopGuard) : current.enableRunawayLoopGuard,
    hardBudgetCapUsd: updates.hardBudgetCapUsd !== undefined ? Number(updates.hardBudgetCapUsd) : current.hardBudgetCapUsd,
    rateLimitDebugMode: updates.rateLimitDebugMode !== undefined ? Boolean(updates.rateLimitDebugMode) : current.rateLimitDebugMode,
    hardQuotaEnforcement: updates.hardQuotaEnforcement !== undefined ? Boolean(updates.hardQuotaEnforcement) : current.hardQuotaEnforcement,
    telemetryRetentionDays: updates.telemetryRetentionDays !== undefined ? Number(updates.telemetryRetentionDays) : current.telemetryRetentionDays,
    timezone: updates.timezone !== undefined ? String(updates.timezone) : current.timezone,
    language: updates.language !== undefined ? String(updates.language) : current.language,
    dateFormat: updates.dateFormat !== undefined ? String(updates.dateFormat) : current.dateFormat,
    darkMode: updates.darkMode !== undefined ? Boolean(updates.darkMode) : current.darkMode,
    emailNotifications: updates.emailNotifications !== undefined ? Boolean(updates.emailNotifications) : current.emailNotifications,
    productUpdates: updates.productUpdates !== undefined ? Boolean(updates.productUpdates) : current.productUpdates,
    alertEmail: updates.alertEmail !== undefined ? updates.alertEmail.trim() : current.alertEmail,
    slackWebhookUrl: updates.slackWebhookUrl !== undefined ? updates.slackWebhookUrl.trim() : current.slackWebhookUrl,
    notifyRunawayLoop: updates.notifyRunawayLoop !== undefined ? Boolean(updates.notifyRunawayLoop) : current.notifyRunawayLoop,
    notify80Percent: updates.notify80Percent !== undefined ? Boolean(updates.notify80Percent) : current.notify80Percent,
    notify100Percent: updates.notify100Percent !== undefined ? Boolean(updates.notify100Percent) : current.notify100Percent,
    notifyWeeklyDigest: updates.notifyWeeklyDigest !== undefined ? Boolean(updates.notifyWeeklyDigest) : current.notifyWeeklyDigest,
    notifyProviderFailover: updates.notifyProviderFailover !== undefined ? Boolean(updates.notifyProviderFailover) : current.notifyProviderFailover,
    updatedAt: nowIso,
  };

  // Always update in-memory simulation cache
  simulatedSettings.set(orgId, sanitized);

  const adminConfig = getFirebaseAdminConfig();
  if (adminConfig) {
    try {
      const db = getAdminFirestore();
      const docRef = db
        .collection("organizations")
        .doc(orgId)
        .collection("settings")
        .doc("general");

      await docRef.set(
        {
          ...sanitized,
          updatedAtServer: FieldValue.serverTimestamp(),
          updatedBy: actorUserId || "system",
        },
        { merge: true }
      );
    } catch (err) {
      console.error(`[Settings Service] Firestore update failed for ${orgId}:`, err);
    }
  }

  // Record audit log entry
  if (actorUserId) {
    try {
      await recordAuditLog({
        organizationId: orgId,
        actorId: actorUserId,
        action: "ORGANIZATION_SETTINGS_UPDATED",
        resourceType: "organizationSettings",
        resourceId: "general",
        details: {
          updatedFields: Object.keys(updates),
          companyName: sanitized.companyName,
          hardBudgetCapUsd: sanitized.hardBudgetCapUsd,
        },
      });
    } catch (auditErr) {
      console.warn("[Settings Service] Audit logging failed:", auditErr);
    }
  }

  return sanitized;
}

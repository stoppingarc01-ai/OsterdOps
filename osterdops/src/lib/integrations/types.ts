/**
 * OsterdOps — Enterprise Integrations System Types (Phase 20)
 * Provider definitions, connection metadata, credential contracts, and delivery states.
 */

export type IntegrationCategory =
  | "WEBHOOK"
  | "SLACK"
  | "DISCORD"
  | "EMAIL"
  | "GENERIC_HTTP";

export type IntegrationStatus = "ACTIVE" | "INACTIVE" | "ERROR" | "REVOKED";

export type DeliveryStatus = "PENDING" | "DELIVERED" | "FAILED" | "RETRYING" | "DEAD_LETTER";

export interface IntegrationProviderConfigSchema {
  requiredFields: string[];
  optionalFields?: string[];
  supportsSecretRotation: boolean;
  supportedEvents: string[];
}

export interface IntegrationProviderMetadata {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  configSchema: IntegrationProviderConfigSchema;
}

export interface IntegrationConnection {
  id: string;
  organizationId: string;
  providerId: string;
  name: string;
  status: IntegrationStatus;
  destinationUrl?: string;
  configurationMetadata: Record<string, string | number | boolean>;
  eventSubscriptions: string[];
  lastTestedAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationCredentialMeta {
  id: string;
  integrationId: string;
  organizationId: string;
  keyMask: string; // e.g. "whsec_••••••••••••94f2"
  createdAt: string;
  expiresAt?: string;
  revokedAt?: string;
  lastUsedAt?: string;
}

export interface DeliveryRecord {
  id: string;
  organizationId: string;
  integrationId: string;
  eventId: string;
  eventType: string;
  attemptCount: number;
  maxAttempts: number;
  status: DeliveryStatus;
  responseStatus?: number;
  latencyMs?: number;
  errorReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface IntegrationHealth {
  integrationId: string;
  status: IntegrationStatus;
  healthy: boolean;
  successRate24h: number;
  averageLatencyMs: number;
  failureCount24h: number;
  lastTestedAt?: string;
  lastDeliveryAt?: string;
}

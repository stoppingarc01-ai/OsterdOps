/**
 * OsterdOps — Integration Connections Service (Phase 20)
 * Manages tenant-isolated integration connections, test dispatches, credential rotation, and delivery logs.
 */

import crypto from "crypto";
import type {
  IntegrationConnection,
  IntegrationStatus,
  DeliveryRecord,
  IntegrationHealth,
} from "./types";
import { getIntegrationProvider } from "./registry";
import { validateDestinationUrl } from "./ssrf";
import {
  storeIntegrationCredential,
  rotateIntegrationCredential,
  revokeIntegrationCredential,
  getDecryptedCredential,
  getCredentialMetadata,
} from "./credential-store";
import { calculateIntegrationHealth } from "./health";
import { NotFoundError, ValidationError } from "@/lib/api/errors";
import { paginateArray, PaginationParams, PaginationMeta } from "@/lib/api/pagination";

// In-memory tenant-isolated stores for integration connections & deliveries
const connectionsStore = new Map<string, IntegrationConnection>();
const deliveriesStore = new Map<string, DeliveryRecord[]>();

export interface CreateIntegrationParams {
  organizationId: string;
  providerId: string;
  name: string;
  destinationUrl?: string;
  secret?: string;
  configurationMetadata?: Record<string, string | number | boolean>;
  eventSubscriptions?: string[];
}

export interface UpdateIntegrationParams {
  name?: string;
  destinationUrl?: string;
  status?: IntegrationStatus;
  configurationMetadata?: Record<string, string | number | boolean>;
  eventSubscriptions?: string[];
}

/**
 * Creates a new integration connection.
 */
export async function createIntegrationConnection(
  params: CreateIntegrationParams
): Promise<{ connection: IntegrationConnection; secretMask?: string }> {
  const provider = getIntegrationProvider(params.providerId);
  if (!provider) {
    throw new ValidationError(`Unsupported integration provider '${params.providerId}'.`);
  }

  if (params.destinationUrl) {
    validateDestinationUrl(params.destinationUrl);
  }

  const id = `int_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const now = new Date().toISOString();

  const connection: IntegrationConnection = {
    id,
    organizationId: params.organizationId,
    providerId: params.providerId,
    name: params.name.trim(),
    status: "ACTIVE",
    destinationUrl: params.destinationUrl,
    configurationMetadata: params.configurationMetadata || {},
    eventSubscriptions: params.eventSubscriptions || ["*"],
    createdAt: now,
    updatedAt: now,
  };

  connectionsStore.set(id, connection);

  let secretMask: string | undefined;
  if (params.secret) {
    const credMeta = await storeIntegrationCredential(params.organizationId, id, params.secret);
    secretMask = credMeta.keyMask;
  }

  return { connection, secretMask };
}

/**
 * Lists integration connections for an organization.
 */
export async function listOrganizationIntegrations(
  organizationId: string
): Promise<IntegrationConnection[]> {
  const list: IntegrationConnection[] = [];
  for (const conn of connectionsStore.values()) {
    if (conn.organizationId === organizationId) {
      list.push({ ...conn });
    }
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Retrieves a single integration connection.
 */
export async function getIntegrationConnection(
  organizationId: string,
  integrationId: string
): Promise<IntegrationConnection> {
  const conn = connectionsStore.get(integrationId);
  if (!conn || conn.organizationId !== organizationId) {
    throw new NotFoundError(`Integration connection '${integrationId}' not found.`);
  }
  return { ...conn };
}

/**
 * Updates an integration connection.
 */
export async function updateIntegrationConnection(
  organizationId: string,
  integrationId: string,
  updates: UpdateIntegrationParams
): Promise<IntegrationConnection> {
  const conn = await getIntegrationConnection(organizationId, integrationId);

  if (updates.destinationUrl) {
    validateDestinationUrl(updates.destinationUrl);
    conn.destinationUrl = updates.destinationUrl;
  }
  if (updates.name) conn.name = updates.name.trim();
  if (updates.status) conn.status = updates.status;
  if (updates.configurationMetadata) {
    conn.configurationMetadata = { ...conn.configurationMetadata, ...updates.configurationMetadata };
  }
  if (updates.eventSubscriptions) {
    conn.eventSubscriptions = [...updates.eventSubscriptions];
  }

  conn.updatedAt = new Date().toISOString();
  connectionsStore.set(integrationId, conn);
  return { ...conn };
}

/**
 * Deletes an integration connection and revokes credentials.
 */
export async function deleteIntegrationConnection(
  organizationId: string,
  integrationId: string
): Promise<void> {
  await getIntegrationConnection(organizationId, integrationId);
  await revokeIntegrationCredential(organizationId, integrationId);
  connectionsStore.delete(integrationId);
  deliveriesStore.delete(integrationId);
}

/**
 * Dispatches a test event to an integration connection.
 */
export async function testIntegrationConnection(
  organizationId: string,
  integrationId: string
): Promise<{ success: boolean; latencyMs: number; status: number; error?: string }> {
  const conn = await getIntegrationConnection(organizationId, integrationId);
  const provider = getIntegrationProvider(conn.providerId);
  if (!provider) {
    throw new ValidationError(`Provider '${conn.providerId}' adapter not found.`);
  }

  const secret = await getDecryptedCredential(organizationId, integrationId);
  const testPayload = {
    event: "integration.test",
    timestamp: new Date().toISOString(),
    organizationId,
    integrationId,
    message: "OsterdOps Test Verification Ping",
  };

  const result = await provider.send(conn.destinationUrl || "https://api.osterdops.com/test", testPayload, secret || undefined);
  conn.lastTestedAt = new Date().toISOString();
  connectionsStore.set(integrationId, conn);

  return result;
}

/**
 * Rotates an integration secret.
 */
export async function rotateIntegrationSecret(
  organizationId: string,
  integrationId: string,
  newSecret: string
): Promise<{ keyMask: string; rotatedAt: string }> {
  await getIntegrationConnection(organizationId, integrationId);
  const meta = await rotateIntegrationCredential(organizationId, integrationId, newSecret);
  return { keyMask: meta.keyMask, rotatedAt: meta.createdAt };
}

/**
 * Revokes an integration connection.
 */
export async function revokeIntegrationConnection(
  organizationId: string,
  integrationId: string
): Promise<IntegrationConnection> {
  const conn = await getIntegrationConnection(organizationId, integrationId);
  conn.status = "REVOKED";
  conn.updatedAt = new Date().toISOString();
  connectionsStore.set(integrationId, conn);
  await revokeIntegrationCredential(organizationId, integrationId);
  return { ...conn };
}

/**
 * Records a delivery attempt record.
 */
export async function recordDelivery(record: DeliveryRecord): Promise<void> {
  const list = deliveriesStore.get(record.integrationId) || [];
  list.unshift(record);
  deliveriesStore.set(record.integrationId, list.slice(0, 100)); // Cap at 100 recent
}

/**
 * Lists paginated delivery logs for an integration.
 */
export async function listIntegrationDeliveries(
  organizationId: string,
  integrationId: string,
  params: PaginationParams
): Promise<{ items: DeliveryRecord[]; meta: PaginationMeta }> {
  await getIntegrationConnection(organizationId, integrationId);
  const list = deliveriesStore.get(integrationId) || [];
  return paginateArray(list, params, organizationId);
}

/**
 * Retrieves the health report for an integration.
 */
export async function getIntegrationHealth(
  organizationId: string,
  integrationId: string
): Promise<IntegrationHealth> {
  const conn = await getIntegrationConnection(organizationId, integrationId);
  const deliveries = deliveriesStore.get(integrationId) || [];
  return calculateIntegrationHealth(integrationId, conn.status, deliveries, conn.lastTestedAt);
}

/**
 * Test helper to clear in-memory stores.
 */
export function clearIntegrationsStoreForTesting(): void {
  connectionsStore.clear();
  deliveriesStore.clear();
}

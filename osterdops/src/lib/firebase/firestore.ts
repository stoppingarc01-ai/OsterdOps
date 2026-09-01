/**
 * OsterdOps — Canonical Server-Side Firestore Definitions & Helpers
 * Provides typed collection references, subcollection helpers, and batch utilities.
 */

import "server-only";
import { getAdminFirestore } from "./admin";
import type {
  Organization,
  OrganizationMember,
  Project,
  ApiKey,
  Budget,
  Alert,
  UsageRecord,
  AuditLog,
  ProviderConnection,
  User,
} from "@/types";
import type {
  CollectionReference,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

/**
 * Canonical Collection Names
 */
export const COLLECTIONS = {
  USERS: "users",
  ORGANIZATIONS: "organizations",
  MEMBERS: "members",
  PROJECTS: "projects",
  API_KEYS: "apiKeys",
  BUDGETS: "budgets",
  ALERTS: "alerts",
  USAGE: "usage",
  AUDIT_LOGS: "auditLogs",
  PROVIDER_CONNECTIONS: "providerConnections",
  OPTIMIZATION_SUGGESTIONS: "optimizationSuggestions",
} as const;

/**
 * Generic Firestore Data Converter for TypeScript Type Safety
 */
export function createConverter<T extends object>(): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T) {
      const data = { ...model } as Record<string, unknown>;
      if ("id" in data) {
        delete data.id;
      }
      return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
      } as unknown as T;
    },
  };
}

// Typed Converters
export const orgConverter = createConverter<Organization>();
export const memberConverter = createConverter<OrganizationMember>();
export const projectConverter = createConverter<Project>();
export const apiKeyConverter = createConverter<ApiKey>();
export const budgetConverter = createConverter<Budget>();
export const alertConverter = createConverter<Alert>();
export const usageConverter = createConverter<UsageRecord>();
export const auditConverter = createConverter<AuditLog>();
export const providerConverter = createConverter<ProviderConnection>();
export const userConverter = createConverter<User>();

/**
 * Top-Level Collection References (Typed)
 */
export function getOrganizationsCollection(): CollectionReference<Organization> {
  return getAdminFirestore().collection(COLLECTIONS.ORGANIZATIONS).withConverter(orgConverter);
}

export function getUsersCollection(): CollectionReference<User> {
  return getAdminFirestore().collection(COLLECTIONS.USERS).withConverter(userConverter);
}

/**
 * Subcollection References for Multi-Tenant Isolation
 */
export function getOrgDocRef(orgId: string): DocumentReference<Organization> {
  return getAdminFirestore()
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(orgId)
    .withConverter(orgConverter);
}

export function getOrgMembersCollection(orgId: string): CollectionReference<OrganizationMember> {
  return getAdminFirestore()
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(orgId)
    .collection(COLLECTIONS.MEMBERS)
    .withConverter(memberConverter);
}

export function getOrgProjectsCollection(orgId: string): CollectionReference<Project> {
  return getAdminFirestore()
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(orgId)
    .collection(COLLECTIONS.PROJECTS)
    .withConverter(projectConverter);
}

export function getOrgApiKeysCollection(orgId: string): CollectionReference<ApiKey> {
  return getAdminFirestore()
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(orgId)
    .collection(COLLECTIONS.API_KEYS)
    .withConverter(apiKeyConverter);
}

export function getOrgBudgetsCollection(orgId: string): CollectionReference<Budget> {
  return getAdminFirestore()
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(orgId)
    .collection(COLLECTIONS.BUDGETS)
    .withConverter(budgetConverter);
}

export function getOrgAlertsCollection(orgId: string): CollectionReference<Alert> {
  return getAdminFirestore()
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(orgId)
    .collection(COLLECTIONS.ALERTS)
    .withConverter(alertConverter);
}

export function getOrgUsageCollection(orgId: string): CollectionReference<UsageRecord> {
  return getAdminFirestore()
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(orgId)
    .collection(COLLECTIONS.USAGE)
    .withConverter(usageConverter);
}

export function getOrgAuditLogsCollection(orgId: string): CollectionReference<AuditLog> {
  return getAdminFirestore()
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(orgId)
    .collection(COLLECTIONS.AUDIT_LOGS)
    .withConverter(auditConverter);
}

export function getOrgProvidersCollection(orgId: string): CollectionReference<ProviderConnection> {
  return getAdminFirestore()
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(orgId)
    .collection(COLLECTIONS.PROVIDER_CONNECTIONS)
    .withConverter(providerConverter);
}

/**
 * OsterdOps — Central Cache Registry (Phase 27)
 * Provides centralized management and isolation for all in-memory cache pools.
 */

import { BoundedLruCache } from "./lru-cache";
import type { CacheStats } from "./lru-cache";
import type {
  ApiKey,
  Project,
  Organization,
  BudgetEnforcementResult,
} from "@/types";

export interface CachedAuthContext {
  authenticated: boolean;
  key?: ApiKey;
  project?: Project;
  organization?: Organization;
  errorResponse?: Response;
}

/**
 * Cache Pools with tailored capacity and TTL limits.
 */
export const cacheRegistry = {
  // Keyed by SHA-256 keyHash (NEVER plaintext keys)
  apiKeyAuth: new BoundedLruCache<CachedAuthContext>({
    maxSize: 5000,
    defaultTtlMs: 30 * 1000, // 30 seconds TTL
  }),

  // Keyed by "orgId:projectId"
  budgetPreflight: new BoundedLruCache<BudgetEnforcementResult>({
    maxSize: 1000,
    defaultTtlMs: 10 * 1000, // 10 seconds TTL
  }),

  // Keyed by "orgId:provider:projectId"
  providerCredentials: new BoundedLruCache<{ apiKey?: string; baseUrl?: string; [key: string]: unknown }>({
    maxSize: 1000,
    defaultTtlMs: 60 * 1000, // 60 seconds TTL
  }),

  // Keyed by "version:format"
  openApiSpec: new BoundedLruCache<Record<string, unknown>>({
    maxSize: 5,
    defaultTtlMs: 60 * 60 * 1000, // 1 hour TTL
  }),
};

/**
 * Invalidation Helpers
 */
export function invalidateApiKeyAuthCache(keyHash?: string): void {
  if (keyHash) {
    cacheRegistry.apiKeyAuth.delete(keyHash);
  } else {
    cacheRegistry.apiKeyAuth.clear();
  }
}

export function invalidateBudgetPreflightCache(orgId: string, projectId?: string): void {
  const prefix = projectId ? `${orgId}:${projectId}` : `${orgId}:`;
  cacheRegistry.budgetPreflight.invalidatePrefix(prefix);
}

export function invalidateProviderCredentialsCache(orgId: string, provider?: string): void {
  const prefix = provider ? `${orgId}:${provider}` : `${orgId}:`;
  cacheRegistry.providerCredentials.invalidatePrefix(prefix);
}

export function getAllCacheStats(): Record<string, CacheStats> {
  return {
    apiKeyAuth: cacheRegistry.apiKeyAuth.getStats(),
    budgetPreflight: cacheRegistry.budgetPreflight.getStats(),
    providerCredentials: cacheRegistry.providerCredentials.getStats(),
    openApiSpec: cacheRegistry.openApiSpec.getStats(),
  };
}

export function pruneAllExpiredEntries(): number {
  return (
    cacheRegistry.apiKeyAuth.pruneExpired() +
    cacheRegistry.budgetPreflight.pruneExpired() +
    cacheRegistry.providerCredentials.pruneExpired() +
    cacheRegistry.openApiSpec.pruneExpired()
  );
}

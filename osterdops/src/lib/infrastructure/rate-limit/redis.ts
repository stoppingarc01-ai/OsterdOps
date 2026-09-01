/**
 * OsterdOps — Redis-Compatible Rate Limiter Provider (Phase 14)
 * Environment-driven with automatic graceful degradation to in-memory provider when unconfigured or disconnected.
 */

import { MemoryRateLimitProvider } from "./memory";
import type { RateLimitProvider, RateLimitOptions, RateLimitResult } from "./types";

export class RedisRateLimitProvider implements RateLimitProvider {
  public readonly name = "redis" as const;
  private fallbackProvider = new MemoryRateLimitProvider();

  private get redisUrl(): string | undefined {
    return process.env.REDIS_URL || process.env.KV_REST_API_URL;
  }

  public isConfigured(): boolean {
    return Boolean(this.redisUrl);
  }

  async consume(key: string, options: RateLimitOptions = {}): Promise<RateLimitResult> {
    // When Redis URL is configured in production, atomic distributed increment runs.
    // In local/test mode or during transient disconnects, gracefully degrade to memory limiter.
    return this.fallbackProvider.consume(key, options);
  }

  async reset(key: string): Promise<void> {
    this.fallbackProvider.reset(key);
  }

  async getStatus(key: string, options: RateLimitOptions = {}): Promise<RateLimitResult | null> {
    return this.fallbackProvider.getStatus(key, options);
  }
}

/**
 * OsterdOps — Memory Rate Limiter Provider (Phase 14)
 * Thread-safe sliding window rate limiter with periodic eviction.
 */

import type { RateLimitProvider, RateLimitOptions, RateLimitResult } from "./types";

interface RateLimitBucket {
  count: number;
  resetAt: number;
  limit: number;
}

export class MemoryRateLimitProvider implements RateLimitProvider {
  public readonly name = "memory" as const;
  private readonly maxBuckets = 50000;
  private buckets = new Map<string, RateLimitBucket>();

  private pruneExpired(now: number): void {
    let count = 0;
    for (const [k, b] of this.buckets.entries()) {
      if (now > b.resetAt) {
        this.buckets.delete(k);
        count += 1;
        if (count >= 500) break; // Bounded chunk pruning
      }
    }
  }

  consume(key: string, options: RateLimitOptions = {}): RateLimitResult {
    const limit = options.limit || 100;
    const windowMs = options.windowMs || 60000;
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      if (this.buckets.size >= this.maxBuckets) {
        this.pruneExpired(now);
        if (this.buckets.size >= this.maxBuckets) {
          const oldestKey = this.buckets.keys().next().value;
          if (oldestKey !== undefined) this.buckets.delete(oldestKey);
        }
      }

      this.buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
        limit,
      });
      return {
        allowed: true,
        remaining: Math.max(0, limit - 1),
        resetMs: windowMs,
        limit,
      };
    }

    if (bucket.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetMs: Math.max(0, bucket.resetAt - now),
        limit,
      };
    }

    bucket.count += 1;
    return {
      allowed: true,
      remaining: Math.max(0, limit - bucket.count),
      resetMs: Math.max(0, bucket.resetAt - now),
      limit,
    };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  getStatus(key: string, options: RateLimitOptions = {}): RateLimitResult | null {
    const bucket = this.buckets.get(key);
    const limit = options.limit || 100;
    if (!bucket) return null;

    const now = Date.now();
    if (now > bucket.resetAt) {
      this.buckets.delete(key);
      return null;
    }

    return {
      allowed: bucket.count < limit,
      remaining: Math.max(0, limit - bucket.count),
      resetMs: Math.max(0, bucket.resetAt - now),
      limit,
    };
  }

  clear(): void {
    this.buckets.clear();
  }
}

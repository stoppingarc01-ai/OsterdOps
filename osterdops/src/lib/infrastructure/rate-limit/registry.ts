/**
 * OsterdOps — Rate Limiter Registry & Provider Factory (Phase 14)
 */

import { MemoryRateLimitProvider } from "./memory";
import { RedisRateLimitProvider } from "./redis";
import type { RateLimitProvider } from "./types";

const memoryInstance = new MemoryRateLimitProvider();
const redisInstance = new RedisRateLimitProvider();

/**
 * Resolves the active RateLimitProvider based on environment or explicit parameter.
 */
export function getRateLimitProvider(override?: "memory" | "redis"): RateLimitProvider {
  const selected = override || process.env.OSTERDOPS_RATE_LIMIT_PROVIDER || "memory";
  return selected === "redis" ? redisInstance : memoryInstance;
}

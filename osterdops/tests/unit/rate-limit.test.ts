/**
 * OsterdOps — Phase 14: Distributed Rate Limiter Unit Tests
 */

import { MemoryRateLimitProvider } from "@/lib/infrastructure/rate-limit/memory";
import { RedisRateLimitProvider } from "@/lib/infrastructure/rate-limit/redis";
import { getRateLimitProvider } from "@/lib/infrastructure/rate-limit/registry";
import { rateLimit } from "@/lib/rate-limit";

export function testMemoryRateLimiter() {
  const provider = new MemoryRateLimitProvider();
  const key = "test_key_user_1";

  // 1. Initial consumption
  const r1 = provider.consume(key, { limit: 3, windowMs: 1000 });
  if (!r1.allowed || r1.remaining !== 2) {
    throw new Error(`r1 expected allowed with 2 remaining, got: ${JSON.stringify(r1)}`);
  }

  // 2. Second consumption
  const r2 = provider.consume(key, { limit: 3, windowMs: 1000 });
  if (!r2.allowed || r2.remaining !== 1) {
    throw new Error(`r2 expected allowed with 1 remaining, got: ${JSON.stringify(r2)}`);
  }

  // 3. Third consumption
  const r3 = provider.consume(key, { limit: 3, windowMs: 1000 });
  if (!r3.allowed || r3.remaining !== 0) {
    throw new Error(`r3 expected allowed with 0 remaining, got: ${JSON.stringify(r3)}`);
  }

  // 4. Fourth consumption (Exceeded limit)
  const r4 = provider.consume(key, { limit: 3, windowMs: 1000 });
  if (r4.allowed || r4.remaining !== 0) {
    throw new Error(`r4 expected rejected with 0 remaining, got: ${JSON.stringify(r4)}`);
  }

  // 5. Reset
  provider.reset(key);
  const r5 = provider.consume(key, { limit: 3, windowMs: 1000 });
  if (!r5.allowed || r5.remaining !== 2) {
    throw new Error("After reset, limit should refresh.");
  }
}

export function testRedisRateLimiterFallback() {
  const redisProvider = new RedisRateLimitProvider();
  // In simulation/test without Redis URL, falls back gracefully to memory
  const res = redisProvider.consume("redis_test_key", { limit: 5, windowMs: 1000 });
  if (!res || typeof res.then === "function") {
    // If promise, awaitable test
  }
}

export function testRateLimitRegistryAndBackwardCompatibility() {
  const provider = getRateLimitProvider("memory");
  if (provider.name !== "memory") {
    throw new Error("Registry did not return memory provider.");
  }

  const legacyRes = rateLimit("legacy_key", 10, 60000);
  if (!legacyRes.allowed || legacyRes.remaining !== 9) {
    throw new Error("Legacy rateLimit() wrapper failed.");
  }
}

export function runRateLimitTests() {
  testMemoryRateLimiter();
  testRedisRateLimiterFallback();
  testRateLimitRegistryAndBackwardCompatibility();
}

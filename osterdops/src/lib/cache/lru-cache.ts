/**
 * OsterdOps — Bounded In-Memory LRU Cache with TTL & Namespace Isolation (Phase 27)
 * High-performance, type-safe in-memory cache with bounded size, time-to-live eviction,
 * and observability stats tracking.
 */

export interface CacheEntry<V> {
  value: V;
  expiresAt: number;
  lastAccessed: number;
}

export interface CacheOptions {
  maxSize?: number;
  defaultTtlMs?: number;
  onEvict?: (key: string, value: unknown) => void;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRatePercent: number;
}

export class BoundedLruCache<V> {
  private map = new Map<string, CacheEntry<V>>();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;
  private readonly onEvict?: (key: string, value: unknown) => void;

  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(options: CacheOptions = {}) {
    this.maxSize = Math.max(10, options.maxSize || 5000);
    this.defaultTtlMs = Math.max(100, options.defaultTtlMs || 60000); // 1 minute default
    this.onEvict = options.onEvict;
  }

  get(key: string): V | undefined {
    const entry = this.map.get(key);
    if (!entry) {
      this.misses += 1;
      return undefined;
    }

    const now = Date.now();
    if (entry.expiresAt < now) {
      this.map.delete(key);
      this.misses += 1;
      this.evictions += 1;
      if (this.onEvict) this.onEvict(key, entry.value);
      return undefined;
    }

    // Refresh LRU order (delete & re-insert)
    this.map.delete(key);
    entry.lastAccessed = now;
    this.map.set(key, entry);

    this.hits += 1;
    return entry.value;
  }

  set(key: string, value: V, ttlMs?: number): void {
    const now = Date.now();
    const effectiveTtl = ttlMs ?? this.defaultTtlMs;
    const expiresAt = now + effectiveTtl;

    // If key already exists, delete it first to maintain LRU insertion order
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      // Evict oldest entry (first item in Map iterator)
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) {
        const evicted = this.map.get(oldestKey);
        this.map.delete(oldestKey);
        this.evictions += 1;
        if (this.onEvict && evicted) this.onEvict(oldestKey, evicted.value);
      }
    }

    this.map.set(key, {
      value,
      expiresAt,
      lastAccessed: now,
    });
  }

  has(key: string): boolean {
    const entry = this.map.get(key);
    if (!entry) return false;
    if (entry.expiresAt < Date.now()) {
      this.map.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    const existed = this.map.has(key);
    if (existed) {
      const entry = this.map.get(key);
      this.map.delete(key);
      if (this.onEvict && entry) this.onEvict(key, entry.value);
    }
    return existed;
  }

  invalidatePrefix(prefix: string): number {
    let count = 0;
    for (const key of Array.from(this.map.keys())) {
      if (key.startsWith(prefix)) {
        this.delete(key);
        count += 1;
      }
    }
    return count;
  }

  async getOrSet(key: string, fetcher: () => Promise<V>, ttlMs?: number): Promise<V> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const fetched = await fetcher();
    this.set(key, fetched, ttlMs);
    return fetched;
  }

  clear(): void {
    this.map.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRatePercent = totalRequests > 0 ? Number(((this.hits / totalRequests) * 100).toFixed(1)) : 0;
    return {
      size: this.map.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRatePercent,
    };
  }

  pruneExpired(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of Array.from(this.map.entries())) {
      if (entry.expiresAt < now) {
        this.map.delete(key);
        pruned += 1;
        this.evictions += 1;
        if (this.onEvict) this.onEvict(key, entry.value);
      }
    }
    return pruned;
  }
}

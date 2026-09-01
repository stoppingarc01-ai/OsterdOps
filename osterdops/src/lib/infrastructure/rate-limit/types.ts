/**
 * OsterdOps — Rate Limiter Infrastructure Types (Phase 14)
 */

export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
  organizationId?: string;
  projectId?: string;
  endpoint?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  limit: number;
}

export interface RateLimitProvider {
  name: "memory" | "redis";
  consume(key: string, options?: RateLimitOptions): Promise<RateLimitResult> | RateLimitResult;
  reset(key: string): Promise<void> | void;
  getStatus(key: string, options?: RateLimitOptions): Promise<RateLimitResult | null> | RateLimitResult | null;
}

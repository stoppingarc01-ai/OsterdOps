/**
 * OsterdOps — Environment Variable Accessor (Phase 14)
 * Type-safe access to application configuration without secret leakage.
 */

export const env = {
  get nodeEnv(): string {
    return process.env.NODE_ENV || "development";
  },

  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },

  get isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  },

  get isTest(): boolean {
    return process.env.NODE_ENV === "test";
  },

  get appVersion(): string {
    return process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
  },

  get rateLimitProvider(): "memory" | "redis" {
    return (process.env.OSTERDOPS_RATE_LIMIT_PROVIDER as "memory" | "redis") || "memory";
  },

  get isStripeConfigured(): boolean {
    return Boolean(
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_SECRET_KEY.startsWith("sk_")
    );
  },

  get isRedisConfigured(): boolean {
    return Boolean(process.env.REDIS_URL || process.env.KV_REST_API_URL);
  },
};

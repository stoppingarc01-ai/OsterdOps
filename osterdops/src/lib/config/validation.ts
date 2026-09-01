/**
 * OsterdOps — Configuration & Startup Validation Engine (Phase 14)
 * Validates environment dependencies across environments without exposing raw secret values.
 */

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  environment: string;
  details: Record<string, { status: "OK" | "MISSING" | "OPTIONAL" | "WARNING"; category: string }>;
}

export function validateConfiguration(
  envMap: Record<string, string | undefined> = process.env
): ConfigValidationResult {
  const isProd = envMap.NODE_ENV === "production";
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: Record<string, { status: "OK" | "MISSING" | "OPTIONAL" | "WARNING"; category: string }> = {};

  // 1. Firebase Admin Configuration
  const hasFirebaseProject = Boolean(envMap.FIREBASE_PROJECT_ID || envMap.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  if (isProd && !hasFirebaseProject) {
    errors.push("FIREBASE_PROJECT_ID is required in production.");
    details["FIREBASE_PROJECT_ID"] = { status: "MISSING", category: "Database" };
  } else {
    details["FIREBASE_PROJECT_ID"] = { status: hasFirebaseProject ? "OK" : "OPTIONAL", category: "Database" };
  }

  // 2. Encryption Key for Provider Credentials
  const hasKey = Boolean(envMap.ENCRYPTION_KEY || envMap.PROVIDER_ENCRYPTION_SECRET);
  if (isProd && !hasKey) {
    errors.push("ENCRYPTION_KEY is required in production for secure AES-256-GCM credential storage.");
    details["ENCRYPTION_KEY"] = { status: "MISSING", category: "Security" };
  } else {
    details["ENCRYPTION_KEY"] = { status: hasKey ? "OK" : "OPTIONAL", category: "Security" };
  }

  // 3. Billing Provider Configuration
  const stripeSecret = envMap.STRIPE_SECRET_KEY;
  if (stripeSecret) {
    if (!stripeSecret.startsWith("sk_")) {
      warnings.push("STRIPE_SECRET_KEY format looks invalid (should begin with 'sk_').");
      details["STRIPE_SECRET_KEY"] = { status: "WARNING", category: "Billing" };
    } else {
      details["STRIPE_SECRET_KEY"] = { status: "OK", category: "Billing" };
    }
  } else {
    details["STRIPE_SECRET_KEY"] = { status: "OPTIONAL", category: "Billing" };
  }

  // 4. Rate Limiting Mode Configuration
  const rateLimitProvider = envMap.OSTERDOPS_RATE_LIMIT_PROVIDER;
  if (rateLimitProvider === "redis") {
    const hasRedis = Boolean(envMap.REDIS_URL || envMap.KV_REST_API_URL);
    if (!hasRedis) {
      warnings.push("OSTERDOPS_RATE_LIMIT_PROVIDER is set to 'redis' but REDIS_URL is not configured (will fall back to memory).");
      details["REDIS_URL"] = { status: "WARNING", category: "Infrastructure" };
    } else {
      details["REDIS_URL"] = { status: "OK", category: "Infrastructure" };
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    environment: envMap.NODE_ENV || "development",
    details,
  };
}

export function validateStartupConfiguration(): ConfigValidationResult {
  return validateConfiguration(process.env);
}

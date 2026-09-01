/**
 * OsterdOps — Phase 14: Configuration & Startup Validation Unit Tests
 */

import { validateConfiguration } from "@/lib/config/validation";

export function testConfigurationValidation() {
  // 1. Development environment (lenient defaults)
  const devConfig = validateConfiguration({
    NODE_ENV: "development",
  });
  if (!devConfig.valid) {
    throw new Error("Development config should be valid without production secrets.");
  }

  // 2. Production environment with missing required secrets
  const invalidProdConfig = validateConfiguration({
    NODE_ENV: "production",
  });
  if (invalidProdConfig.valid || invalidProdConfig.errors.length === 0) {
    throw new Error("Production config without Firebase or Encryption key should fail validation.");
  }

  // 3. Production environment with required configuration
  const validProdConfig = validateConfiguration({
    NODE_ENV: "production",
    FIREBASE_PROJECT_ID: "osterdops-prod",
    ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  });
  if (!validProdConfig.valid) {
    throw new Error(`Valid production config failed: ${JSON.stringify(validProdConfig.errors)}`);
  }

  // 4. Invalid Stripe secret format warning
  const warningConfig = validateConfiguration({
    NODE_ENV: "development",
    STRIPE_SECRET_KEY: "invalid_key_format",
  });
  if (warningConfig.warnings.length === 0) {
    throw new Error("Invalid Stripe key format should generate a warning.");
  }
}

export function runConfigTests() {
  testConfigurationValidation();
}

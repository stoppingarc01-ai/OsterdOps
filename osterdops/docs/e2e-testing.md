# OsterdOps — End-to-End Testing Guide

## 1. Overview
End-to-End (E2E) testing in OsterdOps validates complete multi-step user, administrative, and developer journeys across the entire system. E2E tests ensure that all subsystems interact coherently, state transitions are persistent and deterministic, and multi-tenant security guarantees are maintained at every layer.

---

## 2. Core User Journeys

### Journey 1: New User Onboarding & Organization Setup
- **File**: `tests/e2e/phase26-user-onboarding.e2e.test.ts`
- **Flow**:
  1. User registers with valid email and name.
  2. Authentication context and secure session established.
  3. Default Organization created with user assigned the `OWNER` role.
  4. Default Workspace / Project created and bound to the new organization.
  5. Initial production API key generated with single-reveal masking and SHA-256 hash storage.
  6. Multi-tenant boundaries verified to prevent unauthorized access to external tenant resources.

### Journey 2: Team Member Management & RBAC Lifecycle
- **File**: `tests/e2e/phase26-team-management.e2e.test.ts`
- **Flow**:
  1. Organization OWNER invites a new member with a specified role (`VIEWER`, `DEVELOPER`, `ADMIN`).
  2. Member receives and accepts the invitation token.
  3. 4-tier RBAC hierarchy strictly enforced:
     - `VIEWER`: Read-only access to analytics and dashboards.
     - `DEVELOPER`: API key generation, gateway execution, and log viewing.
     - `ADMIN`: Project management, member role updates, and budget allocation.
     - `OWNER`: Full administrative control, billing management, and organization deletion.
  4. Role updates, member revocations, and sole-owner departure protections verified.

### Journey 3: Project Lifecycle & Spend Management
- **File**: `tests/e2e/phase26-project-lifecycle.e2e.test.ts`
- **Flow**:
  1. Project created with dedicated name, slug, and monthly spend cap.
  2. API keys minted and tied to the project scope.
  3. AI Gateway requests executed through the project, accumulating token usage and USD spend.
  4. Project configuration and spend caps updated dynamically.
  5. Project safely archived, immediately causing subsequent gateway requests to return HTTP 403.

### Journey 4: API Key Lifecycle & Cryptographic Security
- **File**: `tests/e2e/phase26-api-key-lifecycle.e2e.test.ts`
- **Flow**:
  1. API key created with `ost_live_` or `ost_test_` prefix.
  2. Plaintext secret returned strictly once; SHA-256 hash stored in database.
  3. Timing-safe authentication resolves key metadata, organization, and project IDs.
  4. Key rotation issues a new key while maintaining operational continuity.
  5. Key revocation or expiration immediately blocks further gateway access.

### Journey 5: AI Gateway 14-Stage Execution Pipeline
- **File**: `tests/e2e/phase26-gateway-happy-path.e2e.test.ts`
- **Flow**:
  1. Inbound request receives unique `X-Request-ID` correlation identifier.
  2. API Key authenticated and project association validated.
  3. Rate limiting and budget hard limits evaluated.
  4. Request body validated against model capabilities catalog.
  5. Provider adapter normalizes request and forwards to upstream AI model.
  6. Upstream response parsed, token usage extracted, and exact cost calculated.
  7. Zero-prompt & zero-secret persistence verified across all telemetry logs.

### Journey 6: AI Gateway Failure Paths & Status Code Normalization
- **File**: `tests/e2e/phase26-gateway-failure-paths.e2e.test.ts`
- **Flow**:
  1. Validates 20+ canonical failure scenarios across authentication, validation, routing, quotas, and upstream providers.
  2. Strict mapping to normalized HTTP status codes (400, 401, 403, 404, 422, 429, 502, 503, 504).
  3. Response payload formatted using RFC-compliant `StandardApiError` structure.
  4. Complete redaction of internal credentials, bearer tokens, and prompt completions.

---

## 3. Running E2E Test Suites

To execute all E2E suites as part of the unified test harness:
```bash
npm run test
```

To run a specific test suite directly:
```bash
npx tsx tests/run-tests.ts
```

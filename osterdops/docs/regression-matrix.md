# OsterdOps — Full Regression Test Matrix

## 1. Executive Summary
This regression matrix catalogs all test suites across OsterdOps, documenting the target domain, test scope, file path, and core invariants validated.

---

## 2. Regression Suites

| Suite ID | Domain | File Path | Scope & Assertions |
|---|---|---|---|
| **E2E-01** | User Onboarding | `tests/e2e/phase26-user-onboarding.e2e.test.ts` | Registration, session establishment, Org owner role, default workspace, tenant isolation |
| **E2E-02** | Team Management | `tests/e2e/phase26-team-management.e2e.test.ts` | Member invitations, 4-tier RBAC (`OWNER`/`ADMIN`/`DEVELOPER`/`VIEWER`), sole-owner protection |
| **E2E-03** | Project Lifecycle | `tests/e2e/phase26-project-lifecycle.e2e.test.ts` | Project creation, spend cap enforcement, request accumulation, archiving, post-archive 403 |
| **E2E-04** | API Key Security | `tests/e2e/phase26-api-key-lifecycle.e2e.test.ts` | Single reveal, SHA-256 hash storage, timing-safe authentication, rotation grace, revocation |
| **E2E-05** | Gateway Happy Path | `tests/e2e/phase26-gateway-happy-path.e2e.test.ts` | 14-stage execution, token extraction, exact pricing calculation, correlation ID propagation |
| **E2E-06** | Gateway Failures | `tests/e2e/phase26-gateway-failure-paths.e2e.test.ts` | 20+ canonical failure scenarios, status code normalization (400-504), secret scrubbing |
| **E2E-07** | Provider Routing | `tests/e2e/phase26-provider-routing.e2e.test.ts` | 9-provider resolver, model capability parameter checks, unrecognized model rejection |
| **E2E-08** | Rate Limiting | `tests/e2e/phase26-rate-limit.e2e.test.ts` | Sliding window burst control, tenant isolation, HTTP 429 response formatting, memory fallback |
| **E2E-09** | Budget Enforcement | `tests/e2e/phase26-budget-enforcement.e2e.test.ts` | Soft thresholds (50%/75%/90%), alert deduplication, 100% hard limit block, UTC period boundaries |
| **E2E-10** | Usage & Cost Pipeline | `tests/e2e/phase26-usage-cost-pipeline.e2e.test.ts` | Synchronized record ingestion, replay idempotency, 0-cost failed requests, aggregate analytics |
| **E2E-11** | Alerting & Obs. | `tests/e2e/phase26-alerting-observability.e2e.test.ts` | Alert lifecycle transitions, metric counters/gauges, comprehensive sensitive key scrubbing |
| **E2E-12** | Multi-Tenant Security | `tests/e2e/phase26-security-multitenant.e2e.test.ts` | Cross-tenant data isolation, privilege escalation rejection, tamper-evident hash chaining |
| **E2E-13** | Admin & Dev Platform | `tests/e2e/phase26-admin-developer.e2e.test.ts` | Server-side RBAC validation, SDK client execution, OpenAPI 3.1.0 contract parity |
| **E2E-14** | Privacy & Jobs | `tests/e2e/phase26-privacy-audit-jobs.e2e.test.ts` | Privacy export checksum, deletion state machine, legal hold block, durable job queue retry & DLQ |
| **E2E-15** | Concurrency & Chaos | `tests/e2e/phase26-concurrency-failure-injection.e2e.test.ts` | TOCTOU budget race simulation, parallel rate limit bursts, non-critical fault tolerance |
| **SYS-01** | Core API & Security | `tests/unit/*.test.ts` | 100+ comprehensive unit suites validating cryptography, Firestore schemas, tokens, and routing |

---

## 3. Automated Quality Gate Assertions

Every CI/CD pipeline and release deployment runs the full suite of quality gates:
1. `npm run test` (100% passing)
2. `npx tsc --noEmit` (0 type errors)
3. `npm run lint` (0 lint errors)
4. `npm run build` (118 routes compiled and optimized)

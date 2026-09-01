/**
 * OsterdOps — Test Runner
 */

import { testRoleHierarchy } from "./unit/rbac.test";
import {
  testValidAuthentication,
  testInvalidAuthentication,
  testExpiredToken,
  testOrganizationMembership,
  testOwnerPermissions,
  testAdminPermissions,
  testDeveloperPermissions,
  testViewerPermissions,
  testCrossOrganizationAccessRejection,
} from "./unit/auth-rbac.test";
import {
  testProjectCreation,
  testDuplicateSlugPrevention,
  testProjectListing,
  testProjectUpdate,
  testProjectArchiving,
  testInvalidProjectPayloads,
  testCrossOrganizationAccessRejection as testProjectCrossTenantRejection,
  testProjectRbacRoles,
  testProjectAuditLogging,
} from "./unit/projects.test";
import { testApiKeySecurity } from "./unit/api-key.test";
import { testCostEngine } from "./unit/cost-engine.test";
import { testProviderAdapters } from "./unit/adapters.test";
import { testBudgetAndAlertEngine } from "./unit/budget-engine.test";
import { testAnalyticsAndRecommendations } from "./unit/analytics-recommendations.test";
import { runProviderConnectionTests } from "./unit/provider-connections.test";
import { runGatewayTests } from "./unit/gateway.test";
import { runUsageTests } from "./unit/usage.test";
import { runBudgetTests } from "./unit/budget.test";
import { runAnalyticsTests } from "./unit/analytics.test";
import { runAlertsTests } from "./unit/alerts.test";
import { runNotificationsTests } from "./unit/notifications.test";
import { runBillingTests } from "./unit/billing.test";
import { runSubscriptionTests } from "./unit/subscription.test";
import { runInvoiceTests } from "./unit/invoice.test";
import { runBillingProviderTests } from "./unit/billing-provider.test";
import { runBillingWebhookTests } from "./unit/billing-webhook.test";
import { runRateLimitTests } from "./unit/rate-limit.test";
import { runJobQueueTests } from "./unit/jobs.test";
import { runRetryTests } from "./unit/retry.test";
import { runConfigTests } from "./unit/config.test";
import { runLoggingRedactionTests } from "./unit/logging-redaction.test";
import { runMetricsTests } from "./unit/metrics.test";
import { runHealthTests } from "./unit/health.test";
import { runDiagnosticsTests } from "./unit/diagnostics.test";
import { runReconciliationTests } from "./unit/reconciliation.test";
import { runRequestCorrelationTests } from "./unit/request-correlation.test";
import { runSecurityHeadersTests } from "./unit/security-headers.test";
import { runRequestSecurityTests } from "./unit/request-security.test";
import { runApiKeySecurityTests } from "./unit/api-key-security.test";
import { runSessionSecurityTests } from "./unit/session-security.test";
import { runSecurityEventsTests } from "./unit/security-events.test";
import { runAuditIntegrityTests } from "./unit/audit-integrity.test";
import { runSecretScannerTests } from "./unit/secret-scanner.test";
import { runRetentionTests } from "./unit/retention.test";
import { runPrivacyExportTests } from "./unit/privacy-export.test";
import { runPrivacyDeletionTests } from "./unit/privacy-deletion.test";
import { runSecurityPostureTests } from "./unit/security-posture.test";
import { runSecurityRbacTests } from "./unit/security-rbac.test";
import { runWebhookSecurityHardeningTests } from "./unit/webhook-security-hardening.test";
import { runFrontendApiClientTests } from "./unit/frontend-api-client.test";
import { runFrontendRbacGuardTests } from "./unit/frontend-rbac-guard.test";
import { runFrontendStateManagementTests } from "./unit/frontend-state-management.test";
import { runFrontendKeyPresentationTests } from "./unit/frontend-key-presentation.test";
import { runSdkClientTests } from "./unit/sdk-client.test";
import { runSdkMethodsTests } from "./unit/sdk-methods.test";
import { runSdkErrorsTests } from "./unit/sdk-errors.test";
import { runOpenApiSpecTests } from "./unit/openapi-spec.test";
import { runDeveloperExperienceTests } from "./unit/developer-experience.test";
import { runApiVersioningTests } from "./unit/api-versioning.test";
import { runApiErrorsTests } from "./unit/api-errors.test";
import { runPaginationTests } from "./unit/pagination.test";
import { runIdempotencyTests } from "./unit/idempotency.test";
import { runApiKeysPlatformTests } from "./unit/api-keys.test";
import { runApiKeyScopesTests } from "./unit/api-key-scopes.test";
import { runApiRateLimitTests } from "./unit/api-rate-limit.test";
import { runApiEntitlementsTests } from "./unit/api-entitlements.test";
import { runWebhookEventsTests } from "./unit/webhook-events.test";
import { runWebhookSignatureTests } from "./unit/webhook-signature.test";
import { runApiSecurityTests } from "./unit/api-security.test";
import { runApiRbacTests } from "./unit/api-rbac.test";
import { runApiRedactionTests } from "./unit/api-redaction.test";
import { runControlPlaneTests } from "./unit/control-plane.test";
import { runDashboardRbacTests } from "./unit/dashboard-rbac.test";
import { runApiKeyUiSecurityTests } from "./unit/api-key-ui-security.test";
import { runBudgetUiTests } from "./unit/budget-ui.test";
import { runBillingUiTests } from "./unit/billing-ui.test";
import { runSecurityUiTests } from "./unit/security-ui.test";
import { runNavigationRbacTests } from "./unit/navigation-rbac.test";
import { runIntegrationRegistryTests } from "./unit/integration-registry.test";
import { runIntegrationCredentialsTests } from "./unit/integration-credentials.test";
import { runIntegrationSecurityTests } from "./unit/integration-security.test";
import { runWebhookDestinationTests } from "./unit/webhook-destination.test";
import { runSsrfProtectionTests } from "./unit/ssrf-protection.test";
import { runEventSubscriptionsTests } from "./unit/event-subscriptions.test";
import { runAutomationRulesTests } from "./unit/automation-rules.test";
import { runAutomationConditionsTests } from "./unit/automation-conditions.test";
import { runAutomationActionsTests } from "./unit/automation-actions.test";
import { runWorkflowEngineTests } from "./unit/workflow-engine.test";
import { runWorkflowRetryTests } from "./unit/workflow-retry.test";
import { runIntegrationDeliveryTests } from "./unit/integration-delivery.test";
import { runIntegrationIdempotencyTests } from "./unit/integration-idempotency.test";
import { runIntegrationRbacTests } from "./unit/integration-rbac.test";
import { runIntegrationEntitlementsTests } from "./unit/integration-entitlements.test";
import { runIntegrationRedactionTests } from "./unit/integration-redaction.test";
import { runGatewayE2ETests } from "./e2e/gateway.e2e.test";
import { runBillingE2ETests } from "./e2e/billing.e2e.test";
import { runBudgetE2ETests } from "./e2e/budget.e2e.test";
import { runSecurityE2ETests } from "./e2e/security.e2e.test";
import { runAnalyticsE2ETests } from "./e2e/analytics.e2e.test";
import { runDependenciesTests } from "./integration/dependencies.test";
import { runIntegrationEngineTests } from "./integration/integration.test";
import { runProviderChaosTests } from "./chaos/provider-failure.test";
import { runDatabaseChaosTests } from "./chaos/database-failure.test";
import { runRateLimitStormTests } from "./chaos/rate-limit-storm.test";
import { runLoadValidationTests } from "./load/load-validation.test";
import { runRealProvidersTests } from "./gateway/real-providers.test";
import { runStreamingTests } from "./gateway/streaming.test";
import { runModelCatalogTests } from "./gateway/model-catalog.test";
import { runRetryTimeoutTests } from "./gateway/retry-timeout.test";
import { runLiveOptInTests } from "./gateway/live-optin.test";
import { runDeveloperApiKeyTests } from "./developer/api-keys.test";
import { runDeveloperPlaygroundTests } from "./developer/playground.test";
import { runDeveloperRequestLogsTests } from "./developer/request-logs.test";
import { runDeveloperRateLimitsTests } from "./developer/rate-limits.test";
import { runDeveloperApiDocumentationTests } from "./developer/api-documentation.test";
import { runOrganizationAdminTests } from "./admin/organization-admin.test";
import { runMemberRbacTests } from "./admin/member-rbac.test";
import { runProjectAdminTests } from "./admin/project-admin.test";
import { runBudgetAdminTests } from "./admin/budget-admin.test";
import { runSecurityAdminTests } from "./admin/security-admin.test";
import { runDeveloperOpenApiSpecTests } from "./developer/openapi-spec.test";
import { runE2EDeveloperJourneyTests } from "./developer/e2e-developer-journey.test";
import { runUserOnboardingE2ETests } from "./e2e/phase26-user-onboarding.e2e.test";
import { runTeamManagementE2ETests } from "./e2e/phase26-team-management.e2e.test";
import { runProjectLifecycleE2ETests } from "./e2e/phase26-project-lifecycle.e2e.test";
import { runApiKeyLifecycleE2ETests } from "./e2e/phase26-api-key-lifecycle.e2e.test";
import { runGatewayHappyPathE2ETests } from "./e2e/phase26-gateway-happy-path.e2e.test";
import { runGatewayFailurePathsE2ETests } from "./e2e/phase26-gateway-failure-paths.e2e.test";
import { runProviderRoutingE2ETests } from "./e2e/phase26-provider-routing.e2e.test";
import { runRateLimitE2ETests } from "./e2e/phase26-rate-limit.e2e.test";
import { runBudgetEnforcementE2ETests } from "./e2e/phase26-budget-enforcement.e2e.test";
import { runUsageCostPipelineE2ETests } from "./e2e/phase26-usage-cost-pipeline.e2e.test";
import { runAlertingObservabilityE2ETests } from "./e2e/phase26-alerting-observability.e2e.test";
import { runSecurityMultitenantE2ETests } from "./e2e/phase26-security-multitenant.e2e.test";
import { runAdminDeveloperE2ETests } from "./e2e/phase26-admin-developer.e2e.test";
import { runPrivacyAuditJobsE2ETests } from "./e2e/phase26-privacy-audit-jobs.e2e.test";
import { runConcurrencyFailureInjectionE2ETests } from "./e2e/phase26-concurrency-failure-injection.e2e.test";
import { runPerformanceBenchmarks } from "./performance/benchmarks.test";
import { runPhase27LoadScenariosTests } from "./load/phase27-load-scenarios.test";
import { runCircuitBreakerTests } from "./unit/circuit-breaker.test";
import { runSloTrackerTests } from "./unit/slo-tracker.test";
import { runRequestContextTests } from "./unit/request-context.test";
import { runShutdownTests } from "./unit/shutdown.test";
import { runGatewayMetricsTests } from "./unit/gateway-metrics.test";
import { runPhase29ResilienceTests } from "./chaos/phase29-resilience-scenarios.test";

async function runAll() {
  console.log("=== Running OsterdOps Backend, Auth & Project Tests ===");

  try {
    // 1. Core RBAC hierarchy
    testRoleHierarchy();
    console.log("✔ RBAC Hierarchy Tests passed.");

    // 2. Authentication and Token Verification
    testValidAuthentication();
    console.log("✔ Valid Authentication & Token Extraction Tests passed.");

    testInvalidAuthentication();
    console.log("✔ Invalid Authentication Rejection Tests passed.");

    testExpiredToken();
    console.log("✔ Expired Token Rejection Tests passed.");

    // 3. Organization Membership & Multi-tenancy
    testOrganizationMembership();
    console.log("✔ Organization Membership Verification Tests passed.");

    // 4. Role Permissions (OWNER, ADMIN, DEVELOPER, VIEWER)
    testOwnerPermissions();
    console.log("✔ OWNER Permission Matrix Tests passed.");

    testAdminPermissions();
    console.log("✔ ADMIN Permission Matrix & Restriction Tests passed.");

    testDeveloperPermissions();
    console.log("✔ DEVELOPER Permission Matrix & Restriction Tests passed.");

    testViewerPermissions();
    console.log("✔ VIEWER Read-only Permission Matrix Tests passed.");

    // 5. Cross-Organization Access Rejection
    testCrossOrganizationAccessRejection();
    console.log("✔ Cross-Organization Multi-tenant Rejection Tests passed.");

    // 6. Project Management Tests (Phase 4)
    testProjectCreation();
    console.log("✔ Project Creation & Slug Generation Tests passed.");

    testDuplicateSlugPrevention();
    console.log("✔ Project Slug Uniqueness & Collision Prevention Tests passed.");

    testProjectListing();
    console.log("✔ Project Listing (Active vs Archived) Tests passed.");

    testProjectUpdate();
    console.log("✔ Project Update Tests passed.");

    testProjectArchiving();
    console.log("✔ Safe Project Archiving Tests passed.");

    testInvalidProjectPayloads();
    console.log("✔ Project Payload Validation Tests passed.");

    testProjectCrossTenantRejection();
    console.log("✔ Cross-Tenant Project Isolation Tests passed.");

    testProjectRbacRoles();
    console.log("✔ Project RBAC Permission Matrix Tests passed.");

    testProjectAuditLogging();
    console.log("✔ Project Audit Logging Verification Tests passed.");

    // 7. Security and engine tests
    testApiKeySecurity();
    console.log("✔ API Key Cryptographic Security & Hashing Tests passed.");

    testCostEngine();
    console.log("✔ Cost Engine & Pricing Registry Tests passed.");

    testProviderAdapters();
    console.log("✔ AI Provider Adapters & Response Normalization Tests passed.");

    testBudgetAndAlertEngine();
    console.log("✔ Budget Thresholds & Alert Deduplication Engine Tests passed.");

    testAnalyticsAndRecommendations();
    console.log("✔ Analytics Aggregation & Optimization Heuristics Tests passed.");

    // 8. Provider Connections (Phase 6)
    await runProviderConnectionTests();
    console.log("✔ Provider Connections, AES-256-GCM & Validation Tests passed.");

    // 9. AI Gateway (Phase 7)
    runGatewayTests();
    console.log("✔ AI Gateway Request Validation, Routing & Error Normalization Tests passed.");

    // 10. Usage & Token Tracking (Phase 8)
    runUsageTests();
    console.log("✔ Usage & Token Tracking, Idempotency & Aggregation Tests passed.");

    // 11. Budgets, Spend Limits & Alert Engine (Phase 10)
    runBudgetTests();
    console.log("✔ Budgets, Spend Limits, Alert Deduplication & Lifecycle Tests passed.");

    // 12. Analytics, Observability & Metrics Engine (Phase 11)
    runAnalyticsTests();
    console.log("✔ Analytics KPIs, Latency Percentiles, Cache Metrics & Slices Tests passed.");

    // 13. Budget Enforcement, Alerts & Notification Engine (Phase 12)
    runAlertsTests();
    console.log("✔ Alert Deduplication, Lifecycle & Severity Tests passed.");

    await runNotificationsTests();
    console.log("✔ Multi-Channel Notification Dispatch & Preferences Tests passed.");

    // 14. Billing, Subscriptions & Revenue Engine (Phase 13)
    runBillingTests();
    console.log("✔ Billing Plans Registry, Entitlements, UTC Periods & Integer Math Tests passed.");

    runSubscriptionTests();
    console.log("✔ Subscription Lifecycle, Trial Periods & Plan Upgrades Tests passed.");

    runInvoiceTests();
    console.log("✔ Invoice Line Items, Idempotency & Status Transitions Tests passed.");

    await runBillingProviderTests();
    console.log("✔ Stripe Provider Abstraction & Checkout Session Tests passed.");

    runBillingWebhookTests();
    console.log("✔ Stripe Webhook HMAC-SHA256 Signature Verification & Idempotency Tests passed.");

    // 15. Production Operations, Reliability & Launch Readiness (Phase 14)
    runRateLimitTests();
    console.log("✔ Distributed Rate Limiter & Redis Fallback Tests passed.");

    await runJobQueueTests();
    console.log("✔ Durable Job Queue, Idempotency & Dead-Letter Handling Tests passed.");

    runRetryTests();
    console.log("✔ Exponential Backoff & Error Classification Policy Tests passed.");

    runConfigTests();
    console.log("✔ Configuration & Startup Validation Tests passed.");

    runLoggingRedactionTests();
    console.log("✔ Structured Logging & Sensitive Data Redaction Tests passed.");

    runMetricsTests();
    console.log("✔ Operational Metrics & Bounded Labels Tests passed.");

    runHealthTests();
    console.log("✔ Liveness & Readiness Probes Tests passed.");

    runDiagnosticsTests();
    console.log("✔ System Diagnostics & RBAC Verification Tests passed.");

    runReconciliationTests();
    console.log("✔ Billing Reconciliation Engine & Discrepancy Detection Tests passed.");

    runRequestCorrelationTests();
    console.log("✔ Request Correlation ID Propagation Tests passed.");

    // 16. Security Hardening, Compliance & Enterprise Trust Engine (Phase 15)
    runSecurityHeadersTests();
    console.log("✔ Security Headers & CSP Policies Tests passed.");

    runRequestSecurityTests();
    console.log("✔ Request Security, Size Limits, Origin & IP Hashing Tests passed.");

    runApiKeySecurityTests();
    console.log("✔ API Key Cryptographic Security & Timing-Safe Match Tests passed.");

    runSessionSecurityTests();
    console.log("✔ Session Security, Token Expiration & Privileged Action Tests passed.");

    await runSecurityEventsTests();
    console.log("✔ Security Event Engine & Normalization Tests passed.");

    runAuditIntegrityTests();
    console.log("✔ Tamper-Evident Audit Log Hash Chaining Tests passed.");

    runSecretScannerTests();
    console.log("✔ Secret Scanner & Credential Leak Prevention Tests passed.");

    runRetentionTests();
    console.log("✔ Data Retention Engine & Legal Hold Protection Tests passed.");

    await runPrivacyExportTests();
    console.log("✔ Privacy Data Export Manifest Tests passed.");

    await runPrivacyDeletionTests();
    console.log("✔ Privacy Deletion Workflow & Approval State Machine Tests passed.");

    await runSecurityPostureTests();
    console.log("✔ Security Posture Evaluation & Checks Tests passed.");

    runSecurityRbacTests();
    console.log("✔ Security RBAC & Permission Matrix Tests passed.");

    runWebhookSecurityHardeningTests();
    console.log("✔ Webhook Security Hardening & Replay Protection Tests passed.");

    // 17. Enterprise Control Center & Frontend Integration (Phase 16)
    await runFrontendApiClientTests();
    console.log("✔ Frontend API Client, Correlation ID & Header Propagation Tests passed.");

    runFrontendRbacGuardTests();
    console.log("✔ Frontend RBAC Action Guarding Tests passed.");

    runFrontendStateManagementTests();
    console.log("✔ Frontend State Transitions & Control Logic Tests passed.");

    runFrontendKeyPresentationTests();
    console.log("✔ Frontend API Key One-Time Presentation & Masking Tests passed.");

    // 18. Developer Experience, SDKs & OpenAPI Documentation (Phase 17)
    await runSdkClientTests();
    console.log("✔ TypeScript SDK Client Initialization & Transport Tests passed.");

    await runSdkMethodsTests();
    console.log("✔ TypeScript SDK Typed Resource Method Tests passed.");

    await runSdkErrorsTests();
    console.log("✔ TypeScript SDK Typed Errors, Status Mapping & Secret Redaction Tests passed.");

    await runOpenApiSpecTests();
    console.log("✔ OpenAPI 3.1.0 Specification Parity & Schema Tests passed.");

    await runDeveloperExperienceTests();
    console.log("✔ Developer Experience, Webhook Signatures & Privacy Guarantee Tests passed.");

    // 19. Enterprise API Platform, Versioning, Idempotency & SDK Engine (Phase 18)
    runApiVersioningTests();
    console.log("✔ API Version Registry, Negotiation & Header Tests passed.");

    runApiErrorsTests();
    console.log("✔ Standard API Error Engine & Sanitization Tests passed.");

    runPaginationTests();
    console.log("✔ Cursor-Based Pagination & Tenant Isolation Tests passed.");

    await runIdempotencyTests();
    console.log("✔ Enterprise Idempotency Engine, Collision & Replay Tests passed.");

    runApiKeysPlatformTests();
    console.log("✔ API Key Cryptographic Security & Hashing Tests passed.");

    runApiKeyScopesTests();
    console.log("✔ API Key Scopes, RBAC Matrix & Privilege Escalation Prevention Tests passed.");

    runApiRateLimitTests();
    console.log("✔ API Rate Limit 429 Header & Response Standardization Tests passed.");

    runApiEntitlementsTests();
    console.log("✔ Plan Entitlements & Feature Gating Tests passed.");

    runWebhookEventsTests();
    console.log("✔ Developer Webhook Event Factory & Data Sanitization Tests passed.");

    runWebhookSignatureTests();
    console.log("✔ Webhook HMAC-SHA256 Timing-Safe Signature & Replay Protection Tests passed.");

    runApiSecurityTests();
    console.log("✔ API Security, Request Correlation & Header Propagation Tests passed.");

    runApiRbacTests();
    console.log("✔ API RBAC Permission Hierarchy Tests passed.");

    runApiRedactionTests();
    console.log("✔ API Secret Redaction & Log Security Tests passed.");

    // 20. Enterprise Control Plane, Admin Console & Governance UI (Phase 19)
    runControlPlaneTests();
    console.log("✔ Enterprise Control Plane & Client Authorization Tests passed.");

    runDashboardRbacTests();
    console.log("✔ Dashboard RBAC Action Guarding & Privileged Controls Tests passed.");

    runApiKeyUiSecurityTests();
    console.log("✔ API Key UI Single Reveal & Masking Tests passed.");

    runBudgetUiTests();
    console.log("✔ Budget UI State, Hard Enforcement & Threshold Tests passed.");

    runBillingUiTests();
    console.log("✔ Billing UI State, Plan Formatting & Permissions Tests passed.");

    runSecurityUiTests();
    console.log("✔ Security UI Posture Score & Evaluation Tests passed.");

    runNavigationRbacTests();
    console.log("✔ Navigation Hierarchy & Role Visibility Tests passed.");

    // 21. Enterprise Integrations, Automation & Workflow Engine (Phase 20)
    runIntegrationRegistryTests();
    console.log("✔ Integration Providers Registry & Adapter Tests passed.");

    await runIntegrationCredentialsTests();
    console.log("✔ Integration Credential Vault, Encryption & Masking Tests passed.");

    await runIntegrationSecurityTests();
    console.log("✔ Integration Security & Tenant Isolation Tests passed.");

    runWebhookDestinationTests();
    console.log("✔ Webhook Destination Validation Tests passed.");

    runSsrfProtectionTests();
    console.log("✔ Outbound SSRF Protection & Private IP Blocking Tests passed.");

    runEventSubscriptionsTests();
    console.log("✔ Event Subscriptions Matching & Wildcards Tests passed.");

    await runAutomationRulesTests();
    console.log("✔ Automation Rules CRUD & Lifecycle Tests passed.");

    runAutomationConditionsTests();
    console.log("✔ Declarative Condition Operators & Prototype Safety Tests passed.");

    await runAutomationActionsTests();
    console.log("✔ Automation Actions Execution & Rule Matching Tests passed.");

    await runWorkflowEngineTests();
    console.log("✔ Workflow Engine & Multi-Step Execution Tests passed.");

    await runWorkflowRetryTests();
    console.log("✔ Workflow Step Retries & Error Resilience Tests passed.");

    await runIntegrationDeliveryTests();
    console.log("✔ Integration Delivery Logs & Health Tests passed.");

    runIntegrationIdempotencyTests();
    console.log("✔ Integration Delivery Deterministic Idempotency Tests passed.");

    runIntegrationRbacTests();
    console.log("✔ Integration & Automation RBAC Permission Matrix Tests passed.");

    runIntegrationEntitlementsTests();
    console.log("✔ Integration Entitlements & Plan Limits Tests passed.");

    runIntegrationRedactionTests();
    console.log("✔ Integration Secret Redaction & Log Safety Tests passed.");

    // 22. End-to-End Testing, Integration Validation & Failure Simulation Engine (Phase 21)
    await runGatewayE2ETests();
    console.log("✔ Gateway End-to-End 14-Stage Lifecycle & Scenario Tests passed.");

    await runBillingE2ETests();
    console.log("✔ Billing Lifecycle, Overage & Invoice Calculation Tests passed.");

    await runBudgetE2ETests();
    console.log("✔ Budget Thresholds, Alert Deduplication & Hard Enforcement Tests passed.");

    await runSecurityE2ETests();
    console.log("✔ Security Posture, RBAC Guard & Privacy Guarantee Tests passed.");

    await runAnalyticsE2ETests();
    console.log("✔ High-Volume Analytics Aggregation & Percentile Tests passed.");

    runDependenciesTests();
    console.log("✔ Cross-Service Dependency Link Verifications passed.");

    await runIntegrationEngineTests();
    console.log("✔ Full Cross-Service Integration Verification Engine Tests passed.");

    await runProviderChaosTests();
    console.log("✔ AI Provider Outage & Chaos Simulation Tests passed.");

    await runDatabaseChaosTests();
    console.log("✔ Database Failure & Atomic Rollback Chaos Tests passed.");

    await runRateLimitStormTests();
    console.log("✔ Rate Limit Storm & Redis Outage Resilience Tests passed.");

    await runLoadValidationTests();
    console.log("✔ Synthetic Multi-Tenant Load Validation & Scorecard Tests passed.");

    // 23. Real AI Gateway Production Integration (Phase 22)
    await runRealProvidersTests();
    console.log("✔ Real AI Provider Adapters & Capability Tests passed.");

    await runStreamingTests();
    console.log("✔ Real-time SSE Streaming & Transformer Tests passed.");

    await runModelCatalogTests();
    console.log("✔ Model Capabilities Catalog & Parameter Validation Tests passed.");

    await runRetryTimeoutTests();
    console.log("✔ Resilient Transport, Retry & Timeout Policy Tests passed.");

    await runLiveOptInTests();
    console.log("✔ Live Provider Smoke Test Opt-In Safety Guard Tests passed.");

    // 24. Developer Platform & API Experience (Phase 23)
    runDeveloperApiKeyTests();
    console.log("✔ Developer API Key Management & Single-Reveal Tests passed.");

    runDeveloperPlaygroundTests();
    console.log("✔ Developer API Playground & Model Parameter Tests passed.");

    runDeveloperRequestLogsTests();
    console.log("✔ Developer Request Logs, Telemetry & Privacy Tests passed.");

    runDeveloperRateLimitsTests();
    console.log("✔ Developer Rate Limit & Quota Visibility Tests passed.");

    runDeveloperApiDocumentationTests();
    console.log("✔ Developer API Documentation & Contract Parity Tests passed.");

    // 25. Enterprise Administration & Control Center (Phase 24)
    runOrganizationAdminTests();
    console.log("✔ Organization Administration & Isolation Tests passed.");

    runMemberRbacTests();
    console.log("✔ Member Administration & RBAC Hierarchy Tests passed.");

    runProjectAdminTests();
    console.log("✔ Project Administration & Spend Limits Tests passed.");

    runBudgetAdminTests();
    console.log("✔ Budget Administration & Hard Enforcement Tests passed.");

    runSecurityAdminTests();
    console.log("✔ Security Posture & Tamper-Evident Audit Tests passed.");

    // 26. Developer Platform & Experience (Phase 25)
    runDeveloperOpenApiSpecTests();
    console.log("✔ Developer OpenAPI 3.1.0 Specification & Security Schemes Tests passed.");

    runE2EDeveloperJourneyTests();
    console.log("✔ End-to-End Developer Journey & Security Gates Tests passed.");

    // 27. End-to-End Testing, Integration Validation & Regression Hardening (Phase 26)
    console.log("\n=== Phase 26 — End-to-End Testing & Integration Hardening ===");
    runUserOnboardingE2ETests();
    runTeamManagementE2ETests();
    runProjectLifecycleE2ETests();
    runApiKeyLifecycleE2ETests();
    runGatewayHappyPathE2ETests();
    runGatewayFailurePathsE2ETests();
    runProviderRoutingE2ETests();
    runRateLimitE2ETests();
    runBudgetEnforcementE2ETests();
    runUsageCostPipelineE2ETests();
    runAlertingObservabilityE2ETests();
    runSecurityMultitenantE2ETests();
    runAdminDeveloperE2ETests();
    await runPrivacyAuditJobsE2ETests();
    await runConcurrencyFailureInjectionE2ETests();
    console.log("✔ All Phase 26 End-to-End & Integration Hardening Suites passed.");

    // 28. Performance, Scalability & Production Efficiency (Phase 27)
    console.log("\n=== Phase 27 — Performance, Scalability & Production Efficiency ===");
    runPerformanceBenchmarks();
    await runPhase27LoadScenariosTests();
    console.log("✔ All Phase 27 Performance & Load Scenarios passed.");

    // 29. Operational Hardening & Production Observability (Phase 28)
    console.log("\n=== Phase 28 — Operational Hardening & Production Observability ===");
    runCircuitBreakerTests();
    runSloTrackerTests();
    runRequestContextTests();
    await runShutdownTests();
    runGatewayMetricsTests();
    console.log("✔ All Phase 28 Operational Hardening & Observability Suites passed.");

    // 30. Production Reliability, Resilience & Disaster Readiness (Phase 29)
    await runPhase29ResilienceTests();
    console.log("✔ All Phase 29 Production Reliability & Disaster Readiness Suites passed.");

    console.log("\n=== All OsterdOps Backend & Project Management Tests Passed Successfully ===");
  } catch (err) {
    console.error("\n✖ Test failed:", err);
    process.exit(1);
  }
}

runAll();

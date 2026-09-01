# OsterdOps Security Event Monitoring & Alerting (Phase 15)

---

## 1. Normalized Security Event Types

| Event Type | Default Severity | Description |
| :--- | :--- | :--- |
| `AUTH_SUCCESS` | `INFO` | Successful user session token verification |
| `AUTH_FAILURE` | `MEDIUM` | Invalid or expired token presented |
| `SESSION_REVOKED` | `LOW` | Explicit session termination or logout |
| `API_KEY_CREATED` | `INFO` | New project API key generated |
| `API_KEY_ROTATED` | `INFO` | Zero-downtime key rotation initiated |
| `API_KEY_REVOKED` | `LOW` | API key marked revoked |
| `API_KEY_EXPIRED` | `LOW` | Expired key rejected |
| `API_KEY_AUTH_FAILED` | `HIGH` | Forged or invalid API key secret presented |
| `PERMISSION_DENIED` | `MEDIUM` | RBAC authorization guard rejected action |
| `CROSS_TENANT_ACCESS_BLOCKED` | `CRITICAL` | Attempt to access resource outside caller's organization |
| `RATE_LIMIT_TRIGGERED` | `MEDIUM` | Request rejected due to exceeded rate limit |
| `SUSPICIOUS_REQUEST` | `HIGH` | Malformed headers, excessive payload size, or injection |
| `BUDGET_REQUEST_BLOCKED` | `MEDIUM` | Gateway blocked request due to hard spend limit |
| `BILLING_SECURITY_EVENT` | `HIGH` | Unauthorized billing change or invalid payment payload |
| `WEBHOOK_SIGNATURE_FAILURE` | `HIGH` | Forged or tampered Stripe webhook signature |
| `SECURITY_CONFIGURATION_CHANGED`| `HIGH` | Organization security policy or origin list modified |

---

## 2. Automated Alert Dispatch
Events of severity `HIGH` or `CRITICAL` automatically trigger alert dispatch through the Phase 12 Alerting & Notification Engine to organization owners and administrators.

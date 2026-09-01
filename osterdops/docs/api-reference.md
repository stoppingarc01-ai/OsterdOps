# OsterdOps API Reference (v1)

Base URL: `https://api.osterdops.com`

---

## 1. Authentication

OsterdOps supports two authentication schemes:

- **OsterdOps Project API Key**: Sent via header `Authorization: Bearer osk_live_...` or `x-api-key: osk_live_...`. Used for Gateway inference and SDK access.
- **User JWT Session Token**: Sent via header `Authorization: Bearer <token>`. Used for dashboard management endpoints.

---

## 2. Endpoints Summary

### Gateway
- `POST /api/v1/chat/completions`: AI Gateway chat completion proxy with real-time cost calculation and budget enforcement.
- `POST /api/v1/gateway/chat/completions`: Public AI Gateway completion proxy with CORS preflight support.

### Projects
- `GET /api/v1/projects`: List active projects in caller's organization.
- `POST /api/v1/projects`: Create a new project (Requires ADMIN or OWNER).
- `GET /api/v1/projects/{projectId}`: Retrieve project details.
- `PATCH /api/v1/projects/{projectId}`: Update project metadata or spend limit.
- `DELETE /api/v1/projects/{projectId}`: Archive project.

### API Keys
- `GET /api/v1/projects/{projectId}/api-keys`: List project API keys (secrets omitted).
- `POST /api/v1/projects/{projectId}/api-keys`: Issue API key (plaintext secret returned EXACTLY ONCE).
- `POST /api/v1/projects/{projectId}/api-keys/{keyId}/revoke`: Revoke key immediately.
- `POST /api/v1/projects/{projectId}/api-keys/{keyId}/rotate`: Rotate key and issue replacement.

### Usage & Costs
- `GET /api/v1/usage`: Retrieve aggregated token breakdown and request volume.
- `GET /api/v1/projects/{projectId}/usage`: Retrieve project token usage.
- `GET /api/v1/costs`: Retrieve total cost and model breakdown.
- `GET /api/v1/projects/{projectId}/costs`: Retrieve project costs.

### Analytics
- `GET /api/v1/analytics/overview`: High-level metrics, cache hit rate, error rate, timeseries.
- `GET /api/v1/analytics/latency`: Latency percentiles (p50, p95, p99) by model.

### Budgets & Spend Caps
- `GET /api/v1/budgets`: List organization budgets.
- `POST /api/v1/budgets`: Create budget with spend limits and enforcement modes (`MONITOR` vs `BLOCK`).
- `GET /api/v1/budgets/{budgetId}`: Retrieve budget details.
- `POST /api/v1/budgets/{budgetId}/pause`: Pause budget evaluation.
- `POST /api/v1/budgets/{budgetId}/resume`: Resume budget evaluation.
- `POST /api/v1/budgets/{budgetId}/evaluate`: Trigger manual budget spend evaluation.

### Alerts
- `GET /api/v1/alerts`: List active and historical threshold alerts.
- `POST /api/v1/alerts/{alertId}/acknowledge`: Acknowledge alert.
- `POST /api/v1/alerts/{alertId}/resolve`: Resolve alert.

### System & Health
- `GET /api/health`: Liveness probe.
- `GET /api/ready`: Readiness probe.
- `GET /api/v1/system/health`: Platform operational health.
- `GET /api/v1/system/diagnostics`: Comprehensive system diagnostics (privilege gated).

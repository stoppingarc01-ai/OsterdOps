# OsterdOps — Organization Management

## 1. Organization Identity & Tenancy
Each enterprise tenant is provisioned with an isolated organization boundary (`organizationId`), primary authorized domain, URL slug, and plan tier.

### Core Properties
- `id`: Permanent tenant identifier (`org_...`)
- `name`: Organization display name
- `slug`: Subdomain or path slug
- `status`: `ACTIVE` | `SUSPENDED`
- `tier`: `Enterprise Scale`, `Growth`, `Developer`
- `defaultRateLimit`: Global RPM baseline across projects
- `defaultSpendLimit`: Default monthly spend cap ($USD) per project

---

## 2. Multi-Tenant Partitioning
All storage operations in OsterdOps (projects, keys, budgets, usage records, alerts, audit logs) require the tenant's `organizationId` predicate. Cross-tenant access is immediately blocked and logged to the security event engine.

# OsterdOps — Role-Based Access Control (RBAC) Reference

## 1. Role Hierarchy

```
OWNER (Level 4)
  │
  ├── ADMIN (Level 3)
  │     │
  │     ├── DEVELOPER (Level 2)
  │     │     │
  │     │     └── VIEWER (Level 1)
```

---

## 2. Permission Matrix

| Capability | OWNER | ADMIN | DEVELOPER | VIEWER |
|---|---|---|---|---|
| **Manage Organization & Billing** | ✅ | ❌ | ❌ | ❌ |
| **Invite & Promote Admins** | ✅ | ❌ | ❌ | ❌ |
| **Invite Developers / Viewers** | ✅ | ✅ | ❌ | ❌ |
| **Create & Archive Projects** | ✅ | ✅ | ❌ | ❌ |
| **Manage Budgets & Thresholds** | ✅ | ✅ | ❌ | ❌ |
| **Rotate & Revoke API Keys** | ✅ | ✅ | ❌ | ❌ |
| **Access API Playground & Logs** | ✅ | ✅ | ✅ | ❌ |
| **Generate Dev Keys** | ✅ | ✅ | ✅ | ❌ |
| **View Analytics & Dashboards** | ✅ | ✅ | ✅ | ✅ |

---

## 3. Privilege Escalation Guards
- Non-owners cannot promote themselves or others to `OWNER`.
- `ADMIN` cannot grant `ADMIN` or `OWNER` roles.
- Role checks are performed at both client UI (visual guard) and server API handler (authoritative guard).

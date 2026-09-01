# OsterdOps Enterprise UI Security & Data Privacy

The OsterdOps web dashboard operates under zero-trust enterprise security policies.

---

## 1. Zero-Content Retention Mandate

1. **Prompts & Completions**: Never sent to dashboard clients, never persisted in browser storage, and never logged in browser consoles.
2. **Raw Secrets**: Upstream provider API keys (OpenAI, Anthropic, Gemini, AWS, Azure), Stripe secrets, and OsterdOps API keys are never rendered in client DOM trees or transmitted in query parameters.

---

## 2. Client-Side Authorization Guarantees

- `can(permission, role)` and `<RbacGuard>` are used exclusively for conditional rendering of navigation items and action buttons.
- All mutating actions (invites, key creation, budget updates, cancellations) make authenticated requests to backend API endpoints where `requireOrganizationMember` and `hasPermission` enforce authorization server-side.
- Any attempt to bypass UI hiding results in an immediate HTTP `403 FORBIDDEN` error envelope with request ID correlation.

# OsterdOps — Integration Security, SSRF Protection & Zero-Trust Architecture

## 1. SSRF (Server-Side Request Forgery) Prevention

All outbound integration destinations and webhook URLs are validated prior to registration or dispatch:
- **Blocked Hostnames**: `localhost`, `127.0.0.1`, `::1`, `0.0.0.0`, `metadata.google.internal`, `169.254.169.254`.
- **Blocked IP Ranges**:
  - `10.0.0.0/8` (Private)
  - `172.16.0.0/12` (Private)
  - `192.168.0.0/16` (Private)
  - `169.254.0.0/16` (Link-Local)
  - `127.0.0.0/8` (Loopback)
- **Protocol Enforcement**: Outbound connections must use TLS (`https://`).

---

## 2. Zero-Content Retention

Neither prompts, completions, system instructions, authorization headers, nor Stripe secrets are ever included in integration dispatch bodies or persisted in delivery records.

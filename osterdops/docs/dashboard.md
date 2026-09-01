# OsterdOps Global Dashboard

Route: `/dashboard`

The global overview dashboard aggregates key AI infrastructure KPIs, real-time routing status, provider breakdowns, active guardrail alerts, and governance metrics.

---

## 1. Key Metrics & Widgets

- **Live Ticker Bar**: Real-time throughput, monthly spend rate, latency percentiles, and gateway availability.
- **Top 5 Stat Cards**:
  - Total Spend vs Plan Limit
  - Active Requests (RPM)
  - Total Tokens Processed (Prompt / Completion)
  - P95 / P99 Latency (ms)
  - Upstream Provider Error Rate (%)
- **Interactive Routing Pipeline**: Visual representation of the request path (Client -> Gateway -> Redaction -> Upstream Provider -> Token Telemetry).
- **Spend by Provider & Model**: Visual distribution across OpenAI, Anthropic, Gemini, Azure, and AWS Bedrock.
- **Active Alerts**: Real-time threshold warnings and budget limit violations.
- **Fast Command Palette**: Keyboard accessible (`Cmd+K` / `Ctrl+K`) global navigation.

import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <Section spacing="lg">
          <Container size="lg">
            <div className="flex flex-col items-center text-center">
              <Badge variant="primary" className="mb-6">
                Foundation Phase
              </Badge>

              <h1 className="text-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight max-w-3xl">
                OsterdOps
              </h1>

              <p className="mt-4 text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
                AI Cost Governance &amp; Operations
              </p>

              <p className="mt-3 text-sm text-[var(--color-text-muted)] max-w-xl">
                Total visibility and control over your AI infrastructure spend.
                Track, govern, and optimize every dollar across every model, every team.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
                <Button variant="outline" size="lg">
                  View Docs
                </Button>
              </div>
            </div>
          </Container>
        </Section>

        {/* Capabilities preview */}
        <Section spacing="md">
          <Container size="lg">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((cap) => (
                <Card key={cap.title} hoverable padding="md">
                  <CardContent className="mt-0">
                    <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary-muted)] flex items-center justify-center mb-4">
                      <span className="text-[var(--color-primary)] text-sm font-semibold">
                        {cap.icon}
                      </span>
                    </div>
                    <h3 className="text-heading text-sm mb-1.5">{cap.title}</h3>
                    <p className="text-caption leading-relaxed">{cap.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Metrics strip */}
        <Section spacing="sm">
          <Container size="lg">
            <div className="surface-elevated rounded-[var(--radius-xl)] p-6 sm:p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                {metrics.map((m) => (
                  <div key={m.label}>
                    <p className="text-heading text-2xl sm:text-3xl tabular-nums">{m.value}</p>
                    <p className="mt-1 text-caption">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        {/* Footer */}
        <footer className="border-t border-[var(--color-border-muted)] mt-auto">
          <Container>
            <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-caption">
                &copy; {new Date().getFullYear()} OsterdOps. All rights reserved.
              </p>
              <p className="text-caption">
                AI Cost Governance &amp; Operations Platform
              </p>
            </div>
          </Container>
        </footer>
      </main>
    </>
  );
}

/* ---- Data ---- */

const capabilities = [
  {
    icon: "$",
    title: "Cost Intelligence",
    description:
      "Real-time cost tracking across every AI provider, model, and team. Know exactly where every dollar goes.",
  },
  {
    icon: "⛨",
    title: "Budget Governance",
    description:
      "Set granular budgets and automated guardrails. Prevent runaway costs before they happen.",
  },
  {
    icon: "⚡",
    title: "Optimization Engine",
    description:
      "AI-powered recommendations to reduce spend without sacrificing quality or performance.",
  },
  {
    icon: "🔗",
    title: "Universal Integrations",
    description:
      "Connect OpenAI, Anthropic, Google, AWS Bedrock, Azure, and more in minutes.",
  },
  {
    icon: "👥",
    title: "Team Management",
    description:
      "Assign budgets, track usage by developer, and enforce organization-wide policies.",
  },
  {
    icon: "📊",
    title: "Executive Reporting",
    description:
      "Automated reports and dashboards for leadership. Prove ROI and control to stakeholders.",
  },
];

const metrics = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<50ms", label: "Tracking Latency" },
  { value: "30+", label: "Provider Integrations" },
  { value: "SOC 2", label: "Compliance Ready" },
];

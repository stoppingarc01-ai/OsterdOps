import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="AI cost overview and operations summary."
      />

      {/* Placeholder cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {placeholderStats.map((stat) => (
          <Card key={stat.label} padding="md">
            <CardContent className="mt-0">
              <p className="text-caption mb-1">{stat.label}</p>
              <p className="text-heading text-2xl tabular-nums">{stat.value}</p>
              <Badge variant={stat.variant} className="mt-2">
                {stat.change}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card padding="lg">
        <CardContent className="mt-0 flex items-center justify-center h-48">
          <p className="text-[var(--color-text-muted)] text-sm">
            Dashboard charts and data will be implemented in the next phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const placeholderStats = [
  { label: "Total Spend (MTD)", value: "$—", change: "—", variant: "default" as const },
  { label: "Active Projects", value: "—", change: "—", variant: "default" as const },
  { label: "Budget Utilization", value: "—%", change: "—", variant: "default" as const },
  { label: "Active Alerts", value: "—", change: "—", variant: "default" as const },
];

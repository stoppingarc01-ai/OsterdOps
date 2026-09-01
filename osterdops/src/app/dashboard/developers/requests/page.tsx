"use client";

import React from "react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";
import { RequestLogsView } from "@/components/developers/RequestLogsView";

export default function DeveloperRequestsPage() {
  return (
    <DeveloperPortalLayout
      title="Request Logs & Inspector"
      subtitle="Inspect request telemetry, correlation IDs, latency percentiles, and token breakdowns with zero prompt retention"
    >
      <RequestLogsView />
    </DeveloperPortalLayout>
  );
}

"use client";

import React from "react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";
import { DeveloperUsageView } from "@/components/developers/DeveloperUsageView";

export default function DeveloperUsagePage() {
  return (
    <DeveloperPortalLayout
      title="Usage & Rate Limits"
      subtitle="Monitor real-time request quotas, token consumption, provider allocations, and budget headroom"
    >
      <DeveloperUsageView />
    </DeveloperPortalLayout>
  );
}

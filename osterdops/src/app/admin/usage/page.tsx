"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminUsageView } from "@/components/admin/views/AdminUsageView";

export default function AdminUsagePage() {
  return (
    <AdminLayout
      title="Usage & Cost Analytics"
      subtitle="Aggregated token throughput, provider expenditure breakdown, prompt cache savings, and gateway latency distributions."
    >
      <AdminUsageView />
    </AdminLayout>
  );
}

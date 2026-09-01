"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminBudgetsView } from "@/components/admin/views/AdminBudgetsView";

export default function AdminBudgetsPage() {
  return (
    <AdminLayout
      title="Budget & Spend Enforcement"
      subtitle="Proactive spending caps, threshold alert configurations, and hard rejection rules."
    >
      <AdminBudgetsView />
    </AdminLayout>
  );
}

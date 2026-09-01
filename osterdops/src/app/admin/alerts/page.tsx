"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminAlertsView } from "@/components/admin/views/AdminAlertsView";

export default function AdminAlertsPage() {
  return (
    <AdminLayout
      title="Enterprise Alert Center"
      subtitle="Proactive notifications, threshold breach alerts, provider anomaly monitoring, and resolution workflows."
    >
      <AdminAlertsView />
    </AdminLayout>
  );
}

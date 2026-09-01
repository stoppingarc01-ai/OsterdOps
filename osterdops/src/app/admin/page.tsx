"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminOverviewView } from "@/components/admin/views/AdminOverviewView";

export default function AdminConsolePage() {
  return (
    <AdminLayout
      title="Enterprise Control Center"
      subtitle="Comprehensive multi-tenant governance, budget enforcement, security posture, and real-time operational telemetry."
    >
      <AdminOverviewView />
    </AdminLayout>
  );
}

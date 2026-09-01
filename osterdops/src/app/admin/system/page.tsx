"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminSystemHealthView } from "@/components/admin/views/AdminSystemHealthView";

export default function AdminSystemHealthPage() {
  return (
    <AdminLayout
      title="System Health & Probes"
      subtitle="Real-time status probes for AI gateway, database, rate limiting, job queue, and upstream AI provider adapters."
    >
      <AdminSystemHealthView />
    </AdminLayout>
  );
}

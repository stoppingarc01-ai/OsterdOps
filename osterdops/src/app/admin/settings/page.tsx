"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminSettingsView } from "@/components/admin/views/AdminSettingsView";

export default function AdminSettingsPage() {
  return (
    <AdminLayout
      title="Enterprise System Settings"
      subtitle="Global security bounds, master encryption keystores, rate limiting parameters, and webhook destination configs."
    >
      <AdminSettingsView />
    </AdminLayout>
  );
}

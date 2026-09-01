"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProjectsView } from "@/components/admin/views/AdminProjectsView";

export default function AdminProjectsPage() {
  return (
    <AdminLayout
      title="Projects & Workspaces"
      subtitle="Workspace creation, per-project spend limits, and team access administration."
    >
      <AdminProjectsView />
    </AdminLayout>
  );
}

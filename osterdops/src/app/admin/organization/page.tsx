"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminOrganizationView } from "@/components/admin/views/AdminOrganizationView";

export default function AdminOrganizationPage() {
  return (
    <AdminLayout
      title="Organization Governance"
      subtitle="Identity profile, multi-tenant isolation configuration, and organization-wide default bounds."
    >
      <AdminOrganizationView />
    </AdminLayout>
  );
}

"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminSecurityView } from "@/components/admin/views/AdminSecurityView";

export default function AdminSecurityPage() {
  return (
    <AdminLayout
      title="Security & Compliance Posture"
      subtitle="Cryptographic verification, server-side RBAC checks, data privacy guarantees, and security event audits."
    >
      <AdminSecurityView />
    </AdminLayout>
  );
}

"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminAuditLogsView } from "@/components/admin/views/AdminAuditLogsView";

export default function AdminAuditPage() {
  return (
    <AdminLayout
      title="Tamper-Evident Audit Logs"
      subtitle="Immutable cryptographic SHA-256 audit trails with actor, action, resource, and result metadata."
    >
      <AdminAuditLogsView />
    </AdminLayout>
  );
}

"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminApiKeysView } from "@/components/admin/views/AdminApiKeysView";

export default function AdminApiKeysPage() {
  return (
    <AdminLayout
      title="API Key Governance"
      subtitle="Organization-wide API credential rotation, revocation, and zero-plaintext storage management."
    >
      <AdminApiKeysView />
    </AdminLayout>
  );
}

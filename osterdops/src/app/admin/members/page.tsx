"use client";

import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminMembersView } from "@/components/admin/views/AdminMembersView";

export default function AdminMembersPage() {
  return (
    <AdminLayout
      title="Members & Role Management"
      subtitle="Role-based access control (RBAC), team member invitations, and privilege assignment."
    >
      <AdminMembersView />
    </AdminLayout>
  );
}

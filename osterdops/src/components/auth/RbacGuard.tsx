"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import type { OrganizationRole } from "@/types";

export interface RbacGuardProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RbacGuard({ permission, fallback = null, children }: RbacGuardProps) {
  const { currentMembership } = useAuth();
  const role: OrganizationRole = currentMembership?.role || "OWNER";

  if (!hasPermission(role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

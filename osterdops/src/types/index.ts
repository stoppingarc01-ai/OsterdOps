/* ============================================================
   OsterdOps — Shared Type Definitions
   ============================================================ */

export * from "./backend";
export * from "./subscription";

import type { UserSubscriptionMetadata } from "./subscription";

/** Generic API response envelope */
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId?: string;
    latencyMs?: number;
    [key: string]: unknown;
  };
};

/** Base entity fields shared by domain objects */
export type BaseEntity = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

/** User identity */
export type User = BaseEntity & {
  name: string;
  email: string;
  avatarUrl?: string;
  role: "owner" | "admin" | "member" | "viewer" | "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";
  subscription?: UserSubscriptionMetadata;
};

/** Navigation item (UI) */
export type NavItem = {
  title: string;
  href: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
};

/** Navigation group with label */
export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Theme options */
export type Theme = "light" | "dark" | "system";

/** Component size variants */
export type Size = "sm" | "md" | "lg";

/** Component variant styles */
export type Variant = "default" | "primary" | "secondary" | "ghost" | "danger";

/** OsterdOps — Centralized site configuration */

export type NavItem = {
  title: string;
  href: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const siteConfig = {
  name: "OsterdOps",
  shortName: "OOps",
  description:
    "AI Cost Governance & Operations Platform — gain total visibility and control over your AI infrastructure spend.",
  url: "https://osterdops.com",

  /** Top-level marketing navigation */
  mainNav: [
    { title: "Product", href: "/product" },
    { title: "Pricing", href: "/pricing" },
    { title: "Docs", href: "/docs" },
    { title: "Blog", href: "/blog" },
  ] satisfies NavItem[],

  /** Dashboard sidebar navigation */
  sidebarNav: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
        { title: "Projects", href: "/dashboard/projects", icon: "folder-kanban" },
        { title: "Usage", href: "/dashboard/usage", icon: "activity" },
        { title: "Optimization", href: "/optimization", icon: "sparkles" },
      ],
    },
    {
      label: "Governance",
      items: [
        { title: "Budgets", href: "/dashboard/budgets", icon: "wallet" },
        { title: "Alerts", href: "/dashboard/alerts", icon: "bell" },
        { title: "Integrations", href: "/dashboard/integrations", icon: "plug" },
      ],
    },
    {
      label: "Organization",
      items: [
        { title: "Teams & Developers", href: "/teams", icon: "users" },
        { title: "Reports", href: "/reports", icon: "file-bar-chart" },
        { title: "Billing", href: "/dashboard/billing", icon: "credit-card" },
      ],
    },
    {
      label: "System",
      items: [
        { title: "Admin Console", href: "/admin", icon: "shield-check" },
        { title: "Security & Audit", href: "/dashboard/security", icon: "shield-check" },
        { title: "Settings", href: "/dashboard/settings", icon: "settings" },
      ],
    },
  ] satisfies NavGroup[],

  /** Branding */
  brand: {
    primaryColor: "#3d4f7c",
    tagline: "AI Cost Governance & Operations",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Application-wide constants */

export const APP_NAME = "OsterdOps" as const;

/** Breakpoints matching Tailwind defaults (px values) */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** Default pagination */
export const PAGINATION = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
} as const;

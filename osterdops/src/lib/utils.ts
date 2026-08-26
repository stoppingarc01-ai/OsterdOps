/** Merge class names — simple utility to concatenate Tailwind classes. */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

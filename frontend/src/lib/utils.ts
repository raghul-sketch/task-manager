/**
 * cn() — className merge utility
 *
 * Combines clsx (conditional classes) with tailwind-merge (deduplicates
 * conflicting Tailwind classes). This is the standard shadcn/ui pattern.
 *
 * Example: cn("px-4 py-2", isActive && "bg-primary", "px-6")
 *   → "py-2 px-6 bg-primary" (px-4 is overridden by px-6)
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

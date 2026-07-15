/**
 * LoadingSpinner Component
 *
 * Full-page centered spinner for data loading states.
 * Uses a CSS animation (spin) on a Lucide icon.
 */

import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

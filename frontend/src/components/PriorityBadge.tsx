/**
 * PriorityBadge Component
 *
 * Renders a colored pill badge for a task's priority level.
 * Uses a "light variant" pattern from the Stitch design system:
 * - Background: 10% opacity of the priority color
 * - Text: Full-strength priority color
 *
 * @param priority - The TaskPriority value to display.
 */

import type { TaskPriority } from "../types/task";
import { cn } from "../lib/utils";

interface PriorityBadgeProps {
  priority: TaskPriority;
}

/** Maps each priority to its display label and color classes. */
const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  HIGH: {
    label: "High Priority",
    className: "bg-error/10 text-error",
  },
  MEDIUM: {
    label: "Medium Priority",
    className: "bg-on-tertiary-container/10 text-on-tertiary-container",
  },
  LOW: {
    label: "Low Priority",
    className: "bg-secondary/10 text-secondary",
  },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

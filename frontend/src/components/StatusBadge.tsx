/**
 * StatusBadge Component
 *
 * Renders a color-coded pill badge for a task's workflow status.
 * Colors follow the Stitch design system:
 * - TODO: Neutral gray background
 * - IN_PROGRESS: Blue/secondary tint
 * - DONE: Green success tint
 *
 * @param status - The TaskStatus value to display.
 */

import type { TaskStatus } from "../types/task";
import { cn } from "../lib/utils";

interface StatusBadgeProps {
  status: TaskStatus;
}

/** Maps each status to its display label and color classes. */
const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  TODO: {
    label: "Todo",
    className: "bg-surface-container-high text-on-surface-variant",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-secondary-container/50 text-on-secondary-container",
  },
  DONE: {
    label: "Done",
    className: "bg-success-light text-success",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

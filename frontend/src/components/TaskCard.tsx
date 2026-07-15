/**
 * TaskCard Component
 *
 * Renders a single task in the card grid. Matches the Stitch prototype:
 * - 4px left border colored by priority (HIGH=red, MEDIUM=amber, LOW=slate)
 * - Priority badge top-left, hover-reveal edit/delete buttons top-right
 * - Title, 2-line description preview, due date + status footer
 * - Elevated shadow on hover
 *
 * @param task - The full Task object to render.
 * @param onEdit - Callback when the edit button is clicked.
 * @param onDelete - Callback when the delete button is clicked.
 * @param onClick - Callback when the card body is clicked (navigate to detail).
 */

import type { Task, TaskStatus } from "../types/task";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { Calendar, Pencil, Trash2, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
}

/** Maps priority to the left-border accent CSS class. */
const PRIORITY_BORDER: Record<string, string> = {
  HIGH: "task-card-high",
  MEDIUM: "task-card-medium",
  LOW: "task-card-low",
};

/**
 * Format a due date string for display.
 * Uses short month format (e.g., "Oct 12, 2025") for compact card layout.
 */
function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TaskCard({ task, onEdit, onDelete, onClick, onStatusChange }: TaskCardProps) {
  const isDone = task.status === "DONE";

  return (
    <div
      className={cn(
        "bg-surface p-4 rounded-xl border border-outline-variant cursor-pointer group",
        "hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)]",
        "transition-all duration-200",
        PRIORITY_BORDER[task.priority],
        isDone && "opacity-80"
      )}
      onClick={() => onClick(task.id)}
    >
      {/* Header: Priority badge + hover-reveal actions */}
      <div className="flex justify-between items-start mb-4">
        <PriorityBadge priority={task.priority} />

        {/* Action buttons — hidden by default, shown on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onEdit(task.id);
            }}
            title="Edit task"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="p-1 hover:bg-error/10 hover:text-error rounded transition-colors text-on-surface-variant"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title — strikethrough when done */}
      <h3
        className={cn(
          "text-xl font-semibold text-primary mb-2",
          isDone && "line-through decoration-on-surface-variant/40"
        )}
      >
        {task.title}
      </h3>

      {/* Description — 2-line clamp */}
      {task.description && (
        <p className="text-sm text-on-surface-variant line-clamp-2 mb-6">
          {task.description}
        </p>
      )}

      {/* Footer: Due date + Status */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/30">
        <div className="flex items-center gap-2">
          {isDone ? (
            <>
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs font-semibold text-success tracking-wider">
                Completed
              </span>
            </>
          ) : task.dueDate ? (
            <>
              <Calendar className="w-4 h-4 text-on-surface-variant" />
              <span className="text-xs font-semibold text-on-surface-variant tracking-wider">
                Due {formatDueDate(task.dueDate)}
              </span>
            </>
          ) : (
            <span className="text-xs font-semibold text-on-surface-variant tracking-wider">
              No due date
            </span>
          )}
        </div>
        <select
          value={task.status}
          onChange={(e) => {
            e.stopPropagation();
            onStatusChange(task.id, e.target.value as TaskStatus);
          }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "appearance-none inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer border border-transparent hover:border-outline-variant transition-all outline-none text-center",
            task.status === "TODO" && "bg-surface-container-high text-on-surface-variant",
            task.status === "IN_PROGRESS" && "bg-secondary-container/50 text-on-secondary-container",
            task.status === "DONE" && "bg-success-light text-success"
          )}
        >
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>
    </div>
  );
}

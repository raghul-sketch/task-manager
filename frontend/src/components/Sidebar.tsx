/**
 * Sidebar Component
 *
 * Left sidebar navigation for filtering tasks by status.
 * Matches the Stitch prototype's filter sidebar with:
 * - Terminal icon header with "Task Filters" title
 * - Filter links: All Tasks, Todo, In Progress, Done
 * - Active state highlight with background color
 *
 * @param activeFilter - Currently selected filter (undefined = "All Tasks").
 * @param onFilterChange - Callback when a filter is selected.
 */

import type { TaskStatus } from "../types/task";
import { cn } from "../lib/utils";
import {
  ListTodo,
  Circle,
  RefreshCw,
  CheckCircle,
  Terminal,
} from "lucide-react";

interface SidebarProps {
  activeFilter: TaskStatus | undefined;
  onFilterChange: (status: TaskStatus | undefined) => void;
}

/** Defines each sidebar filter option. */
const FILTER_OPTIONS: Array<{
  label: string;
  status: TaskStatus | undefined;
  icon: React.ReactNode;
}> = [
  { label: "All Tasks", status: undefined, icon: <ListTodo className="w-5 h-5" /> },
  { label: "Todo", status: "TODO", icon: <Circle className="w-5 h-5" /> },
  { label: "In Progress", status: "IN_PROGRESS", icon: <RefreshCw className="w-5 h-5" /> },
  { label: "Done", status: "DONE", icon: <CheckCircle className="w-5 h-5" /> },
];

export function Sidebar({ activeFilter, onFilterChange }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col h-full w-64 bg-surface-container-low border-r border-outline-variant p-4 gap-1 shrink-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
          <Terminal className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-primary leading-tight">
            Task Filters
          </span>
          <span className="text-xs font-semibold text-on-surface-variant tracking-wider">
            Technical Assignment
          </span>
        </div>
      </div>

      {/* Filter Navigation */}
      <nav className="flex flex-col gap-1 text-xs font-semibold tracking-wider">
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option.status;

          return (
            <button
              key={option.label}
              onClick={() => onFilterChange(option.status)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ease-in-out text-left",
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

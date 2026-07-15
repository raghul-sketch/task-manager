/**
 * TaskDetailPage
 *
 * Full detail view for a single task. Matches the Stitch "Task Details" screen.
 *
 * Layout:
 * - Top: Back navigation + Edit/Delete action buttons
 * - Left: Task detail card with status/priority badges, title, description
 * - Right sidebar: Metadata (Created, Updated, Due Date)
 *
 * @remarks
 * The task is loaded via the useTask hook from the :id route parameter.
 * Delete triggers a confirmation dialog before actually removing the task.
 */

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTask } from "../hooks/useTask";
import { deleteTask } from "../api/tasksApi";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Format a date string for display in the detail view.
 * Uses a more verbose format than the card view for readability.
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date string to show relative time (e.g., "2 hours ago").
 * Falls back to absolute date for times > 7 days ago.
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return formatDate(dateStr);
}

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { task, loading, error } = useTask(id);

  // --- Delete State ---
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleteLoading(true);
      await deleteTask(id);
      toast.success("Task deleted successfully");
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete task";
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!task) return <ErrorMessage message="Task not found" />;

  /** Check if the task is overdue. */
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Navigation & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-1 text-primary text-xs font-semibold tracking-wider hover:bg-surface-container rounded-lg px-3 py-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Task List
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to={`/tasks/${task.id}/edit`}
              className="bg-primary text-on-primary text-xs font-semibold tracking-wider px-6 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
            >
              <Pencil className="w-4 h-4" />
              Edit Task
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="border border-error text-error text-xs font-semibold tracking-wider px-6 py-2 rounded-lg hover:bg-error-container/10 transition-all flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete Task
            </button>
          </div>
        </div>

        {/* Task Detail Card */}
        <div
          className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm border-l-4 ${
            task.priority === "HIGH"
              ? "border-l-error"
              : task.priority === "MEDIUM"
              ? "border-l-on-tertiary-container"
              : "border-l-secondary"
          }`}
        >
          <div className="p-6 md:p-8 space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-primary leading-tight tracking-tighter">
              {task.title}
            </h1>

            {/* Description */}
            {task.description && (
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Description
                </h3>
                <div className="text-base text-on-surface-variant leading-relaxed space-y-4 whitespace-pre-wrap">
                  {task.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar — Metadata */}
      <aside className="w-full md:w-80 space-y-6">
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 space-y-8">
          {/* Dates Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-secondary">
                <CalendarDays className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Created
                </span>
              </div>
              <span className="text-sm text-primary">
                {formatDate(task.createdAt)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-secondary">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Last Updated
                </span>
              </div>
              <span className="text-sm text-primary">
                {formatRelativeTime(task.updatedAt)}
              </span>
            </div>

            {task.dueDate && (
              <div className="flex justify-between items-center">
                <div
                  className={`flex items-center gap-1 ${
                    isOverdue ? "text-error" : "text-secondary"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    Due Date
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    isOverdue ? "text-error" : "text-primary"
                  }`}
                >
                  {formatDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>

          {/* Task ID (useful for debugging and API reference) */}
          <div className="pt-4 border-t border-outline-variant">
            <h5 className="text-xs font-semibold text-secondary mb-2 uppercase tracking-widest">
              Task ID
            </h5>
            <code className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-1 rounded break-all">
              {task.id}
            </code>
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={deleteLoading}
      />
    </main>
  );
}

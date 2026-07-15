/**
 * TaskListPage
 *
 * The main dashboard view — matches the Stitch "Task List" prototype.
 *
 * Layout:
 * - Left sidebar with status filter navigation
 * - Main area with header (title, sort controls), task card grid, and stats row
 *
 * State Management:
 * - `statusFilter` controls which tasks to show (All / TODO / IN_PROGRESS / DONE)
 * - `sortBy` and `order` control the sort dimension and direction
 * - `deleteTarget` tracks which task's delete confirmation is open
 *
 * All data fetching is delegated to the useTasks hook; API calls to the
 * tasksApi module. This component only manages UI state and composition.
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import { deleteTask, updateTask } from "../api/tasksApi";
import { TaskCard } from "../components/TaskCard";
import { Sidebar } from "../components/Sidebar";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import type { TaskStatus } from "../types/task";
import { Plus, ArrowUpDown, BarChart3, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

export function TaskListPage() {
  const navigate = useNavigate();

  // --- Filter & Sort State ---
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"createdAt" | "dueDate">("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // --- Delete Confirmation State ---
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Memoize params to prevent unnecessary re-fetches when the object reference changes.
  const params = useMemo(
    () => ({ status: statusFilter, sortBy, order }),
    [statusFilter, sortBy, order]
  );

  const { tasks, loading, error, refetch } = useTasks(params);

  // --- Derived Stats ---
  // Computed from the full task list for the bottom stats row.
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
    ).length;
    return { total, done, overdue };
  }, [tasks]);

  /** Handle task deletion with confirmation dialog. */
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await deleteTask(deleteTarget);
      toast.success("Task deleted successfully");
      setDeleteTarget(null);
      refetch(); // Refresh the list after deletion.
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete task";
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  /** Update task status inline */
  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    try {
      await updateTask(id, { status: newStatus });
      toast.success("Task status updated");
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    }
  };

  /** Toggle sort direction, or change sort field and reset to descending. */
  const handleSortChange = (newSortBy: "createdAt" | "dueDate") => {
    if (sortBy === newSortBy) {
      // Same field → toggle direction.
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      // New field → default to descending.
      setSortBy(newSortBy);
      setOrder("desc");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Filter Navigation */}
      <Sidebar activeFilter={statusFilter} onFilterChange={setStatusFilter} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
        {/* Header: Title + Sort Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-primary tracking-tight leading-9">
              {statusFilter
                ? `${statusFilter.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} Tasks`
                : "All Tasks"}
            </h1>
            <p className="text-sm text-on-surface-variant">
              You have {tasks.length} {statusFilter ? "matching" : "active"} tasks in your workflow
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 bg-surface-container p-1 rounded-lg border border-outline-variant">
            <label className="text-xs font-semibold tracking-wider text-on-surface-variant px-2">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value as "createdAt" | "dueDate")
              }
              className="bg-transparent border-none focus:ring-0 text-xs font-semibold text-primary cursor-pointer pr-8"
            >
              <option value="createdAt">Created At</option>
              <option value="dueDate">Due Date</option>
            </select>
            <button
              onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
              className="p-2 hover:bg-surface-container-highest rounded-lg transition-all"
              title={`Sort ${order === "asc" ? "descending" : "ascending"}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Filter (visible on small screens where sidebar is hidden) */}
        <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto pb-2">
          {(["All", "TODO", "IN_PROGRESS", "DONE"] as const).map((filter) => {
            const value = filter === "All" ? undefined : filter;
            const isActive = statusFilter === value;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {filter.replace("_", " ")}
              </button>
            );
          })}
        </div>

        {/* Dashboard Stats Row */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface p-4 rounded-xl border border-outline-variant flex items-center gap-4">
            <div className="p-2 bg-primary-container/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-tighter">
                Total Tasks
              </p>
              <h4 className="text-xl font-bold text-primary">{stats.total}</h4>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-outline-variant flex items-center gap-4">
            <div className="p-2 bg-error/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-tighter">
                Overdue
              </p>
              <h4 className="text-xl font-bold text-primary">{stats.overdue} tasks</h4>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-outline-variant flex items-center gap-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <Clock className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-tighter">
                Completed
              </p>
              <h4 className="text-xl font-bold text-primary">{stats.done} tasks</h4>
            </div>
          </div>
        </div>


        {/* Content States */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={refetch} />
        ) : (
          <>
            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(id) => navigate(`/tasks/${id}/edit`)}
                  onDelete={(id) => setDeleteTarget(id)}
                  onClick={(id) => navigate(`/tasks/${id}`)}
                  onStatusChange={handleStatusChange}
                />
              ))}

              {/* "Add New Task" Placeholder Card */}
              <button
                onClick={() => navigate("/tasks/new")}
                className="bg-transparent p-4 rounded-xl border-2 border-dashed border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container transition-all flex flex-col items-center justify-center text-on-surface-variant group min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-7 h-7 text-primary" />
                </div>
                <span className="text-xl font-semibold text-primary">
                  Add New Task
                </span>
                <p className="text-xs text-on-surface-variant mt-2">
                  Create a new entry for your project
                </p>
              </button>
            </div>

          </>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}

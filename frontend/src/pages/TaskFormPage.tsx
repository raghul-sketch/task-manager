/**
 * TaskFormPage
 *
 * Handles both creating and editing tasks. Matches the Stitch "Manage Task" screen.
 *
 * Layout (two-column on desktop):
 * - Left (8 cols): Form with title, description, status, priority, due date
 * - Right (4 cols): Efficiency tips card + live preview card
 *
 * Mode Detection:
 * - Create mode: Route is /tasks/new (no ID param)
 * - Edit mode: Route is /tasks/:id/edit (useTask hook loads existing data)
 *
 * Validation:
 * - Client-side Zod validation mirrors backend rules (title required, max lengths)
 * - Errors are shown inline below each field
 *
 * @remarks
 * The form uses controlled inputs with useState rather than a form library
 * (react-hook-form) to keep dependencies minimal for this assignment.
 * For a production app with many forms, react-hook-form + zod resolver
 * would be the better choice.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTask } from "../hooks/useTask";
import { createTask, updateTask } from "../api/tasksApi";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { TaskStatus, TaskPriority } from "../types/task";
import { ArrowLeft, Save, Lightbulb, CheckCircle, Info, Calendar } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

/**
 * Client-side validation schema.
 * Mirrors the backend createTaskSchema — deliberately duplicated because
 * sharing a Zod schema across a monorepo without a shared package adds
 * configuration complexity that isn't justified for this assignment size.
 */
const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional()
    .or(z.literal("")),
});

/** Form field state. */
interface FormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

/** Per-field validation errors. */
interface FormErrors {
  title?: string;
  description?: string;
}

export function TaskFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Load existing task data in edit mode.
  const { task, loading: taskLoading } = useTask(id);

  // --- Form State ---
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Populate form when editing an existing task.
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        // Convert ISO date to yyyy-mm-dd for the date input.
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      });
    }
  }, [task]);

  /** Update a single form field. */
  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field when the user starts typing.
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /** Validate and submit the form. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation.
    const result = taskFormSchema.safeParse({
      title: formData.title,
      description: formData.description,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormErrors;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setSubmitting(true);

      // Build the API payload.
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        // Convert yyyy-mm-dd to ISO 8601, or null if empty.
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
      };

      if (isEditMode && id) {
        await updateTask(id, payload);
        toast.success("Task updated successfully");
      } else {
        await createTask(payload);
        toast.success("Task created successfully");
      }

      navigate("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save task";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (taskLoading) return <LoadingSpinner />;

  return (
    <main className="max-w-[1280px] mx-auto px-4 py-8 md:px-8">
      {/* Back Navigation */}
      <div className="mb-6 flex items-center gap-2">
        <Link
          to="/"
          className="flex items-center text-secondary hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="ml-1 text-xs font-semibold tracking-wider">
            Back to Task List
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Form Canvas */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 md:p-8">
            <header className="mb-8">
              <h1 className="text-[28px] font-semibold text-primary mb-1 leading-9 tracking-tight">
                {isEditMode ? "Edit Task" : "Create New Task"}
              </h1>
              <p className="text-sm text-on-surface-variant">
                {isEditMode
                  ? "Update the task parameters below."
                  : "Define the parameters for your technical assignment below."}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-1">
                <label
                  htmlFor="title"
                  className="block text-xs font-semibold tracking-wider text-on-surface"
                >
                  Title <span className="text-error">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g., Implement OAuth2 flow"
                  className={`w-full bg-surface-container-low border rounded-lg px-4 py-2 text-sm transition-all placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary ${
                    errors.title
                      ? "border-error"
                      : "border-outline-variant"
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-error mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label
                  htmlFor="description"
                  className="block text-xs font-semibold tracking-wider text-on-surface"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Provide detailed context, acceptance criteria, or technical constraints..."
                  rows={5}
                  className={`w-full bg-surface-container-low border rounded-lg px-4 py-2 text-sm transition-all placeholder:text-outline resize-none focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary ${
                    errors.description
                      ? "border-error"
                      : "border-outline-variant"
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-error mt-1">{errors.description}</p>
                )}
              </div>

              {/* Status + Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label
                    htmlFor="status"
                    className="block text-xs font-semibold tracking-wider text-on-surface"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      handleChange("status", e.target.value)
                    }
                    className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="priority"
                    className="block text-xs font-semibold tracking-wider text-on-surface"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) =>
                      handleChange("priority", e.target.value)
                    }
                    className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label
                    htmlFor="dueDate"
                    className="block text-xs font-semibold tracking-wider text-on-surface"
                  >
                    Due Date
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-8 mt-8 border-t border-outline-variant flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
                <Link
                  to="/"
                  className="w-full sm:w-auto px-6 py-2 rounded-lg text-secondary text-xs font-semibold tracking-wider border border-outline-variant hover:bg-surface-container-high transition-all text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold tracking-wider shadow-sm hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {submitting
                    ? "Saving..."
                    : isEditMode
                    ? "Update Task"
                    : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Context Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tips Card */}
          <div className="bg-primary text-on-primary rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5" />
                <h3 className="text-xl font-semibold">Efficiency Tips</h3>
              </div>
              <ul className="space-y-2 text-sm opacity-90">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  Use descriptive titles to make search easier.
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  High priority tasks are automatically flagged in reports.
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  Assigning a due date triggers notification reminders.
                </li>
              </ul>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
              Live Preview
            </h3>
            <div
              className={`bg-white border border-outline-variant rounded-lg p-4 shadow-sm border-l-4 ${
                formData.priority === "HIGH"
                  ? "border-l-error"
                  : formData.priority === "MEDIUM"
                  ? "border-l-on-tertiary-container"
                  : "border-l-secondary"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                  {formData.status}
                </span>
              </div>
              <h4 className="text-xl font-semibold text-primary truncate mt-2">
                {formData.title || "Task Title"}
              </h4>
              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                {formData.description || "No description provided."}
              </p>
              <div className="mt-4 flex items-center gap-1 text-secondary">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs">
                  {formData.dueDate || "No date"}
                </span>
              </div>
            </div>
          </div>

          {/* System Requirements Note */}
          <div className="p-4 rounded-xl border border-dashed border-outline-variant">
            <div className="flex gap-4">
              <div className="p-2 bg-surface-container rounded-lg h-fit">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">
                  System Requirements
                </p>
                <p className="text-xs text-on-surface-variant">
                  All tasks must comply with the internal technical standards for Technical Assignments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

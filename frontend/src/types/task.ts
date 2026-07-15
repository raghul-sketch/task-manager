/**
 * Shared Task Types
 *
 * These interfaces mirror the backend Prisma model and OpenAPI schema.
 * They're used throughout the frontend for type-safe API interactions.
 *
 * NOTE: These are deliberately duplicated from the backend types because
 * there's no shared package in this monorepo. In a production setup, you'd
 * extract these into a shared `@taskmanager/types` package. The trade-off
 * here is simplicity vs. DRY — for a take-home assignment, duplication is
 * more maintainable than a shared package configuration.
 */

/** Possible task workflow states. */
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

/** Possible task priority levels. */
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

/** Full Task entity as returned by the API. */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null; // ISO 8601 string (JSON serialized from Date)
  createdAt: string;       // ISO 8601 string
  updatedAt: string;       // ISO 8601 string
}

/** Payload for creating a new task. */
export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

/** Payload for updating an existing task (all fields optional). */
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

/** Query parameters for listing tasks. */
export interface ListTasksParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: "createdAt" | "dueDate";
  order?: "asc" | "desc";
}

/** Standard error response from the API. */
export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

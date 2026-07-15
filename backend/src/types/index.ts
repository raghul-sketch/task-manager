/**
 * Shared TypeScript types for the Task Management API.
 *
 * These types mirror the Prisma-generated types but are decoupled so that
 * controllers and routes can reference them without importing Prisma directly.
 * This keeps the HTTP layer independent of the ORM implementation.
 */

/** Possible task workflow states. */
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

/** Possible task priority levels. */
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

/** Full Task entity as returned by the API (matches the Prisma model shape). */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Payload for creating a new task. */
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string; // ISO 8601 string from the client
}

/** Payload for updating an existing task (all fields optional = partial update). */
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null; // null to explicitly clear the date
}

/** Allowed query parameters for the list-tasks endpoint. */
export interface ListTasksQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: "createdAt" | "dueDate";
  order?: "asc" | "desc";
}

/**
 * Standardized error response shape.
 * All error responses from the API conform to this structure so clients
 * can reliably parse failures without guessing the shape.
 */
export interface ErrorResponse {
  error: string;
  details?: unknown[];
}

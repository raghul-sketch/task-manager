/**
 * Tasks API Client
 *
 * Centralized HTTP layer for all task-related API calls. Components never
 * call fetch() directly — they always go through these typed functions.
 *
 * Benefits of centralization:
 * 1. Single place to configure base URL, headers, and error handling.
 * 2. Type-safe request/response contracts.
 * 3. Easy to swap the HTTP library (fetch → axios) without touching components.
 */

import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksParams,
  ApiError,
} from "../types/task";

// Base URL for the backend API. Falls back to localhost:3001 for local dev.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Generic fetch wrapper that handles JSON parsing and error extraction.
 * Throws an error with the server's error message on non-OK responses.
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // For 204 No Content (e.g., DELETE), return early.
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    // Extract the structured error from the API response.
    const apiError = data as ApiError;
    throw new Error(apiError.error || "An unexpected error occurred");
  }

  return data as T;
}

/**
 * Fetch all tasks with optional filters and sorting.
 *
 * Query parameters are dynamically built from the params object.
 * Undefined values are excluded so only provided filters are sent.
 */
export async function getTasks(params?: ListTasksParams): Promise<Task[]> {
  const searchParams = new URLSearchParams();

  if (params?.status) searchParams.set("status", params.status);
  if (params?.priority) searchParams.set("priority", params.priority);
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.order) searchParams.set("order", params.order);

  const queryString = searchParams.toString();
  const endpoint = `/api/tasks${queryString ? `?${queryString}` : ""}`;

  return apiFetch<Task[]>(endpoint);
}

/**
 * Fetch a single task by its UUID.
 */
export async function getTaskById(id: string): Promise<Task> {
  return apiFetch<Task>(`/api/tasks/${id}`);
}

/**
 * Create a new task.
 * Returns the created task with server-generated fields (id, timestamps).
 */
export async function createTask(data: CreateTaskInput): Promise<Task> {
  return apiFetch<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing task with partial data.
 * Only provided fields are updated; omitted fields remain unchanged.
 */
export async function updateTask(
  id: string,
  data: UpdateTaskInput
): Promise<Task> {
  return apiFetch<Task>(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a task by its UUID.
 * Returns void (204 No Content from the server).
 */
export async function deleteTask(id: string): Promise<void> {
  return apiFetch<void>(`/api/tasks/${id}`, {
    method: "DELETE",
  });
}

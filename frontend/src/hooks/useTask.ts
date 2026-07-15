/**
 * useTask Hook
 *
 * Fetches a single task by ID. Used by TaskDetailPage and TaskFormPage (edit mode).
 *
 * @param id - UUID of the task to fetch. If undefined, skips the fetch
 *             (useful when creating a new task — no ID yet).
 */

import { useState, useEffect } from "react";
import { getTaskById } from "../api/tasksApi";
import type { Task } from "../types/task";

export function useTask(id: string | undefined) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetch if no ID (create mode).
    if (!id) return;

    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTaskById(id);
        setTask(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load task";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  return { task, loading, error };
}

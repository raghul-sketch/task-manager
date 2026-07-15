/**
 * useTasks Hook
 *
 * Manages the task list data fetching lifecycle: loading, data, error, and refetch.
 * Components call useTasks() to get the current task list without worrying about
 * fetch timing or error handling — that's all encapsulated here.
 *
 * @param params - Optional filter/sort parameters passed to the API.
 * @returns Object with tasks array, loading state, error message, and refetch function.
 */

import { useState, useEffect, useCallback } from "react";
import { getTasks } from "../api/tasksApi";
import type { Task, ListTasksParams } from "../types/task";

export function useTasks(params?: ListTasksParams) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks(params);
      setTasks(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load tasks";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.priority, params?.sortBy, params?.order]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}

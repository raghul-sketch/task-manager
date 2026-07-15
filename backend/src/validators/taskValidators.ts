/**
 * Zod Validation Schemas for Task API endpoints.
 *
 * Each schema validates the incoming request body or query parameters,
 * ensuring data integrity before it reaches the service layer. Validation
 * errors are returned as structured 400 responses with field-level details.
 *
 * Why Zod over alternatives (Joi, class-validator):
 * - First-class TypeScript inference — schemas produce types automatically.
 * - Lightweight (~12kB gzipped) with zero runtime dependencies.
 * - Composable: updateTaskSchema reuses createTaskSchema's field definitions.
 */

import { z } from "zod";

/**
 * Schema for creating a new task (POST /api/tasks).
 *
 * - title: required, 1–200 characters (trimmed to prevent whitespace-only values).
 * - description: optional, up to 2000 characters.
 * - status: optional enum, defaults to TODO in the Prisma model.
 * - priority: optional enum, defaults to MEDIUM in the Prisma model.
 * - dueDate: optional ISO 8601 date string, validated to ensure parseability.
 */
export const createTaskSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be at most 200 characters"),

  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional()
    .nullable(),

  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

  dueDate: z
    .string()
    .datetime({ message: "dueDate must be a valid ISO 8601 date string" })
    .optional()
    .nullable(),
});

/**
 * Schema for updating an existing task (PUT /api/tasks/:id).
 *
 * All fields are optional (partial update). This is derived from createTaskSchema
 * via .partial() so we don't duplicate field constraints — a single source of truth.
 */
export const updateTaskSchema = createTaskSchema.partial();

/**
 * Schema for the UUID route parameter (:id).
 * Validates that the ID is a well-formed UUID to prevent garbage queries to the DB.
 */
export const taskIdParamSchema = z.object({
  id: z.string().uuid("Invalid task ID format — must be a UUID"),
});

/**
 * Schema for query parameters on GET /api/tasks.
 *
 * - status: filter by workflow state.
 * - priority: filter by urgency level.
 * - sortBy: which column to order by (createdAt or dueDate).
 * - order: ascending or descending sort direction.
 *
 * All fields are optional; the service layer applies sensible defaults
 * (sort by createdAt descending) when omitted.
 */
export const listTasksQuerySchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  sortBy: z.enum(["createdAt", "dueDate"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

// Inferred types for use in the service/controller layers.
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

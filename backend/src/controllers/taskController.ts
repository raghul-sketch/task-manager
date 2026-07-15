/**
 * Task Controller
 *
 * Thin HTTP layer that:
 * 1. Extracts validated data from the request (body, params, query).
 * 2. Delegates to the service layer for business logic / DB operations.
 * 3. Sends the appropriate HTTP response.
 *
 * Controllers never call PrismaClient directly — that's the service's job.
 * Controllers also never do validation — that's handled by middleware.
 */

import { Request, Response } from "express";
import * as taskService from "../services/taskService";
import { ListTasksQuery } from "../validators/taskValidators";

/**
 * GET /api/tasks
 * Retrieve all tasks, optionally filtered and sorted by query parameters.
 *
 * @param req - Express request with validated query params.
 * @param res - Express response containing the task array.
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  // Query params have already been validated and cleaned by the validate middleware.
  const query = req.query as unknown as ListTasksQuery;
  const tasks = await taskService.findAll(query);
  res.json(tasks);
}

/**
 * GET /api/tasks/:id
 * Retrieve a single task by its UUID.
 *
 * @param req - Express request with validated `id` param.
 * @param res - Express response containing the task object.
 * @returns 404 if task not found (handled by errorHandler middleware).
 */
export async function getById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const task = await taskService.findById(id);
  res.json(task);
}

/**
 * POST /api/tasks
 * Create a new task from the validated request body.
 *
 * @param req - Express request with validated body matching CreateTaskInput.
 * @param res - Express response with 201 status and the created task.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const task = await taskService.create(req.body);
  // 201 Created — the standard status code for successful resource creation.
  res.status(201).json(task);
}

/**
 * PUT /api/tasks/:id
 * Update an existing task with partial data.
 *
 * @param req - Express request with validated body and `id` param.
 * @param res - Express response containing the updated task.
 * @returns 404 if task not found (handled by errorHandler middleware).
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const task = await taskService.update(id, req.body);
  res.json(task);
}

/**
 * DELETE /api/tasks/:id
 * Delete a task by its UUID.
 *
 * @param req - Express request with validated `id` param.
 * @param res - Express response with 204 No Content on success.
 * @returns 404 if task not found (handled by errorHandler middleware).
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await taskService.remove(id);
  // 204 No Content — the standard for successful deletions with no response body.
  res.status(204).send();
}

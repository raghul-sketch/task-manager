/**
 * Task Service
 *
 * Encapsulates all database operations for the Task entity. This is the ONLY
 * layer that interacts with PrismaClient — controllers never import Prisma.
 *
 * Why a separate service layer?
 * 1. Testability: Services can be unit-tested with a mocked Prisma client.
 * 2. Reusability: If we add WebSocket notifications or a CLI tool later, they
 *    call the same service functions without duplicating DB logic.
 * 3. Single Responsibility: Controllers handle HTTP; services handle data.
 */

import { Prisma } from "@prisma/client";
import {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
} from "../validators/taskValidators";

import prisma from "../lib/prisma";

/**
 * Retrieve all tasks, optionally filtered and sorted.
 *
 * The dynamic `where` and `orderBy` construction allows the controller to
 * pass validated query params directly — no conditional if/else chains.
 *
 * @param query - Validated query parameters (status, priority, sortBy, order).
 * @returns Array of Task records matching the filters.
 */
export async function findAll(query: ListTasksQuery) {
  // Build the Prisma `where` clause dynamically.
  // Only include filters that the client actually provided — undefined values
  // are ignored by Prisma, so we don't need explicit null checks.
  const where: Prisma.TaskWhereInput = {
    ...(query.status && { status: query.status }),
    ...(query.priority && { priority: query.priority }),
  };

  // Build the `orderBy` clause.
  // Default: sort by createdAt descending (newest first).
  // When sorting by dueDate, null dates sort last via Prisma's default behavior.
  const sortField = query.sortBy || "createdAt";
  const sortOrder = query.order || "desc";
  const orderBy: Prisma.TaskOrderByWithRelationInput = {
    [sortField]: sortOrder,
  };

  return prisma.task.findMany({ where, orderBy });
}

/**
 * Retrieve a single task by its UUID.
 *
 * Uses findUniqueOrThrow so that Prisma automatically throws a P2025 error
 * when the task doesn't exist — our errorHandler middleware maps this to 404.
 *
 * @param id - UUID of the task to retrieve.
 * @returns The Task record.
 * @throws PrismaClientKnownRequestError (P2025) if task not found.
 */
export async function findById(id: string) {
  return prisma.task.findUniqueOrThrow({ where: { id } });
}

/**
 * Create a new task.
 *
 * The dueDate field arrives as an ISO string from the client; we convert it
 * to a Date object before persisting. All other fields pass through directly
 * because Prisma handles enum validation at the schema level.
 *
 * @param data - Validated creation payload.
 * @returns The newly created Task record (including server-generated fields).
 */
export async function create(data: CreateTaskInput) {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      // Convert ISO string to Date, or leave undefined to let the DB default apply.
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });
}

/**
 * Update an existing task with partial data.
 *
 * Why partial updates? The PUT endpoint accepts any subset of Task fields.
 * We only include fields that the client actually sent — Prisma ignores
 * `undefined` values, so omitted fields remain unchanged. Explicitly sending
 * `null` for dueDate or description clears those optional fields.
 *
 * @param id - UUID of the task to update.
 * @param data - Validated partial update payload.
 * @returns The updated Task record.
 * @throws PrismaClientKnownRequestError (P2025) if task not found.
 */
export async function update(id: string, data: UpdateTaskInput) {
  // Build the update payload, converting dueDate if provided.
  // null = clear the field; undefined = leave unchanged; string = set new value.
  const updateData: Prisma.TaskUpdateInput = {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.priority !== undefined && { priority: data.priority }),
  };

  // Handle dueDate separately because it needs Date conversion.
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }

  return prisma.task.update({ where: { id }, data: updateData });
}

/**
 * Delete a task by its UUID.
 *
 * Returns the deleted record so the controller can confirm what was removed.
 *
 * @param id - UUID of the task to delete.
 * @returns The deleted Task record.
 * @throws PrismaClientKnownRequestError (P2025) if task not found.
 */
export async function remove(id: string) {
  return prisma.task.delete({ where: { id } });
}

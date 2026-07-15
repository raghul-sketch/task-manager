/**
 * Async Handler Utility
 *
 * Wraps an async Express route handler so that any rejected promise is
 * automatically forwarded to the Express error-handling middleware via next().
 *
 * Without this wrapper, every async controller would need its own try/catch
 * block — a pattern that's error-prone and produces boilerplate.
 *
 * Usage:
 *   router.get("/tasks", asyncHandler(taskController.getAll));
 */

import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Resolve the promise; if it rejects, forward the error to Express.
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

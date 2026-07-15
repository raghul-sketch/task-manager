/**
 * Centralized Error Handler Middleware
 *
 * This is the single place where all unhandled errors in the Express pipeline
 * are caught and converted into a consistent JSON response. It MUST be
 * registered last in the middleware chain (after all routes).
 *
 * Error mapping strategy:
 * 1. Prisma "not found" errors → 404
 * 2. Zod validation errors → 400 (defensive; most are caught by validate middleware)
 * 3. Everything else → 500 with a generic message (never leaks stack traces)
 *
 * In production, you'd also log to an external service (Sentry, Datadog, etc.)
 * here. For this assignment, we log to stderr.
 */

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ErrorResponse } from "../types";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the full error to stderr for debugging.
  // In production, this would go to a logging service instead.
  console.error(`[ERROR] ${err.message}`, err.stack);

  // --- Prisma: record not found (e.g., getById with a non-existent UUID) ---
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    const response: ErrorResponse = { error: "Task not found" };
    res.status(404).json(response);
    return;
  }

  // --- Zod: validation failure (fallback — most caught by validate middleware) ---
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      error: "Validation failed",
      details: err.issues,
    };
    res.status(400).json(response);
    return;
  }

  // --- Catch-all: unexpected server errors ---
  // Never expose internal details to the client.
  const response: ErrorResponse = { error: "Internal server error" };
  res.status(500).json(response);
};

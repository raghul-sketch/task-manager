/**
 * Validation Middleware Factory
 *
 * Creates Express middleware that validates a specific part of the request
 * (body, query, or params) against a Zod schema. If validation fails,
 * responds with a 400 and a structured error body; otherwise, replaces
 * the request property with the parsed (and coerced) data and continues.
 *
 * Why replace the request property?
 * Zod's .parse() strips unknown fields and coerces types (e.g., string → enum).
 * By assigning the parsed result back, downstream handlers work with clean,
 * validated data and never touch raw user input.
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type RequestProperty = "body" | "query" | "params";

export const validate = (schema: ZodSchema, property: RequestProperty = "body") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate; on success, replace with cleaned data.
      const parsed = schema.parse(req[property]);
      // Assign the parsed (cleaned) data back to the request.
      // This ensures downstream handlers use validated data, not raw input.
      (req as Record<string, unknown>)[property] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Return a structured error matching our ErrorResponse interface.
        res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }
      // Non-Zod errors should be handled by the centralized error handler.
      next(error);
    }
  };
};

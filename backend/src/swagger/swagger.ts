/**
 * Swagger / OpenAPI Configuration
 *
 * Sets up swagger-jsdoc to scan JSDoc annotations in route files and generate
 * an OpenAPI 3.0 specification. The spec is then served via swagger-ui-express
 * at GET /api-docs.
 *
 * Reusable component schemas (Task, CreateTaskInput, UpdateTaskInput, ErrorResponse)
 * are defined here so route annotations can reference them via $ref.
 */

import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AvisaTech Task Management API",
      version: "1.0.0",
      description:
        "RESTful API for managing tasks. Built with Express, Prisma, and PostgreSQL as part of the AvisaTech Full Stack Developer Take-Home Assignment.",
      contact: {
        name: "AvisaTech Engineering",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Local development server",
      },
    ],
    components: {
      schemas: {
        /**
         * Full Task entity as returned by all endpoints.
         * This matches the Prisma Task model exactly.
         */
        Task: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Auto-generated UUID primary key",
              example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            },
            title: {
              type: "string",
              maxLength: 200,
              description: "Task title (required, max 200 chars)",
              example: "Update API Documentation",
            },
            description: {
              type: "string",
              maxLength: 2000,
              nullable: true,
              description: "Detailed task description (optional, max 2000 chars)",
              example: "Refresh the Swagger files and endpoints list.",
            },
            status: {
              type: "string",
              enum: ["TODO", "IN_PROGRESS", "DONE"],
              description: "Current workflow state",
              example: "IN_PROGRESS",
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH"],
              description: "Urgency level",
              example: "HIGH",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Optional deadline in ISO 8601 format",
              example: "2025-10-12T17:00:00.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Auto-set on creation",
              example: "2025-10-01T09:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Auto-updated on modification",
              example: "2025-10-05T14:30:00.000Z",
            },
          },
        },

        /** Request body for POST /api/tasks */
        CreateTaskInput: {
          type: "object",
          required: ["title"],
          properties: {
            title: {
              type: "string",
              minLength: 1,
              maxLength: 200,
              example: "Implement OAuth2 flow",
            },
            description: {
              type: "string",
              maxLength: 2000,
              nullable: true,
              example: "Add refresh token rotation and PKCE support.",
            },
            status: {
              type: "string",
              enum: ["TODO", "IN_PROGRESS", "DONE"],
              default: "TODO",
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH"],
              default: "MEDIUM",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: "2025-11-01T00:00:00.000Z",
            },
          },
        },

        /** Request body for PUT /api/tasks/:id (all fields optional) */
        UpdateTaskInput: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 1, maxLength: 200 },
            description: { type: "string", maxLength: 2000, nullable: true },
            status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
            dueDate: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },

        /** Standard error response shape used across all error codes */
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Human-readable error message",
              example: "Validation failed",
            },
            details: {
              type: "array",
              description: "Optional field-level validation errors",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "title" },
                  message: { type: "string", example: "Title is required" },
                },
              },
            },
          },
        },
      },
    },
  },
  // Tell swagger-jsdoc where to find the @swagger / @openapi annotations.
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

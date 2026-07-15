/**
 * Express Application Setup
 *
 * Configures the Express app with all middleware, routes, and Swagger docs.
 * This module exports the configured app instance so that server.ts can
 * bind it to a port, and tests can import it without starting a server.
 *
 * Middleware order matters:
 * 1. CORS — must be before any routes so preflight requests work.
 * 2. JSON body parser — must be before routes that read req.body.
 * 3. Application routes — the actual API endpoints.
 * 4. Error handler — MUST be last so it catches errors from all above.
 */

import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerSpec } from "./swagger/swagger";
import swaggerUi from "swagger-ui-express";

const app = express();

// --- Global Middleware ---

// Enable CORS for the frontend origin. The origin is configurable via .env
// so different environments (staging, production) can use different URLs.
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse JSON request bodies. The 10mb limit is generous for a task app,
// but prevents abuse from absurdly large payloads.
app.use(express.json({ limit: "10mb" }));

// --- Swagger Documentation ---
// Serve interactive API docs at /api-docs.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- API Routes ---
app.use("/api/tasks", taskRoutes);

// --- Health Check ---
// Simple endpoint for load balancers and uptime monitors.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Centralized Error Handler ---
// Must be registered AFTER all routes so it catches their errors.
app.use(errorHandler);

export default app;

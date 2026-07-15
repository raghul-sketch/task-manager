/**
 * Server Entry Point
 *
 * Loads environment variables and starts the Express server.
 * This is the file that `tsx watch` runs in development (see package.json scripts).
 *
 * Separated from app.ts so that:
 * - Tests can import `app` without starting a server.
 * - The listening logic is isolated and easy to modify (e.g., for graceful shutdown).
 */

import dotenv from "dotenv";

// Load .env BEFORE importing app, so process.env values are available
// when app.ts reads them (e.g., FRONTEND_ORIGIN for CORS).
dotenv.config();

import app from "./app";

const PORT = parseInt(process.env.PORT || "3001", 10);

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health\n`);
});

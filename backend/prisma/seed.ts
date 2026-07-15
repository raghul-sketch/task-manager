/**
 * Prisma Seed Script
 *
 * Inserts 6 realistic sample tasks that exercise the full range of the schema:
 * - All three statuses (TODO, IN_PROGRESS, DONE)
 * - All three priorities (LOW, MEDIUM, HIGH)
 * - Tasks with and without due dates
 * - Tasks with and without descriptions
 *
 * Run via: npx prisma db seed
 */

import { PrismaClient, TaskStatus, TaskPriority } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with sample tasks...");

  // Clear existing tasks to ensure idempotent seed runs.
  await prisma.task.deleteMany();

  const tasks = [
    {
      title: "Update API Documentation",
      description:
        "Refresh the Swagger/OpenAPI files and endpoints list to reflect the recent v2 changes to the user authentication module. Include updated request/response schemas and error codes.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date("2025-10-12T17:00:00Z"),
    },
    {
      title: "Setup Database Schema",
      description:
        "Define the PostgreSQL relations for the new multi-tenant dashboard and configure the Prisma migration scripts. Include indexes for common query patterns.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date("2025-10-15T17:00:00Z"),
    },
    {
      title: "Implement Zod Validation",
      description:
        "Add runtime schema validation for all incoming requests in the analytics microservice. Create reusable validator middleware with structured error responses.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
      dueDate: new Date("2025-10-18T17:00:00Z"),
    },
    {
      title: "Optimize Asset Pipeline",
      description:
        "Compress all static assets and configure Webpack for better tree-shaking on production builds.",
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      // No dueDate — exercises the optional field path
    },
    {
      title: "Configure CI/CD Pipeline",
      // No description — exercises the optional description field
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: new Date("2025-10-20T17:00:00Z"),
    },
    {
      title: "Write Unit Tests for Auth Service",
      description:
        "Cover the JWT generation, token refresh, and role-based access control flows with comprehensive unit tests. Target 90%+ branch coverage.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      // No dueDate — another null-date example
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log(`✅ Seeded ${tasks.length} tasks successfully.`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

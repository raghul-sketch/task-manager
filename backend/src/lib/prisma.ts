import { PrismaClient } from "@prisma/client";

// Single PrismaClient instance shared across the application.
// This prevents exhausting the database connection pool during hot-reloads.
const prisma = new PrismaClient();

export default prisma;

import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { beforeEach, vi } from "vitest";

// Import the real Prisma client instance
import prisma from "../lib/prisma";

// Mock the prisma module
vi.mock("../lib/prisma", () => ({
  default: mockDeep<PrismaClient>(),
}));

// Create a typed mock proxy
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

// Reset the mock before each test
beforeEach(() => {
  mockReset(prismaMock);
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../app";
import { prismaMock } from "./singleton";
import { TaskStatus, TaskPriority } from "@prisma/client";

// Ensure the mocked prisma returns predictable results for our route tests
describe("Task Routes API", () => {
  const mockTask = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "API Test Task",
    description: "API Description",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-10-10T00:00:00.000Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Basic mock implementations for common routes
    prismaMock.task.findMany.mockResolvedValue([mockTask]);
    prismaMock.task.findUniqueOrThrow.mockResolvedValue(mockTask);
    prismaMock.task.create.mockResolvedValue(mockTask);
    prismaMock.task.update.mockResolvedValue({ ...mockTask, status: TaskStatus.DONE });
    prismaMock.task.delete.mockResolvedValue(mockTask);
  });

  describe("GET /api/tasks", () => {
    it("should return a list of tasks", async () => {
      const response = await request(app).get("/api/tasks");
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe("API Test Task");
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should return a single task by ID", async () => {
      const response = await request(app).get(`/api/tasks/${mockTask.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.title).toBe("API Test Task");
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a task with valid payload", async () => {
      const payload = {
        title: "API Test Task",
        description: "API Description",
        status: "TODO",
        priority: "MEDIUM",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(payload)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("API Test Task");
    });

    it("should return 400 Bad Request on invalid payload (missing title)", async () => {
      const payload = {
        description: "Missing title",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(payload)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "title" }),
        ])
      );
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update a task with partial data", async () => {
      const response = await request(app)
        .put(`/api/tasks/${mockTask.id}`)
        .send({ status: "DONE" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("DONE");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      const response = await request(app).delete(`/api/tasks/${mockTask.id}`);
      
      expect(response.status).toBe(204);
    });
  });
});

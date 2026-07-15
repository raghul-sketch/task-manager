import { describe, it, expect } from "vitest";
import { prismaMock } from "./singleton";
import * as taskService from "../services/taskService";
import { TaskStatus, TaskPriority } from "@prisma/client";

describe("taskService", () => {
  const mockTask = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Test Task",
    description: "Test Description",
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-10-10"),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should create a new task", async () => {
    // Setup mock
    prismaMock.task.create.mockResolvedValue(mockTask);

    // Execute
    const result = await taskService.create({
      title: "Test Task",
      description: "Test Description",
      status: "TODO",
      priority: "HIGH",
      dueDate: "2025-10-10T00:00:00.000Z",
    });

    // Assert
    expect(result).toEqual(mockTask);
    expect(prismaMock.task.create).toHaveBeenCalledWith({
      data: {
        title: "Test Task",
        description: "Test Description",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date("2025-10-10T00:00:00.000Z"),
      },
    });
  });

  it("should find all tasks with default sorting", async () => {
    prismaMock.task.findMany.mockResolvedValue([mockTask]);

    const result = await taskService.findAll({});

    expect(result).toEqual([mockTask]);
    expect(prismaMock.task.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "desc" },
    });
  });

  it("should apply filters and sorting when finding all tasks", async () => {
    prismaMock.task.findMany.mockResolvedValue([mockTask]);

    await taskService.findAll({
      status: "IN_PROGRESS",
      sortBy: "dueDate",
      order: "asc",
    });

    expect(prismaMock.task.findMany).toHaveBeenCalledWith({
      where: { status: "IN_PROGRESS" },
      orderBy: { dueDate: "asc" },
    });
  });

  it("should update a task", async () => {
    const updatedTask = { ...mockTask, status: TaskStatus.DONE };
    prismaMock.task.update.mockResolvedValue(updatedTask);

    const result = await taskService.update(mockTask.id, { status: "DONE" });

    expect(result).toEqual(updatedTask);
    expect(prismaMock.task.update).toHaveBeenCalledWith({
      where: { id: mockTask.id },
      data: { status: "DONE" },
    });
  });

  it("should remove a task", async () => {
    prismaMock.task.delete.mockResolvedValue(mockTask);

    const result = await taskService.remove(mockTask.id);

    expect(result).toEqual(mockTask);
    expect(prismaMock.task.delete).toHaveBeenCalledWith({
      where: { id: mockTask.id },
    });
  });
});
